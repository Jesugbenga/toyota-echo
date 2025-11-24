'use client'

import { useState, useEffect } from 'react'
import { Upload, Loader2, CheckCircle2, AlertCircle, Clock, TrendingUp, Gauge, Target, Play, Database } from 'lucide-react'
import CSVUpload from './CSVUpload'
import PredictionResults from './PredictionResults'
import { generateMockTelemetryData, generateMockPredictions } from '@/lib/mockData'
import { loadRealDataset } from '@/lib/loadRealDataset'

export default function PredictionsPanel({ onDataUpload, onPredictions, onMetrics }) {
  const [uploadedData, setUploadedData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)
  const [useRealData, setUseRealData] = useState(false)

  // Try to load real dataset on component mount, fallback to mock
  useEffect(() => {
    loadRealDatasetData()
  }, [])

  const loadRealDatasetData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to load real dataset first
      const realData = await loadRealDataset()
      setUploadedData(realData)
      setUseRealData(true)
      setUseMockData(false)
      onDataUpload(realData)
      
      // Analyze the real data through the prediction API
      if (realData.data && realData.data.length > 0) {
        await runPrediction(realData.data)
      }
    } catch (err) {
      console.log('Real dataset not available, using mock data:', err)
      // Fallback to mock data if real dataset fails
      await loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = async () => {
    setUseMockData(true)
    setUseRealData(false)
    setLoading(true)
    setError(null)
    
    try {
      // Generate mock telemetry data
      const mockData = generateMockTelemetryData()
      setUploadedData(mockData)
      onDataUpload(mockData)
      
      // Actually analyze the mock data through the prediction API
      if (mockData.data && mockData.data.length > 0) {
        await runPrediction(mockData.data)
      } else {
        // Fallback to mock predictions if API fails
        const mockPredictions = generateMockPredictions()
        setPredictions(mockPredictions)
        onPredictions(mockPredictions)
      }
    } catch (err) {
      console.error('Mock data analysis error:', err)
      // Fallback to mock predictions if real analysis fails
      const mockPredictions = generateMockPredictions()
      setPredictions(mockPredictions)
      onPredictions(mockPredictions)
    } finally {
      setLoading(false)
    }
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
      // The API now handles both aggregated features and raw telemetry
      // Just pass through the data as-is - the API will detect the format
      const formattedData = telemetryData.map(record => {
        // Pass all fields - API will handle feature extraction
        const formatted = { ...record }
        
        // Ensure numeric values
        Object.keys(formatted).forEach(key => {
          if (typeof formatted[key] === 'string') {
            const num = parseFloat(formatted[key])
            if (!isNaN(num)) {
              formatted[key] = num
            }
          }
        })
        
        return formatted
      })

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formattedData }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Prediction failed' }))
        throw new Error(errorData.error || errorData.detail || 'Prediction failed')
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
      {/* Data Source Buttons */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-4">
        <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-3">
          Data Source
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRealDatasetData}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 ${
              useRealData
                ? 'bg-f1-red/30 border border-f1-red/50 text-white'
                : 'bg-f1-dark/50 border border-white/10 text-gray-400 hover:text-white hover:border-f1-red/30'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-sm font-orbitron uppercase tracking-wider">
              {useRealData ? 'Using Real Dataset' : 'Load Real Dataset'}
            </span>
          </button>
          <button
            onClick={loadMockData}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 ${
              useMockData
                ? 'bg-f1-accent/30 border border-f1-accent/50 text-white'
                : 'bg-f1-dark/50 border border-white/10 text-gray-400 hover:text-white hover:border-f1-accent/30'
            }`}
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-orbitron uppercase tracking-wider">
              {useMockData ? 'Using Mock Data' : 'Load Mock Data'}
            </span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {useRealData 
            ? 'Loaded from frontend_demo_dataset.csv' 
            : useMockData 
            ? 'Using synthetic telemetry data' 
            : 'Select a data source to begin'}
        </p>
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
