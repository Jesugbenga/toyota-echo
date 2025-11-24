/**
 * Next.js API Route: /api/load-dataset
 * Loads the preprocessed Sonoma dataset
 * Works on both localhost and Vercel
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Try to load from public/data/sonoma.json first
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'sonoma.json')
    
    if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath, 'utf8')
      const data = JSON.parse(jsonData)
      
      return NextResponse.json({
        success: true,
        message: 'Dataset loaded successfully',
        stats: {
          total_rows: data.length,
          columns: data.length > 0 ? Object.keys(data[0]) : [],
        },
        data: data,
        feature_count: data.length,
      })
    }
    
    // Fallback: Try to load CSV from model folder
    const csvPath = path.join(process.cwd(), 'model', 'frontend_demo_dataset.csv')
    
    if (fs.existsSync(csvPath)) {
      const csvText = fs.readFileSync(csvPath, 'utf8')
      const lines = csvText.trim().split('\n')
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid')
      }
      
      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim())
      const records = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length !== headers.length) continue
        
        const record = {}
        headers.forEach((header, index) => {
          const value = values[index]
          const numValue = parseFloat(value)
          record[header] = isNaN(numValue) ? value : numValue
        })
        records.push(record)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Dataset loaded successfully from CSV',
        stats: {
          total_rows: records.length,
          columns: headers,
        },
        data: records,
        feature_count: records.length,
        note: 'Dataset contains aggregated features (mean, std, max) per lap'
      })
    }
    
    // If neither exists, return error
    return NextResponse.json(
      { 
        error: 'Dataset file not found. Please ensure sonoma.json is in public/data/ or frontend_demo_dataset.csv is in model/' 
      },
      { status: 404 }
    )
    
  } catch (error) {
    console.error('Load dataset error:', error)
    return NextResponse.json(
      { error: `Error loading dataset: ${error.message}` },
      { status: 500 }
    )
  }
}
