'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PredictionsPanel from '@/components/predictions/PredictionsPanel'
import TelemetryExplorer from '@/components/telemetry/TelemetryExplorer'
import InsightsConsole from '@/components/insights/InsightsConsole'
import BehaviorScorecard from '@/components/scorecard/BehaviorScorecard'

export default function Home() {
  const [activeTab, setActiveTab] = useState('predictions')
  const [telemetryData, setTelemetryData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [metrics, setMetrics] = useState(null)

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
          <div className="space-y-8">
            <TelemetryExplorer data={telemetryData} />
            <BehaviorScorecard data={telemetryData} onMetrics={handleMetrics} />
          </div>
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
