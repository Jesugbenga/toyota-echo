'use client'

import { useState } from 'react'
import { Send, Loader2, MessageSquare, Sparkles, AlertCircle, Brain } from 'lucide-react'

export default function InsightsConsole({ telemetryData, predictions, metrics }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [keyFindings, setKeyFindings] = useState([])

  const handleAsk = async () => {
    if (!question.trim()) return

    const userMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      // Build data summary with predictions
      let dataSummary = 'No telemetry data available.'
      if (telemetryData) {
        dataSummary = `Telemetry data with ${telemetryData.stats?.total_rows || 0} data points. `
        if (telemetryData.stats?.summary_stats) {
          dataSummary += `Speed range: ${telemetryData.stats.summary_stats.Speed?.min?.toFixed(1) || 'N/A'} - ${telemetryData.stats.summary_stats.Speed?.max?.toFixed(1) || 'N/A'} mph. `
        }
      }

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          data_summary: dataSummary,
          predictions: predictions || null,
          metrics: metrics || null,
          telemetry_summary: telemetryData?.stats || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get insights')
      }

      const result = await response.json()
      
      const aiMessage = {
        role: 'assistant',
        content: result.response,
        keyFindings: result.key_findings || [],
      }

      setMessages((prev) => [...prev, aiMessage])
      setKeyFindings(result.key_findings || [])
      setQuestion('')
    } catch (err) {
      setError(err.message)
      console.error('Insights error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const suggestedQuestions = [
    "Where did the driver lose the most time?",
    "Compare this lap's braking profile to the predicted ideal.",
    "Generate strategic improvements for corner entry.",
    "What are the key performance bottlenecks?",
    "How can the driver improve consistency?",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-f1-yellow to-f1-yellow/60 flex items-center justify-center shadow-glow-red">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-racing text-white mb-1">
            AI INSIGHTS
          </h2>
          <p className="text-sm text-gray-400 font-orbitron tracking-wider">
            CONVERSE WITH GEMINI ABOUT YOUR RACING DATA
          </p>
        </div>
      </div>

      {/* Key Findings Panel */}
      {keyFindings.length > 0 && (
        <div className="glossy-card rounded-2xl p-6 border-2 border-f1-yellow/30 bg-gradient-to-br from-f1-yellow/10 to-transparent">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-f1-yellow" />
            <h3 className="text-lg font-orbitron text-f1-yellow uppercase tracking-wider">Key Findings</h3>
          </div>
          <ul className="space-y-2">
            {keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-f1-yellow mt-1 font-bold">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat Interface */}
      <div className="glossy-card rounded-2xl flex flex-col border border-white/10" style={{ height: '600px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-6 text-gray-600" />
              <p className="font-orbitron text-lg mb-2">Start a conversation</p>
              <p className="text-sm mb-6">Ask questions about your racing data</p>
              <div className="space-y-2 max-w-md mx-auto">
                <p className="text-xs font-orbitron text-gray-500 uppercase tracking-wider mb-4">Suggested questions:</p>
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="block w-full text-left text-sm text-f1-accent hover:text-f1-yellow px-4 py-3 glossy-card rounded-lg hover:border-f1-accent/30 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'glossy-button text-white'
                      : 'glossy-card text-gray-200 border border-f1-yellow/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="glossy-card rounded-xl p-4 flex items-center space-x-3 border border-f1-yellow/20">
                <Loader2 className="w-5 h-5 animate-spin text-f1-yellow" />
                <span className="text-gray-300 font-orbitron text-sm">Analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-6">
          {error && (
            <div className="mb-4 glossy-card rounded-xl p-4 border border-red-500/30 bg-red-500/10 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          <div className="flex space-x-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the telemetry data..."
              className="flex-1 glossy-card rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-f1-yellow/50 focus:border-f1-yellow/50 resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="px-8 py-3 glossy-button rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-orbitron uppercase tracking-wider text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-orbitron">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="glossy-card rounded-xl p-6">
          <h3 className="text-sm font-orbitron text-gray-400 uppercase tracking-wider mb-4">
            Suggested Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="text-left px-4 py-3 text-sm text-gray-300 hover:text-white glossy-card rounded-lg hover:border-f1-yellow/30 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Status */}
      <div className="glossy-card rounded-xl p-6">
        <h3 className="text-xs font-orbitron text-gray-400 uppercase tracking-wider mb-4">Data Status</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Telemetry</div>
            <div className={`font-orbitron ${telemetryData ? 'text-f1-accent' : 'text-gray-600'}`}>
              {telemetryData ? 'Available' : 'Not Available'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Predictions</div>
            <div className={`font-orbitron ${predictions ? 'text-f1-accent' : 'text-gray-600'}`}>
              {predictions ? 'Available' : 'Not Available'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Metrics</div>
            <div className={`font-orbitron ${metrics ? 'text-f1-accent' : 'text-gray-600'}`}>
              {metrics ? 'Available' : 'Not Available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
