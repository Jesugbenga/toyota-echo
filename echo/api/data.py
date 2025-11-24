from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file path - handle Vercel environment
DATA_PATH = os.path.join(os.path.dirname(__file__), 'model', 'sonoma_processed.csv')
df = None

def load_data():
    """Lazy load data file"""
    global df
    if df is None:
        try:
            if os.path.exists(DATA_PATH):
                df = pd.read_csv(DATA_PATH)
            else:
                # Try alternative paths
                alt_paths = [
                    '/var/task/api/model/sonoma_processed.csv',
                    './api/model/sonoma_processed.csv',
                ]
                for path in alt_paths:
                    if os.path.exists(path):
                        df = pd.read_csv(path)
                        break
                if df is None:
                    raise FileNotFoundError("Data file not found")
        except Exception as e:
            raise Exception(f"Failed to load data: {str(e)}")
    return df

@app.get("/api/data/driver/{driver_id}")
def get_driver(driver_id: str):
    """Get driver data by ID"""
    try:
        data = load_data()
        if 'driver_id' not in data.columns:
            raise HTTPException(status_code=400, detail="driver_id column not found in data")
        result = data[data["driver_id"] == driver_id]
        if result.empty:
            raise HTTPException(status_code=404, detail=f"Driver {driver_id} not found")
        return result.to_dict(orient="records")
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Data file not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel serverless handler
handler = Mangum(app)
