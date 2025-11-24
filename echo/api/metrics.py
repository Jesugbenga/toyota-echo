from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum
from typing import List, Dict
import numpy as np
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryRecord(BaseModel):
    accx_can: float
    accy_can: float
    ath: float
    pbrake_r: float
    pbrake_f: float
    gear: float
    Steering_Angle: float = None
    steering: float = None
    Speed: float = None
    speed: float = None

class MetricsRequest(BaseModel):
    data: List[TelemetryRecord]

def compute_steering_stability(steering_data: np.ndarray) -> float:
    """Compute steering stability variance (lower is better)"""
    if len(steering_data) < 2:
        return 100.0
    
    # Compute variance and normalize
    variance = np.var(steering_data)
    # Normalize to 0-100 scale (assuming max variance of 10000)
    stability = max(0, min(100, 100 - (variance / 100)))
    return float(stability)

def compute_braking_smoothness(brake_data: np.ndarray) -> float:
    """Compute braking smoothness index (higher is better)"""
    if len(brake_data) < 2:
        return 50.0
    
    # Compute rate of change (derivative)
    changes = np.diff(brake_data)
    # Smooth braking has smaller changes
    smoothness = max(0, min(100, 100 - np.std(changes) * 2))
    return float(smoothness)

def compute_acceleration_aggressiveness(accx_data: np.ndarray, accy_data: np.ndarray) -> float:
    """Compute acceleration aggressiveness (0-100)"""
    if len(accx_data) < 1:
        return 50.0
    
    # Combine longitudinal and lateral acceleration
    total_acc = np.sqrt(accx_data**2 + accy_data**2)
    # Aggressiveness based on max and mean acceleration
    max_acc = np.max(total_acc)
    mean_acc = np.mean(total_acc)
    
    # Normalize to 0-100 (assuming max of 20 m/s²)
    aggressiveness = min(100, (max_acc / 20) * 100)
    return float(aggressiveness)

def compute_speed_consistency(speed_data: np.ndarray) -> float:
    """Compute speed consistency (higher is better)"""
    if len(speed_data) < 2:
        return 50.0
    
    # Coefficient of variation (lower is better)
    mean_speed = np.mean(speed_data)
    if mean_speed == 0:
        return 0.0
    
    cv = np.std(speed_data) / mean_speed
    # Convert to consistency score (0-100)
    consistency = max(0, min(100, 100 - (cv * 100)))
    return float(consistency)

def analyze_corner_behavior(data: List[Dict]) -> Dict:
    """Analyze corner entry vs exit behavior"""
    if len(data) < 10:
        return {"entry_score": 50.0, "exit_score": 50.0, "analysis": "Insufficient data"}
    
    df = pd.DataFrame(data)
    
    # Get steering and speed
    steering = df.get('Steering_Angle') or df.get('steering', 0)
    speed = df.get('Speed') or df.get('speed', 0)
    accx = df.get('accx_can', 0)
    
    # Identify corners (high steering angle)
    corner_threshold = np.percentile(steering, 75)
    is_corner = steering > corner_threshold
    
    if not is_corner.any():
        return {"entry_score": 50.0, "exit_score": 50.0, "analysis": "No significant corners detected"}
    
    # Find corner entry and exit points
    corner_indices = np.where(is_corner)[0]
    if len(corner_indices) == 0:
        return {"entry_score": 50.0, "exit_score": 50.0, "analysis": "No corners detected"}
    
    # Entry: speed reduction before corner
    entry_speeds = []
    for idx in corner_indices:
        if idx > 0:
            entry_speeds.append(speed.iloc[idx-1] if hasattr(speed, 'iloc') else speed[idx-1])
    
    # Exit: speed recovery after corner
    exit_speeds = []
    for idx in corner_indices:
        if idx < len(speed) - 1:
            exit_speeds.append(speed.iloc[idx+1] if hasattr(speed, 'iloc') else speed[idx+1])
    
    # Score based on speed management
    entry_score = 50.0
    exit_score = 50.0
    
    if entry_speeds:
        # Good entry = appropriate speed reduction
        avg_entry_speed = np.mean(entry_speeds)
        avg_corner_speed = np.mean([speed.iloc[i] if hasattr(speed, 'iloc') else speed[i] for i in corner_indices])
        if avg_entry_speed > avg_corner_speed:
            entry_score = 75.0  # Good speed reduction
    
    if exit_speeds:
        # Good exit = speed recovery
        avg_exit_speed = np.mean(exit_speeds)
        avg_corner_speed = np.mean([speed.iloc[i] if hasattr(speed, 'iloc') else speed[i] for i in corner_indices])
        if avg_exit_speed > avg_corner_speed:
            exit_score = 75.0  # Good speed recovery
    
    return {
        "entry_score": float(entry_score),
        "exit_score": float(exit_score),
        "analysis": "Corner analysis completed"
    }

@app.post("/api/metrics")
async def compute_metrics(request: MetricsRequest):
    """
    Compute driver behavior metrics from telemetry data.
    Returns comprehensive behavioral analysis.
    """
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Convert to list of dicts
        records = []
        for record in request.data:
            rec_dict = record.dict()
            # Normalize column names
            if 'Steering_Angle' not in rec_dict and 'steering' in rec_dict:
                rec_dict['Steering_Angle'] = rec_dict['steering']
            if 'Speed' not in rec_dict and 'speed' in rec_dict:
                rec_dict['Speed'] = rec_dict['speed']
            records.append(rec_dict)
        
        df = pd.DataFrame(records)
        
        # Extract arrays
        steering = df.get('Steering_Angle', df.get('steering', 0)).values
        speed = df.get('Speed', df.get('speed', 0)).values
        brake_total = (df.get('pbrake_f', 0) + df.get('pbrake_r', 0)).values
        accx = df.get('accx_can', 0).values
        accy = df.get('accy_can', 0).values
        
        # Compute metrics
        steering_stability = compute_steering_stability(steering)
        braking_smoothness = compute_braking_smoothness(brake_total)
        acceleration_aggressiveness = compute_acceleration_aggressiveness(accx, accy)
        speed_consistency = compute_speed_consistency(speed)
        
        # Corner analysis
        corner_analysis = analyze_corner_behavior(records)
        
        # Overall scores
        smoothness = (steering_stability + braking_smoothness) / 2
        consistency = speed_consistency
        corner_handling = (corner_analysis['entry_score'] + corner_analysis['exit_score']) / 2
        aggressiveness = acceleration_aggressiveness
        
        return {
            "metrics": {
                "steering_stability": steering_stability,
                "braking_smoothness": braking_smoothness,
                "acceleration_aggressiveness": acceleration_aggressiveness,
                "speed_consistency": speed_consistency
            },
            "scores": {
                "smoothness": float(smoothness),
                "consistency": float(consistency),
                "corner_handling": float(corner_handling),
                "aggressiveness": float(aggressiveness)
            },
            "corner_analysis": corner_analysis,
            "summary": {
                "total_data_points": len(records),
                "avg_speed": float(np.mean(speed)),
                "max_speed": float(np.max(speed)),
                "avg_steering": float(np.mean(np.abs(steering)))
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics computation error: {str(e)}")

# Vercel serverless handler
handler = Mangum(app)

