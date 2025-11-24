/**
 * Next.js API Route: /api/metrics
 * Computes driver behavior metrics from telemetry
 */

import { NextResponse } from 'next/server'

function computeMetrics(telemetryData) {
  if (!telemetryData || telemetryData.length === 0) {
    return {
      cornering_aggression: 0,
      braking_intensity: 0,
      throttle_consistency: 0,
      speed_consistency: 0,
      overall_rating: 0
    }
  }
  
  // Extract values - prioritize new calculated/raw columns
  const deriveSpeed = (d) => {
    // Priority: calculated > raw > direct > aggregated > derived
    if (d.calculated_top_speed_kmh) return d.calculated_top_speed_kmh * 0.621371 // km/h to mph
    if (d.raw_top_speed) return d.raw_top_speed
    if (d.calculated_avg_speed_kmh) return d.calculated_avg_speed_kmh * 0.621371 // km/h to mph
    if (d.raw_avg_speed) return d.raw_avg_speed
    if (d.Speed || d.speed) return d.Speed || d.speed
    if (d.Speed_mean) return d.Speed_mean
    if (d.nmot_mean && d.gear_mean && d.gear_mean > 0) {
      return Math.max(30, Math.min(150, (d.nmot_mean / (d.gear_mean * 100)) * 0.6))
    }
    if (d.actual_lap_time && d.track_length) {
      return Math.max(30, Math.min(150, (d.track_length / d.actual_lap_time) * 3600))
    }
    return 0
  }
  
  const speeds = telemetryData.map(deriveSpeed).filter(v => v > 0)
  // Use raw values if available, otherwise fall back to aggregated
  const throttles = telemetryData.map(d => d.raw_ath_mean || d.ath_mean || d.ath || 0).filter(v => v > 0)
  const brakes = telemetryData.map(d => 
    (d.raw_pbrake_f_mean || d.pbrake_f_mean || d.pbrake_f || 0) + 
    (d.raw_pbrake_r_mean || d.pbrake_r_mean || d.pbrake_r || 0)
  )
  const steering = telemetryData.map(d => 
    d.raw_Steering_Angle_mean || d.Steering_Angle_mean || d.Steering_Angle || d.steering || 0
  )
  // Use raw values if available, otherwise max/mean
  const accx = telemetryData.map(d => d.raw_accx_can_mean || d.accx_can_max || d.accx_can_mean || d.accx_can || 0)
  const accy = telemetryData.map(d => d.raw_accy_can_mean || d.accy_can_max || d.accy_can_mean || d.accy_can || 0)
  
  // Compute statistics
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length || 0
  const speedStd = Math.sqrt(
    speeds.reduce((sum, v) => sum + Math.pow(v - avgSpeed, 2), 0) / speeds.length
  ) || 0
  
  const avgThrottle = throttles.reduce((a, b) => a + b, 0) / throttles.length || 0
  const throttleStd = Math.sqrt(
    throttles.reduce((sum, v) => sum + Math.pow(v - avgThrottle, 2), 0) / throttles.length
  ) || 0
  
  const avgBrake = brakes.reduce((a, b) => a + b, 0) / brakes.length || 0
  const maxBrake = Math.max(...brakes, 0)
  
  // Cornering aggression (based on lateral acceleration and steering)
  const lateralAcc = accy.map(a => Math.abs(a))
  const avgLateralAcc = lateralAcc.reduce((a, b) => a + b, 0) / lateralAcc.length || 0
  const maxSteering = Math.max(...steering.map(s => Math.abs(s)), 0)
  
  // Compute steering stability (lower std = more stable)
  const steeringStd = Math.sqrt(
    steering.reduce((sum, v) => sum + Math.pow(v - (steering.reduce((a, b) => a + b, 0) / steering.length), 2), 0) / steering.length
  ) || 0
  const avgSteering = steering.reduce((a, b) => a + b, 0) / steering.length || 0
  const steering_stability = Math.max(0, Math.min(100, 100 - (steeringStd / (Math.abs(avgSteering) + 1) * 50)))
  
  // Compute braking smoothness (lower variance = smoother)
  const brakeStd = Math.sqrt(
    brakes.reduce((sum, v) => sum + Math.pow(v - avgBrake, 2), 0) / brakes.length
  ) || 0
  const braking_smoothness = Math.max(0, Math.min(100, 100 - (brakeStd / (avgBrake + 1) * 20)))
  
  // Compute acceleration aggressiveness (higher lateral + longitudinal = more aggressive)
  const avgAccx = accx.reduce((a, b) => a + b, 0) / accx.length || 0
  const maxAccx = Math.max(...accx.map(a => Math.abs(a)), 0)
  const acceleration_aggressiveness = Math.min(100, (Math.abs(avgAccx) * 20 + maxAccx * 10 + avgLateralAcc * 15))
  
  // Compute metrics (0-100 scale)
  const cornering_aggression = Math.min(100, (avgLateralAcc / 2 + maxSteering / 10) * 10)
  const braking_intensity = Math.min(100, (avgBrake / 2 + maxBrake / 5))
  const throttle_consistency = Math.max(0, Math.min(100, 100 - (throttleStd / (avgThrottle + 1) * 100) || 0))
  const speed_consistency = Math.max(0, Math.min(100, 100 - (speedStd / (avgSpeed + 1) * 100) || 0))
  
  // Overall rating (weighted average)
  const overall_rating = (
    steering_stability * 0.2 +
    braking_smoothness * 0.2 +
    throttle_consistency * 0.3 +
    speed_consistency * 0.3
  )
  
  return {
    // Core metrics
    metrics: {
      steering_stability: Math.round(steering_stability),
      braking_smoothness: Math.round(braking_smoothness),
      acceleration_aggressiveness: Math.round(acceleration_aggressiveness),
      speed_consistency: Math.round(speed_consistency),
    },
    // Scores (for radar chart)
    scores: {
      smoothness: Math.round((steering_stability + braking_smoothness) / 2),
      consistency: Math.round(speed_consistency),
      corner_handling: Math.round((steering_stability + cornering_aggression) / 2),
      aggressiveness: Math.round(acceleration_aggressiveness),
    },
    // Additional metrics
    cornering_aggression: Math.round(cornering_aggression),
    braking_intensity: Math.round(braking_intensity),
    throttle_consistency: Math.round(throttle_consistency),
    overall_rating: Math.round(overall_rating),
    // Summary stats
    summary: {
      total_data_points: telemetryData.length,
      avg_speed: Math.round(avgSpeed * 10) / 10,
      max_speed: Math.max(...speeds, 0),
      avg_steering: Math.round(Math.abs(avgSteering) * 10) / 10,
      avg_throttle: Math.round(avgThrottle * 10) / 10,
      avg_brake: Math.round(avgBrake * 10) / 10,
      max_brake: Math.round(maxBrake * 10) / 10,
    }
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { error: 'No telemetry data provided' },
        { status: 400 }
      )
    }
    
    const metrics = computeMetrics(body.data)
    
    return NextResponse.json(metrics)
    
  } catch (error) {
    console.error('Metrics computation error:', error)
    return NextResponse.json(
      { error: `Metrics computation error: ${error.message}` },
      { status: 500 }
    )
  }
}
