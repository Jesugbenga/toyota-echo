from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum
import google.generativeai as genai
import os
import json
from typing import Optional, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class InsightsQuery(BaseModel):
    question: str
    data_summary: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    predictions: Optional[Dict[str, Any]] = None
    telemetry_summary: Optional[Dict[str, Any]] = None

def build_insights_prompt(query: InsightsQuery) -> str:
    """Build comprehensive prompt for Gemini"""
    
    prompt_parts = [
        "You are RaceIQ, an expert AI race engineer and performance analyst.",
        "Your role is to analyze racing telemetry data and provide actionable insights.",
        "",
        "=== USER QUESTION ===",
        query.question,
        ""
    ]
    
    if query.data_summary:
        prompt_parts.extend([
            "=== DATA SUMMARY ===",
            query.data_summary,
            ""
        ])
    
    if query.predictions:
        prompt_parts.extend([
            "=== PREDICTED PERFORMANCE ===",
            json.dumps(query.predictions, indent=2),
            ""
        ])
    
    if query.metrics:
        prompt_parts.extend([
            "=== DRIVER BEHAVIOR METRICS ===",
            json.dumps(query.metrics, indent=2),
            ""
        ])
    
    if query.telemetry_summary:
        prompt_parts.extend([
            "=== TELEMETRY SUMMARY ===",
            json.dumps(query.telemetry_summary, indent=2),
            ""
        ])
    
    prompt_parts.extend([
        "=== INSTRUCTIONS ===",
        "Provide a comprehensive analysis that includes:",
        "1. Direct answer to the user's question",
        "2. Key findings from the data",
        "3. Specific, actionable recommendations",
        "4. Numerical insights where relevant",
        "5. Strategic improvements for performance",
        "",
        "Format your response clearly with sections and bullet points.",
        "Be specific, technical, but also accessible.",
        "Focus on actionable insights that can improve race performance."
    ])
    
    return "\n".join(prompt_parts)

@app.post("/api/insights")
async def get_insights(query: InsightsQuery):
    """
    Generate AI-powered insights using Gemini.
    Accepts question, metrics, predictions, and telemetry data.
    """
    try:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=503, 
                detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
            )
        
        if not query.question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        # Build prompt
        prompt = build_insights_prompt(query)
        
        # Initialize model
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Generate response
        try:
            response = model.generate_content(prompt)
            response_text = response.text
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Gemini API error: {str(e)}"
            )
        
        # Extract key findings (simple extraction)
        key_findings = []
        lines = response_text.split('\n')
        for line in lines:
            if any(marker in line.lower() for marker in ['finding', 'insight', 'recommendation', 'improvement']):
                if line.strip() and not line.strip().startswith('#'):
                    key_findings.append(line.strip())
        
        # If no explicit findings, extract first few bullet points
        if not key_findings:
            for line in lines[:10]:
                if line.strip().startswith(('-', '•', '*', '1.', '2.', '3.')):
                    key_findings.append(line.strip())
        
        return {
            "response": response_text,
            "key_findings": key_findings[:5],  # Top 5 findings
            "question": query.question
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation error: {str(e)}")

# Vercel serverless handler
handler = Mangum(app)
