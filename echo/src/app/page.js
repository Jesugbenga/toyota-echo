'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PredictionsPanel from '@/components/predictions/PredictionsPanel'
import TelemetryExplorer from '@/components/telemetry/TelemetryExplorer'
import InsightsConsole from '@/components/insights/InsightsConsole'
import { generateMockTelemetryData, generateMockMetrics } from '@/lib/mockData'

export default function Home() {
  const [activeTab, setActiveTab] = useState('predictions')
  const [telemetryData, setTelemetryData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [metrics, setMetrics] = useState(null)

  // Auto-load mock data on mount for demonstration
  useEffect(() => {
    const mockData = generateMockTelemetryData()
    setTelemetryData(mockData)
    
    // Also set mock metrics for the scorecard
    const mockMetrics = generateMockMetrics()
    setMetrics(mockMetrics)
  }, [])

  const handleDataUpload = (data) => {
    setTelemetryData(data)
  }

  const handlePredictions = (predData) => {
    setPredictions(predData)
  }

  const handleMetrics = (metricsData) => {
    setMetrics(metricsData)
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-8">
        {activeTab === 'predictions' && (
          <PredictionsPanel
            onDataUpload={handleDataUpload}
            onPredictions={handlePredictions}
          />
        )}
        {activeTab === 'analysis' && (
          <TelemetryExplorer data={telemetryData} />
        )}
        {activeTab === 'insights' && (
          <InsightsConsole
            telemetryData={telemetryData}
            predictions={predictions}
            metrics={metrics}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
