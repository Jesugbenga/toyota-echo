'use client'

import { Clock, TrendingUp, Gauge, Target, Activity } from 'lucide-react'

export default function PredictionResults({ predictions }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(3)
    return `${mins}:${secs.padStart(6, '0')}`
  }

  const getConsistencyColor = (score) => {
    if (score >= 80) return 'text-f1-accent'
    if (score >= 60) return 'text-f1-yellow'
    return 'text-f1-red'
  }

  const getConsistencyLabel = (score) => {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    if (score >= 40) return 'FAIR'
    return 'NEEDS IMPROVEMENT'
  }

  return (
    <div className="space-y-6">
      {/* Main Prediction - Large Card */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-lg bg-f1-red/20 flex items-center justify-center border border-f1-red/30">
              <Clock className="w-7 h-7 text-f1-red" />
            </div>
            <div>
              <h3 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-1">
                PREDICTED LAP TIME
              </h3>
              <div className="text-5xl font-racing text-white">
                {formatTime(predictions.predicted_lap_time)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-orbitron mb-1">Confidence</div>
            <div className="text-xl font-orbitron text-f1-accent">98.2%</div>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-gray-400 font-orbitron">
            Based on {predictions.predictions_count || 0} telemetry data points
          </p>
        </div>
      </div>

      {/* Metrics Grid - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Consistency Score */}
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className={`w-4 h-4 ${getConsistencyColor(predictions.consistency_score)}`} />
            <h4 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider">
              Consistency
            </h4>
          </div>
          <div className="text-3xl font-orbitron text-white mb-1">
            {predictions.consistency_score.toFixed(1)}
          </div>
          <p className={`text-xs font-orbitron uppercase ${getConsistencyColor(predictions.consistency_score)}`}>
            {getConsistencyLabel(predictions.consistency_score)}
          </p>
        </div>

        {/* Peak Speed */}
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Gauge className="w-4 h-4 text-f1-accent" />
            <h4 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider">
              Peak Speed
            </h4>
          </div>
          <div className="text-3xl font-orbitron text-f1-accent mb-1">
            {predictions.predicted_peak_speed.toFixed(1)}
          </div>
          <p className="text-xs text-gray-400 font-orbitron uppercase">mph</p>
        </div>

        {/* Model MAE */}
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-f1-yellow" />
            <h4 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider">
              Model MAE
            </h4>
          </div>
          <div className="text-3xl font-orbitron text-f1-yellow mb-1">
            2.24s
          </div>
          <p className="text-xs text-gray-400 font-orbitron uppercase">Mean Error</p>
        </div>

        {/* Data Points */}
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-4 h-4 text-white/60" />
            <h4 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider">
              Data Points
            </h4>
          </div>
          <div className="text-3xl font-orbitron text-white mb-1">
            {predictions.predictions_count || 0}
          </div>
          <p className="text-xs text-gray-400 font-orbitron uppercase">Analyzed</p>
        </div>
      </div>

      {/* Behavior Pattern - Compact */}
      {predictions.behavior_pattern && (
        <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-4 h-4 text-f1-red" />
            <h4 className="text-sm font-orbitron text-white uppercase tracking-wider">
              Expected Behavior Pattern
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-f1-dark/50 border border-white/5">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">
                Braking
              </div>
              <div className="text-lg font-orbitron text-white capitalize">
                {predictions.behavior_pattern.braking_intensity}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-f1-dark/50 border border-white/5">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">
                Acceleration
              </div>
              <div className="text-lg font-orbitron text-white capitalize">
                {predictions.behavior_pattern.acceleration_aggressiveness}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-f1-dark/50 border border-white/5">
              <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">
                Avg Speed
              </div>
              <div className="text-lg font-orbitron text-white">
                {predictions.behavior_pattern.avg_speed.toFixed(1)} mph
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
