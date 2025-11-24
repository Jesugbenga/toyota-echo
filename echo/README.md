# Echo: Intelligent Race Performance Analytics Dashboard

Echo is an AI-powered racing analytics dashboard that combines ML predictions, real-time data visualization, and Gemini-powered insights into a single integrated system.

## Features

- **Pre-Event Lap Time Prediction**: XGBoost model predicts expected lap performance
- **Post-Event Analysis**: Comprehensive behavioral metrics and telemetry visualization
- **Gemini AI Insights**: Conversational interface for expert-level commentary
- **Interactive Dashboards**: Real-time charts and scorecards

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python 3.11, XGBoost
- **Deployment**: Vercel (Serverless Functions)
- **AI**: Google Gemini API

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11
- Vercel account (for deployment)
- Gemini API key

### Installation

1. **Install dependencies**:

   ```bash
   cd echo
   npm install
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Add your trained model**:
   - Place your trained XGBoost model at `echo/api/model/model.pkl`
   - Optionally include a scaler at `echo/api/model/scaler.pkl`

4. **Run development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
echo/
├── api/                    # Vercel serverless functions
│   ├── predict.py         # ML prediction endpoint
│   ├── metrics.py         # Behavior metrics computation
│   ├── upload.py          # CSV upload and validation
│   ├── insights.py        # Gemini AI insights
│   └── model/             # Trained model files
│       └── model.pkl
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   └── components/
│       ├── dashboard/     # Layout and navigation
│       ├── predictions/   # Prediction panel
│       ├── telemetry/     # Telemetry explorer
│       ├── scorecard/     # Behavior scorecard
│       └── insights/      # AI insights console
├── public/                # Static assets
├── package.json
├── requirements.txt
└── vercel.json           # Vercel configuration
```

## API Endpoints

### `/api/upload`

Upload and validate telemetry CSV file.

**Method**: POST  
**Body**: multipart/form-data with `file` field

**Response**:

```json
{
  "success": true,
  "stats": {...},
  "data": [...],
  "feature_count": 1000
}
```

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
  "behavior_pattern": {...}
}
```

### `/api/metrics`

Compute driver behavior metrics.

**Method**: POST  
**Body**: Same as `/api/predict`

**Response**:

```json
{
  "metrics": {...},
  "scores": {
    "smoothness": 82.5,
    "consistency": 78.3,
    "corner_handling": 75.0,
    "aggressiveness": 65.2
  },
  "corner_analysis": {...}
}
```

### `/api/insights`

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

## CSV Format

Your telemetry CSV should include these columns:

- `accx_can` - Longitudinal acceleration
- `accy_can` - Lateral acceleration
- `ath` - Throttle position
- `pbrake_r` - Rear brake pressure
- `pbrake_f` - Front brake pressure
- `gear` - Gear position
- `Steering_Angle` - Steering angle (or `steering`)
- `Speed` - Vehicle speed (or `speed`)

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `GEMINI_API_KEY`

4. **Upload model files**:
   - The model files in `api/model/` will be included in deployment
   - For large models (>50MB), consider using external storage

### Model Storage Options

- **Option 1**: Include in repo (if < 50MB) - works for Vercel
- **Option 2**: Use Git LFS for larger models
- **Option 3**: Store in S3/Cloud Storage and download on cold start

## Development

### Running Locally

```bash
# Frontend
npm run dev

# Backend (for local testing)
# Note: API routes run via Vercel serverless in production
# For local testing, you may need to run FastAPI separately
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Model Not Found

- Ensure `model.pkl` is in `api/model/`
- Check file paths in `predict.py`
- For Vercel, model must be in the deployment

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check API quota/limits
- Ensure network connectivity

### CSV Upload Issues

- Verify column names match expected format
- Check for missing or invalid data
- Ensure CSV is properly formatted

## License

[Your License Here]

## Contributing

[Contributing Guidelines]
