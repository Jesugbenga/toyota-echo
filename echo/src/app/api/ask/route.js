/**
 * Next.js API Route: /api/ask
 * Calls Gemini API for AI-powered insights
 * Works on both localhost and Vercel
 */

import { NextResponse } from 'next/server'

function buildPrompt(query) {
  const parts = [
    'You are RaceIQ, an expert AI race engineer and performance analyst.',
    'Your role is to analyze racing telemetry data and provide actionable insights.',
    '',
    '=== USER QUESTION ===',
    query.question || '',
    ''
  ]
  
  if (query.data_summary) {
    parts.push('=== DATA SUMMARY ===', query.data_summary, '')
  }
  
  if (query.predictions) {
    parts.push(
      '=== PREDICTED PERFORMANCE ===',
      JSON.stringify(query.predictions, null, 2),
      ''
    )
  }
  
  if (query.metrics) {
    parts.push(
      '=== DRIVER BEHAVIOR METRICS ===',
      JSON.stringify(query.metrics, null, 2),
      ''
    )
  }
  
  if (query.telemetry_summary) {
    parts.push(
      '=== TELEMETRY SUMMARY ===',
      JSON.stringify(query.telemetry_summary, null, 2),
      ''
    )
  }
  
  parts.push(
    '=== INSTRUCTIONS ===',
    'Provide a comprehensive analysis that includes:',
    '1. Direct answer to the user\'s question',
    '2. Key findings from the data',
    '3. Specific, actionable recommendations',
    '4. Numerical insights where relevant',
    '5. Strategic improvements for performance',
    '',
    'Format your response clearly with sections and bullet points.',
    'Be specific, technical, but also accessible.',
    'Focus on actionable insights that can improve race performance.'
  )
  
  return parts.join('\n')
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
        },
        { status: 503 }
      )
    }
    
    // Build prompt
    const prompt = buildPrompt(body)
    
    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} ${errorText}` },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    
    // Extract response text
    let responseText = ''
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      responseText = data.candidates[0].content.parts
        .map(part => part.text)
        .join('\n')
    }
    
    if (!responseText) {
      return NextResponse.json(
        { error: 'No response from Gemini API' },
        { status: 500 }
      )
    }
    
    // Extract key findings
    const keyFindings = []
    const lines = responseText.split('\n')
    
    for (const line of lines) {
      if (line.match(/finding|insight|recommendation|improvement/i)) {
        if (line.trim() && !line.trim().startsWith('#')) {
          keyFindings.push(line.trim())
        }
      }
    }
    
    // If no explicit findings, extract first few bullet points
    if (keyFindings.length === 0) {
      for (const line of lines.slice(0, 10)) {
        if (line.trim().match(/^[-•*]|^\d+\./)) {
          keyFindings.push(line.trim())
        }
      }
    }
    
    return NextResponse.json({
      response: responseText,
      key_findings: keyFindings.slice(0, 5), // Top 5 findings
      question: body.question
    })
    
  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: `Insights generation error: ${error.message}` },
      { status: 500 }
    )
  }
}

