from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import pandas as pd
import io
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expected columns from TRD telemetry
REQUIRED_COLUMNS = [
    'accx_can', 'accy_can', 'ath', 'pbrake_r', 
    'pbrake_f', 'gear', 'Steering_Angle', 'Speed'
]

# Alternative column name mappings
COLUMN_MAPPING = {
    'steering_angle': 'Steering_Angle',
    'steering': 'Steering_Angle',
    'speed': 'Speed',
    'accx': 'accx_can',
    'accy': 'accy_can',
    'throttle': 'ath',
    'brake_r': 'pbrake_r',
    'brake_f': 'pbrake_f',
}

def normalize_column_names(df):
    """Normalize column names to match expected format"""
    df.columns = df.columns.str.strip()
    df.columns = df.columns.str.replace(' ', '_')
    
    # Apply mapping
    df = df.rename(columns=COLUMN_MAPPING)
    return df

def validate_and_extract_features(df):
    """Validate CSV structure and extract features"""
    df = normalize_column_names(df)
    
    # Check for required columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Extract only required columns
    features_df = df[REQUIRED_COLUMNS].copy()
    
    # Convert to numeric, handling any non-numeric values
    for col in features_df.columns:
        features_df[col] = pd.to_numeric(features_df[col], errors='coerce')
    
    # Drop rows with NaN values
    features_df = features_df.dropna()
    
    if len(features_df) == 0:
        raise ValueError("No valid data rows after processing")
    
    return features_df

@app.post("/api/upload")
async def upload_telemetry(file: UploadFile = File(...)):
    """
    Upload and validate telemetry CSV file.
    Returns structured data for frontend processing.
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Parse CSV
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
        
        # Validate and extract features
        features_df = validate_and_extract_features(df)
        
        # Compute basic statistics
        stats = {
            'total_rows': len(features_df),
            'columns': list(features_df.columns),
            'summary_stats': features_df.describe().to_dict(),
            'data_preview': features_df.head(10).to_dict(orient='records')
        }
        
        # Convert to list of records for processing
        records = features_df.to_dict(orient='records')
        
        return {
            "success": True,
            "message": "File uploaded and validated successfully",
            "stats": stats,
            "data": records,
            "feature_count": len(records)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Vercel serverless handler
handler = Mangum(app)

