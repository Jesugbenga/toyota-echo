'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts'
import { AlertCircle } from 'lucide-react'

export default function TelemetryExplorer({ data }) {
  const [selectedChart, setSelectedChart] = useState('speed')

  const chartData = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return []

    return data.data.map((record, index) => ({
      index,
      time: index,
      speed: record.Speed || record.speed || 0,
      throttle: record.ath || 0,
      brake: (record.pbrake_f || 0) + (record.pbrake_r || 0),
      steering: record.Steering_Angle || record.steering || 0,
      accx: record.accx_can || 0,
      accy: record.accy_can || 0,
      acceleration: Math.sqrt(
        Math.pow(record.accx_can || 0, 2) + Math.pow(record.accy_can || 0, 2)
      ),
    }))
  }, [data])

  if (!data) {
    return (
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-2">
          No Telemetry Data
        </h3>
        <p className="text-xs text-gray-400">
          Upload telemetry data in the Predictions tab or load mock data to explore it here.
        </p>
      </div>
    )
  }

  const charts = [
    { id: 'speed', label: 'Speed vs Time', component: SpeedChart },
    { id: 'throttle-brake', label: 'Throttle/Brake Overlay', component: ThrottleBrakeChart },
    { id: 'steering', label: 'Steering Angle Variance', component: SteeringChart },
    { id: 'acceleration', label: 'Acceleration Magnitude', component: AccelerationChart },
  ]

  const ChartComponent = charts.find((c) => c.id === selectedChart)?.component || SpeedChart

  const chartColors = {
    grid: '#2A2A2A',
    text: '#FFFFFF',
    line: '#E10600',
    area: '#E10600',
  }

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-2">
          {charts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`px-4 py-2 rounded-lg text-xs font-orbitron uppercase tracking-wider transition-all ${
                selectedChart === chart.id
                  ? 'bg-f1-red text-white'
                  : 'bg-f1-dark/50 text-gray-400 hover:text-white hover:bg-f1-dark'
              }`}
            >
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-6">
        <ChartComponent data={chartData} colors={chartColors} />
      </div>

      {/* Data Summary */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
            <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">Data Points</div>
            <div className="text-2xl font-orbitron text-white">
              {chartData.length.toLocaleString()}
            </div>
          </div>
          <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
            <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">Max Speed</div>
            <div className="text-2xl font-orbitron text-f1-accent">
              {Math.max(...chartData.map((d) => d.speed)).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">mph</div>
          </div>
          <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
            <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">Avg Speed</div>
            <div className="text-2xl font-orbitron text-f1-yellow">
              {(
                chartData.reduce((sum, d) => sum + d.speed, 0) / chartData.length
              ).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">mph</div>
          </div>
          <div className="bg-f1-gray/50 rounded-xl border border-white/10 p-5">
            <div className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-2">Max Acceleration</div>
            <div className="text-2xl font-orbitron text-f1-red">
              {Math.max(...chartData.map((d) => d.acceleration)).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">m/s²</div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpeedChart({ data, colors }) {
  return (
    <div>
      <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">Speed vs Time</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="time" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }} 
          />
          <Legend wrapperStyle={{ color: colors.text, fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="speed"
            stroke={colors.line}
            strokeWidth={2}
            name="Speed"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ThrottleBrakeChart({ data, colors }) {
  return (
    <div>
      <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">
        Throttle and Brake Overlay
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="time" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis yAxisId="left" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }} 
          />
          <Legend wrapperStyle={{ color: colors.text, fontSize: '12px' }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="throttle"
            fill="#00D2BE"
            stroke="#00D2BE"
            name="Throttle"
            fillOpacity={0.6}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="brake"
            fill="#E10600"
            stroke="#E10600"
            name="Brake"
            fillOpacity={0.6}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function SteeringChart({ data, colors }) {
  return (
    <div>
      <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">
        Steering Angle Variance
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="time" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }} 
          />
          <Legend wrapperStyle={{ color: colors.text, fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="steering"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
            name="Steering Angle"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function AccelerationChart({ data, colors }) {
  const binnedData = data.map((d) => ({
    time: d.time,
    acceleration: d.acceleration,
    accx: d.accx,
    accy: d.accy,
  }))

  return (
    <div>
      <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">
        Acceleration Magnitude
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={binnedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="time" stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <YAxis stroke={colors.text} tick={{ fill: colors.text, fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }} 
          />
          <Legend wrapperStyle={{ color: colors.text, fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="acceleration"
            stroke="#FFD700"
            strokeWidth={2}
            name="Total Acceleration"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="accx"
            stroke="#3b82f6"
            strokeWidth={1}
            name="Longitudinal (accx)"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="accy"
            stroke="#ec4899"
            strokeWidth={1}
            name="Lateral (accy)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
