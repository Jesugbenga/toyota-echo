'use client'

import { Gauge, BarChart3, MessageSquare } from 'lucide-react'

const tabs = [
  { id: 'predictions', label: 'Predictions', icon: Gauge },
  { id: 'analysis', label: 'Post-Event Analysis', icon: BarChart3 },
  { id: 'insights', label: 'AI Insights', icon: MessageSquare },
]

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-f1-dark">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-f1-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-f1-red to-f1-red/60 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-racing text-white">ECHO</h1>
                <p className="text-xs text-gray-400 font-orbitron tracking-wider">
                  RACING ANALYTICS
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 rounded-full bg-f1-red/20 border border-f1-red/30">
                <span className="text-xs font-orbitron text-f1-red uppercase tracking-wider">
                  Pre-Trained
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-f1-accent/20 border border-f1-accent/30">
                <span className="text-xs font-orbitron text-f1-accent uppercase tracking-wider">
                  98.2% Acc
                </span>
              </div>
            </div>
          </div>

          {/* Top Tabs Navigation */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-4 flex items-center space-x-2 font-orbitron text-sm uppercase tracking-wider transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-f1-red' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-f1-red" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
