'use client'

import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, Loader2, Gauge, Zap, Target, Activity } from 'lucide-react'
import { generateMockMetrics } from '@/lib/mockData'

export default function BehaviorScorecard({ data, onMetrics, metrics: externalMetrics }) {
  const [metrics, setMetrics] = useState(externalMetrics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-compute metrics from data if available
  useEffect(() => {
    if (data && !metrics && !loading) {
      computeMetrics()
    } else if (!externalMetrics && !data) {
      // Only use mock metrics as last resort
      const mockMetrics = generateMockMetrics()
      setMetrics(mockMetrics)
      onMetrics?.(mockMetrics)
    }
  }, [data])

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
      // Format data for API - prioritize raw values, fall back to aggregated
      const formattedData = data.data.map((record) => {
        // Derive speed using new columns (priority: calculated > raw > direct)
        let speed = 0
        if (record.calculated_top_speed_kmh) {
          speed = record.calculated_top_speed_kmh * 0.621371 // km/h to mph
        } else if (record.raw_top_speed) {
          speed = record.raw_top_speed
        } else if (record.calculated_avg_speed_kmh) {
          speed = record.calculated_avg_speed_kmh * 0.621371 // km/h to mph
        } else if (record.raw_avg_speed) {
          speed = record.raw_avg_speed
        } else {
          speed = record.Speed || record.speed || 0
        }
        
        return {
          accx_can: record.raw_accx_can_mean || record.accx_can_mean || record.accx_can || 0,
          accy_can: record.raw_accy_can_mean || record.accy_can_mean || record.accy_can || 0,
          ath: record.raw_ath_mean || record.ath_mean || record.ath || 0,
          pbrake_r: record.raw_pbrake_r_mean || record.pbrake_r_mean || record.pbrake_r || 0,
          pbrake_f: record.raw_pbrake_f_mean || record.pbrake_f_mean || record.pbrake_f || 0,
          gear: record.raw_gear_mean || record.gear_mean || record.gear || 0,
          Steering_Angle: record.raw_Steering_Angle_mean || record.Steering_Angle_mean || record.Steering_Angle || record.steering || 0,
          Speed: speed,
        }
      })

      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formattedData }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Metrics computation failed' }))
        throw new Error(errorData.error || errorData.detail || 'Metrics computation failed')
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
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-f1-red mx-auto mb-4" />
        <p className="text-sm font-orbitron text-gray-400 uppercase tracking-wider">Computing Metrics</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-orbitron text-red-400 uppercase tracking-wider mb-1">Error</h3>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-6 text-center">
        <button
          onClick={computeMetrics}
          className="px-6 py-3 glossy-button rounded-xl font-orbitron uppercase tracking-wider text-sm"
        >
          Compute Metrics
        </button>
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-f1-accent border-f1-accent/30 bg-f1-accent/10'
    if (score >= 60) return 'text-f1-yellow border-f1-yellow/30 bg-f1-yellow/10'
    return 'text-f1-red border-f1-red/30 bg-f1-red/10'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    if (score >= 40) return 'FAIR'
    return 'NEEDS IMPROVEMENT'
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
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-f1-accent to-f1-accent/60 flex items-center justify-center shadow-glow-red">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-racing text-white mb-1">
            BEHAVIOR SCORECARD
          </h2>
          <p className="text-sm text-gray-400 font-orbitron tracking-wider">
            DRIVER PERFORMANCE ANALYSIS
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glossy-card rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-orbitron text-gray-400 uppercase tracking-wider mb-6">
          Performance Overview
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#ffffff20" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: '#ffffff', fontSize: 12, fontFamily: 'Orbitron' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#ffffff60', fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steering Stability */}
        <div className="glossy-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-f1-accent/20 flex items-center justify-center border border-f1-accent/30">
              <Target className="w-5 h-5 text-f1-accent" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-1">
                Steering Stability
              </div>
              <div className="text-2xl font-racing text-white">
                {metrics.metrics?.steering_stability?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-lg border text-xs font-orbitron uppercase tracking-wider ${getScoreColor(metrics.metrics?.steering_stability || 0)}`}>
            {getScoreLabel(metrics.metrics?.steering_stability || 0)}
          </div>
        </div>

        {/* Braking Smoothness */}
        <div className="glossy-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-f1-yellow/20 flex items-center justify-center border border-f1-yellow/30">
              <Zap className="w-5 h-5 text-f1-yellow" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-1">
                Braking Smoothness
              </div>
              <div className="text-2xl font-racing text-white">
                {metrics.metrics?.braking_smoothness?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-lg border text-xs font-orbitron uppercase tracking-wider ${getScoreColor(metrics.metrics?.braking_smoothness || 0)}`}>
            {getScoreLabel(metrics.metrics?.braking_smoothness || 0)}
          </div>
        </div>

        {/* Acceleration Aggressiveness */}
        <div className="glossy-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-f1-red/20 flex items-center justify-center border border-f1-red/30">
              <TrendingUp className="w-5 h-5 text-f1-red" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-1">
                Acceleration Aggressiveness
              </div>
              <div className="text-2xl font-racing text-white">
                {metrics.metrics?.acceleration_aggressiveness?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-lg border text-xs font-orbitron uppercase tracking-wider ${getScoreColor(metrics.metrics?.acceleration_aggressiveness || 0)}`}>
            {getScoreLabel(metrics.metrics?.acceleration_aggressiveness || 0)}
          </div>
        </div>

        {/* Speed Consistency */}
        <div className="glossy-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-f1-accent/20 flex items-center justify-center border border-f1-accent/30">
              <Gauge className="w-5 h-5 text-f1-accent" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-1">
                Speed Consistency
              </div>
              <div className="text-2xl font-racing text-white">
                {metrics.metrics?.speed_consistency?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-lg border text-xs font-orbitron uppercase tracking-wider ${getScoreColor(metrics.metrics?.speed_consistency || 0)}`}>
            {getScoreLabel(metrics.metrics?.speed_consistency || 0)}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {metrics.summary && (
        <div className="glossy-card rounded-xl border border-white/10 p-6">
          <h3 className="text-sm font-orbitron text-gray-400 uppercase tracking-wider mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 font-orbitron uppercase tracking-wider mb-1">Data Points</div>
              <div className="text-xl font-racing text-white">
                {metrics.summary.total_data_points || 0}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-orbitron uppercase tracking-wider mb-1">Avg Speed</div>
              <div className="text-xl font-racing text-white">
                {metrics.summary.avg_speed?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">mph</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-orbitron uppercase tracking-wider mb-1">Max Speed</div>
              <div className="text-xl font-racing text-white">
                {metrics.summary.max_speed?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">mph</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-orbitron uppercase tracking-wider mb-1">Avg Steering</div>
              <div className="text-xl font-racing text-white">
                {metrics.summary.avg_steering?.toFixed(1) || '0.0'} <span className="text-sm text-gray-400">°</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
