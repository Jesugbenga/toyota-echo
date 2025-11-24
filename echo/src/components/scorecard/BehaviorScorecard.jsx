'use client'

import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { generateMockMetrics } from '@/lib/mockData'

export default function BehaviorScorecard({ data, onMetrics, metrics: externalMetrics }) {
  const [metrics, setMetrics] = useState(externalMetrics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-load mock metrics if no data provided
  useEffect(() => {
    if (!externalMetrics && !data) {
      const mockMetrics = generateMockMetrics()
      setMetrics(mockMetrics)
      onMetrics?.(mockMetrics)
    }
  }, [])

  useEffect(() => {
    if (data && !metrics && !loading) {
      computeMetrics()
    }
  }, [data])

  useEffect(() => {
    if (externalMetrics) {
      setMetrics(externalMetrics)
    }
  }, [externalMetrics])

  const computeMetrics = async () => {
    if (!data?.data || !Array.isArray(data.data)) return

    setLoading(true)
    setError(null)

    try {
      // Format data for API
      const formattedData = data.data.map((record) => ({
        accx_can: record.accx_can || 0,
        accy_can: record.accy_can || 0,
        ath: record.ath || 0,
        pbrake_r: record.pbrake_r || 0,
        pbrake_f: record.pbrake_f || 0,
        gear: record.gear || 0,
        Steering_Angle: record.Steering_Angle || record.steering || 0,
        Speed: record.Speed || record.speed || 0,
      }))

      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formattedData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Metrics computation failed')
      }

      const result = await response.json()
      setMetrics(result)
      onMetrics?.(result)
    } catch (err) {
      setError(err.message)
      console.error('Metrics error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show metrics even without data (using mock data)
  if (!metrics && !data) {
    return (
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-2">
          No Data Available
        </h3>
        <p className="text-xs text-gray-400">
          Upload telemetry data to compute behavior metrics.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Computing behavior metrics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <button
          onClick={computeMetrics}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Compute Metrics
        </button>
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  // Prepare data for radar chart
  const radarData = [
    {
      metric: 'Smoothness',
      score: metrics.scores?.smoothness || 0,
      fullMark: 100,
    },
    {
      metric: 'Consistency',
      score: metrics.scores?.consistency || 0,
      fullMark: 100,
    },
    {
      metric: 'Corner Handling',
      score: metrics.scores?.corner_handling || 0,
      fullMark: 100,
    },
    {
      metric: 'Aggressiveness',
      score: metrics.scores?.aggressiveness || 0,
      fullMark: 100,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Driver Behavior Scorecard
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of driving behavior and performance metrics
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Overview
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#0284c7"
              fill="#0284c7"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metrics.scores || {}).map(([key, value]) => (
          <div
            key={key}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
              {key.replace('_', ' ')}
            </h4>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {value.toFixed(1)}
              </span>
              <span className="text-gray-500">/ 100</span>
            </div>
            <div
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                value
              )}`}
            >
              {getScoreLabel(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Steering Stability</div>
            <div className="text-xl font-bold text-gray-900">
              {metrics.metrics?.steering_stability?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Braking Smoothness</div>
            <div className="text-xl font-bold text-gray-900">
              {metrics.metrics?.braking_smoothness?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Acceleration Aggressiveness</div>
            <div className="text-xl font-bold text-gray-900">
              {metrics.metrics?.acceleration_aggressiveness?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Speed Consistency</div>
            <div className="text-xl font-bold text-gray-900">
              {metrics.metrics?.speed_consistency?.toFixed(1) || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Corner Analysis */}
      {metrics.corner_analysis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Corner Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Corner Entry Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.corner_analysis.entry_score.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Corner Exit Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.corner_analysis.exit_score.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {metrics.summary && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Data Points</div>
              <div className="font-semibold text-gray-900">
                {metrics.summary.total_data_points}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Avg Speed</div>
              <div className="font-semibold text-gray-900">
                {metrics.summary.avg_speed.toFixed(1)} mph
              </div>
            </div>
            <div>
              <div className="text-gray-600">Max Speed</div>
              <div className="font-semibold text-gray-900">
                {metrics.summary.max_speed.toFixed(1)} mph
              </div>
            </div>
            <div>
              <div className="text-gray-600">Avg Steering</div>
              <div className="font-semibold text-gray-900">
                {metrics.summary.avg_steering.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

