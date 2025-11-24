/**
 * Next.js API Route: /api/ask
 * Calls Gemini API for AI-powered insights
 * Works on both localhost and Vercel
 */

import { NextResponse } from 'next/server'

function buildPrompt(query) {
  const question = (query.question || '').toLowerCase().trim()
  const isSimpleQuestion = question.length < 50 && !question.includes('compare') && !question.includes('analyze') && !question.includes('comprehensive')
  
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
  
  if (isSimpleQuestion) {
    parts.push(
      '=== INSTRUCTIONS ===',
      'This is a simple, direct question. Provide a concise, focused answer:',
      '- Give a direct answer in 2-3 sentences',
      '- Include 1-2 specific data points or metrics if relevant',
      '- Keep it brief and actionable',
      '- Use plain text (no markdown formatting)',
      '- Avoid lengthy explanations or multiple sections'
    )
  } else {
    parts.push(
      '=== INSTRUCTIONS ===',
      'Provide a clear, structured analysis:',
      '1. Direct answer to the user\'s question (2-3 sentences)',
      '2. Key findings (3-4 bullet points)',
      '3. Specific recommendations (2-3 actionable items)',
      '4. Numerical insights where relevant',
      '',
      'IMPORTANT FORMATTING RULES:',
      '- Use plain text only (NO markdown, NO asterisks, NO bold, NO headers)',
      '- Use simple bullet points with dashes (-)',
      '- Keep paragraphs short (2-3 sentences max)',
      '- Be concise and technical but accessible',
      '- Focus on actionable insights'
    )
  }
  
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
    
    // Clean up markdown formatting from response
    responseText = responseText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/###\s*/g, '') // Remove ### headers
      .replace(/##\s*/g, '') // Remove ## headers
      .replace(/#\s*/g, '') // Remove # headers
      .replace(/`(.*?)`/g, '$1') // Remove code backticks
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    
    // Extract key findings - look for bullet points and key phrases
    const keyFindings = []
    const lines = responseText.split('\n')
    
    // Look for bullet points first
    for (const line of lines) {
      const trimmed = line.trim()
      // Match bullet points (dash, asterisk, or numbered)
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        // Clean up the bullet point
        const clean = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim()
        if (clean.length > 20 && clean.length < 200) {
          keyFindings.push(clean)
        }
      }
    }
    
    // If no bullet points found, look for key phrases
    if (keyFindings.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.match(/finding|insight|recommendation|improvement|key|important/i)) {
          if (trimmed.length > 20 && trimmed.length < 200 && !trimmed.startsWith('===')) {
            keyFindings.push(trimmed)
          }
        }
      }
    }
    
    // Limit to top 5 and ensure they're unique
    const uniqueFindings = [...new Set(keyFindings)].slice(0, 5)
    
    return NextResponse.json({
      response: responseText,
      key_findings: uniqueFindings,
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

