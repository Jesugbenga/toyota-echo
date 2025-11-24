/**
 * Next.js API Route: /api/upload
 * Handles CSV file uploads and parsing
 */

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Read file as text
    const text = await file.text()
    
    // Parse CSV
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Parse data rows
    const records = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length !== headers.length) continue
      
      const record = {}
      headers.forEach((header, index) => {
        const value = values[index]
        const numValue = parseFloat(value)
        record[header] = isNaN(numValue) ? value : numValue
      })
      records.push(record)
    }
    
    // Calculate statistics
    const numericHeaders = headers.filter(h => {
      const sample = records[0]?.[h]
      return typeof sample === 'number'
    })
    
    const summaryStats = {}
    numericHeaders.forEach(header => {
      const values = records.map(r => r[header]).filter(v => typeof v === 'number' && !isNaN(v))
      if (values.length > 0) {
        summaryStats[header] = {
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          std: (() => {
            const mean = values.reduce((a, b) => a + b, 0) / values.length
            const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
            return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
          })()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded and parsed successfully',
      stats: {
        total_rows: records.length,
        columns: headers,
        summary_stats: summaryStats,
        data_preview: records.slice(0, 10)
      },
      data: records,
      feature_count: records.length
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Upload error: ${error.message}` },
      { status: 500 }
    )
  }
}

