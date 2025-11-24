'use client'

import { useState, useEffect } from 'react'
import { Upload, Loader2, CheckCircle2, AlertCircle, Clock, TrendingUp, Gauge, Target, Play } from 'lucide-react'
import CSVUpload from './CSVUpload'
import PredictionResults from './PredictionResults'
import { generateMockTelemetryData, generateMockPredictions } from '@/lib/mockData'

export default function PredictionsPanel({ onDataUpload, onPredictions }) {
  const [uploadedData, setUploadedData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)

  // Load mock data on component mount for demonstration
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = async () => {
    setUseMockData(true)
    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData = generateMockTelemetryData()
    setUploadedData(mockData)
    onDataUpload(mockData)
    
    // Generate mock predictions
    const mockPredictions = generateMockPredictions()
    setPredictions(mockPredictions)
    onPredictions(mockPredictions)
    
    setLoading(false)
  }

  const handleUploadSuccess = async (data) => {
    setUseMockData(false)
    setUploadedData(data)
    setError(null)
    onDataUpload(data)
    
    // Automatically run prediction
    if (data.data && data.data.length > 0) {
      await runPrediction(data.data)
    }
  }

  const runPrediction = async (telemetryData) => {
    setLoading(true)
    setError(null)
    
    try {
      const formattedData = telemetryData.map(record => ({
        accx_can: record.accx_can || 0,
        accy_can: record.accy_can || 0,
        ath: record.ath || 0,
        pbrake_r: record.pbrake_r || 0,
        pbrake_f: record.pbrake_f || 0,
        gear: record.gear || 0,
        Steering_Angle: record.Steering_Angle || record.steering || 0,
        Speed: record.Speed || record.speed || 0,
      }))

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formattedData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Prediction failed')
      }

      const result = await response.json()
      setPredictions(result)
      onPredictions(result)
    } catch (err) {
      setError(err.message)
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Button */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-1">
            Demo Mode
          </h3>
          <p className="text-xs text-gray-400">
            {useMockData ? 'Using mock telemetry data' : 'Load sample data to preview charts'}
          </p>
        </div>
        <button
          onClick={loadMockData}
          disabled={loading}
          className="px-4 py-2 bg-f1-accent/20 hover:bg-f1-accent/30 border border-f1-accent/30 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 text-f1-accent" />
          <span className="text-sm font-orbitron text-f1-accent uppercase tracking-wider">
            Load Mock Data
          </span>
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-6">
        <CSVUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-orbitron text-red-400 uppercase tracking-wider mb-1">Error</h3>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-f1-red" />
            <p className="text-sm font-orbitron text-gray-400 uppercase tracking-wider">Processing Telemetry</p>
          </div>
        </div>
      )}

      {/* Results */}
      {predictions && !loading && (
        <PredictionResults predictions={predictions} />
      )}

      {/* Upload Success */}
      {uploadedData && !loading && (
        <div className="bg-f1-accent/10 border border-f1-accent/30 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-f1-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-orbitron text-f1-accent uppercase tracking-wider">
              {uploadedData.stats?.total_rows || 0} data points processed
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
