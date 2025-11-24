# Toyota Echo: Intelligent Race Performance Analytics Dashboard

A comprehensive web dashboard for predicting and analyzing racing performance using machine learning, real-time telemetry visualization, and AI-powered insights. Built for Toyota Racing Development to analyze driver performance, predict lap times, and provide actionable racing insights.

## 🏎️ Overview

Echo is an AI-powered racing analytics platform that combines:
- **Pre-Event Lap Time Prediction**: XGBoost ML model predicts expected lap performance before races
- **Post-Event Analysis**: Comprehensive behavioral metrics and telemetry visualization
- **Gemini AI Insights**: Conversational interface for expert-level race engineering commentary
- **Interactive Dashboards**: Real-time charts, scorecards, and data exploration

## ✨ Features

### 1. **Lap Time Prediction**
- XGBoost model trained on multi-track racing data
- Real-time predictions from telemetry input
- Consistency scoring and behavior pattern analysis
- Peak speed and performance metrics

### 2. **Telemetry Analysis**
- Interactive data visualization with Recharts
- Real-time telemetry exploration
- Speed, throttle, brake, and steering analysis
- Corner-by-corner performance breakdown

### 3. **Driver Behavior Metrics**
- Cornering aggression scoring
- Braking intensity analysis
- Throttle consistency metrics
- Overall driver rating system

### 4. **AI-Powered Insights**
- Conversational interface powered by Google Gemini
- Adaptive responses (simple questions get concise answers)
- Context-aware analysis using telemetry, predictions, and metrics
- Actionable recommendations for performance improvement

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (Vercel Serverless Functions)
- **ML Model**: XGBoost (Python-trained, JSON format)
- **AI**: Google Gemini API (Gemini 2.5 Flash)

### Deployment
- **Platform**: Vercel
- **Functions**: Serverless API routes

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for model training/development)
- Vercel account (for deployment)
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd toyota-echo
```

### 2. Install Dependencies

```bash
cd echo
npm install
```

For Python dependencies (if working with model training):
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the `echo/` directory:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Add Trained Model Files

Place your trained model files in `echo/model/`:
- `final_xgboost_model.json` - XGBoost model
- `final_scaler.pkl` - Feature scaler (optional)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
toyota-echo/
├── echo/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/              # Next.js API routes
│   │   │   │   ├── ask/         # Gemini AI insights
│   │   │   │   ├── predict/     # Lap time prediction
│   │   │   │   ├── metrics/     # Behavior metrics
│   │   │   │   ├── upload/      # CSV upload
│   │   │   │   └── load-dataset/# Dataset loading
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── dashboard/       # Main layout
│   │       ├── predictions/     # Prediction panel
│   │       ├── telemetry/       # Telemetry explorer
│   │       ├── scorecard/       # Behavior scorecard
│   │       └── insights/        # AI insights console
│   ├── model/                   # Trained ML models
│   │   ├── final_xgboost_model.json
│   │   ├── final_scaler.pkl
│   │   └── frontend_demo_dataset.csv
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── requirements.txt
│   ├── next.config.js
│   └── vercel.json
└── README.md
```

## 🔧 Data Challenges & Solutions

During development, several data quality challenges were encountered and addressed:

### 1. **Inconsistent Data**
**Problem**: Data collected from multiple sources with varying formats, missing fields, and inconsistent naming conventions.

**Solutions**:
- Implemented flexible feature extraction that handles multiple column name variations
- Priority-based value selection (raw > calculated > aggregated > derived)
- Fallback mechanisms for missing data points

### 2. **Extremely High Lap Times**
**Problem**: Some records had unrealistic lap times (e.g., 500+ seconds), likely from data collection errors or incomplete laps.

**Solutions**:
- Implemented reasonable bounds checking (typical lap times: 60-180 seconds)
- Statistical outlier detection using IQR (Interquartile Range) method
- Filtered out laps exceeding 3 standard deviations from the mean

### 3. **Zero Lap Times**
**Problem**: Many records had lap times of exactly 0, indicating incomplete data or collection failures.

**Solutions**:
- Filtered out all records with zero or null lap times
- Validation checks before model training
- Warning system for incomplete data in the UI

### 4. **Outliers in Telemetry Data**
**Problem**: Sensor errors, transmission glitches, and data corruption created extreme values in telemetry channels.

**Solutions**:
- Z-score normalization with outlier clipping (±3 standard deviations)
- Min-max scaling with reasonable bounds per sensor type
- Median-based aggregation for robust statistics

### 5. **Unrealistic Lap Numbers**
**Problem**: Some datasets had lap numbers in the thousands, indicating data collection or indexing errors.

**Solutions**:
- Bounded lap number validation (typically 1-100 for a session)
- Session-based grouping to reset lap counters
- Filtered out records with invalid lap numbers

### 6. **Multi-Track Training**
**Problem**: Training a single model to work across multiple tracks with different characteristics (length, corners, elevation).

**Solutions**:
- Added track-specific features: `track_length`, `track_corners`, `track_elevation`
- Track-aware feature engineering in the model
- Normalized features by track characteristics
- Ensured balanced representation of all tracks in training data

### Data Preprocessing Pipeline

The final preprocessing pipeline includes:

1. **Data Cleaning**:
   - Remove zero/null lap times
   - Filter unrealistic lap numbers
   - Remove extreme outliers (3σ rule)

2. **Feature Engineering**:
   - Aggregate statistics (mean, std, max) for each telemetry channel
   - Calculate derived metrics (cornering aggression, braking intensity)
   - Normalize by track characteristics

3. **Validation**:
   - Bounds checking for all features
   - Consistency checks between related metrics
   - Data quality scoring

## 🤖 Model Training

### Model Architecture
- **Algorithm**: XGBoost Regressor
- **Target**: Lap time prediction (seconds)
- **Features**: 27 engineered features including:
  - Telemetry aggregations (mean, std, max)
  - Driver behavior metrics
  - Track characteristics

### Training Considerations

1. **Multi-Track Support**: Model trained on data from multiple tracks with track-specific features
2. **Outlier Handling**: Robust preprocessing to handle sensor errors and data corruption
3. **Feature Engineering**: Aggregated statistics from raw telemetry to capture driving patterns
4. **Validation**: Cross-validation with track-based splitting to ensure generalization

### Model Files
- `final_xgboost_model.json`: Trained XGBoost model
- `final_scaler.pkl`: Feature scaler for normalization

**Note**: Currently, the frontend uses a heuristic approximation. See `MODEL_INTEGRATION_STATUS.md` for details on integrating the actual XGBoost model.

## 📡 API Endpoints

### `/api/predict`
Predict lap time from telemetry data.

**Method**: POST  
**Body**:
```json
{
  "data": [
    {
      "accx_can": 0.5,
      "accy_can": 0.3,
      "ath": 75,
      "pbrake_r": 10,
      "pbrake_f": 15,
      "gear": 3,
      "Steering_Angle": 5,
      "Speed": 120
    }
  ]
}
```

**Response**:
```json
{
  "predicted_lap_time": 95.234,
  "consistency_score": 85.5,
  "predicted_peak_speed": 145.2,
  "behavior_pattern": {
    "avg_speed": 88.82,
    "avg_brake_pressure": 10.49,
    "avg_throttle": 56.07,
    "braking_intensity": "low",
    "acceleration_aggressiveness": "medium"
  }
}
```

### `/api/metrics`
Compute driver behavior metrics.

**Method**: POST  
**Body**: Same as `/api/predict`

**Response**:
```json
{
  "metrics": {
    "cornering_aggression": 65.2,
    "braking_intensity": 45.8,
    "throttle_consistency": 78.3,
    "speed_consistency": 82.1,
    "overall_rating": 72.9
  },
  "scores": {
    "smoothness": 82.5,
    "consistency": 78.3,
    "corner_handling": 75.0,
    "aggressiveness": 65.2
  }
}
```

### `/api/ask`
Get AI-powered insights from Gemini.

**Method**: POST  
**Body**:
```json
{
  "question": "Where did the driver lose the most time?",
  "data_summary": "...",
  "predictions": {...},
  "metrics": {...}
}
```

**Response**:
```json
{
  "response": "AI-generated insights...",
  "key_findings": [...]
}
```

### `/api/upload`
Upload and validate telemetry CSV file.

**Method**: POST  
**Body**: multipart/form-data with `file` field

## 📊 CSV Format

Your telemetry CSV should include these columns:

- `accx_can` - Longitudinal acceleration
- `accy_can` - Lateral acceleration
- `ath` - Throttle position (0-100)
- `pbrake_r` - Rear brake pressure
- `pbrake_f` - Front brake pressure
- `gear` - Gear position
- `Steering_Angle` or `steering` - Steering angle
- `Speed` or `speed` - Vehicle speed
- `nmot` - Engine RPM (optional)
- `actual_lap_time` - Actual lap time in seconds (for validation)

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd echo
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key

4. **Model Files**:
   - Model files in `api/model/` are included in deployment
   - For large models (>50MB), consider using external storage or Git LFS

### Model Storage Options

- **Option 1**: Include in repo (if < 50MB) - works for Vercel
- **Option 2**: Use Git LFS for larger models
- **Option 3**: Store in S3/Cloud Storage and download on cold start

## 🐛 Troubleshooting

### Model Not Found
- Ensure model files are in `echo/model/`
- Check file paths in API routes
- For Vercel, model must be included in deployment

### Gemini API Errors
- Verify `GEMINI_API_KEY` is set correctly in `.env.local`
- Restart dev server after adding environment variable
- Check API quota/limits at [Google AI Studio](https://aistudio.google.com/)
- For Vercel: Set environment variable in dashboard and redeploy

### CSV Upload Issues
- Verify column names match expected format
- Check for missing or invalid data
- Ensure CSV is properly formatted (no extra headers)
- Check browser console for detailed error messages

### Data Quality Issues
- Review data preprocessing steps above
- Check for outliers and invalid values
- Ensure consistent data formats across tracks
- Validate lap times are in reasonable range (60-180 seconds)

### Predictions Seem Inaccurate
- Current implementation uses heuristic approximation
- See `MODEL_INTEGRATION_STATUS.md` for real model integration
- Compare predictions to `predicted_lap_time` in dataset if available

## 📚 Additional Documentation

- `echo/GEMINI_SETUP.md` - Detailed Gemini API setup guide
- `echo/MODEL_INTEGRATION_STATUS.md` - Model integration status and options
- `echo/METRICS_EXPLANATION.md` - Behavior metrics documentation

## 🎯 Future Improvements

- [ ] Integrate actual XGBoost model via ONNX conversion
- [ ] Real-time telemetry streaming
- [ ] Multi-driver comparison
- [ ] Historical performance tracking
- [ ] Advanced outlier detection UI
- [ ] Track-specific model variants
- [ ] Export reports (PDF/CSV)

## 📝 License

MIT License

## 👥 Contributing

[Contributing Guidelines]

---

**Built for Toyota Racing Development** 🏎️
