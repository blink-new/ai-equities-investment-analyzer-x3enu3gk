import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { NewsAnalysis } from '@/components/news/NewsAnalysis'
import { MarketTheses } from '@/components/theses/MarketTheses'
import { PortfolioSimulator } from '@/components/portfolio/PortfolioSimulator'
import { blink } from '@/blink/client'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MarketOverview />
      case 'news':
        return <NewsAnalysis />
      case 'theses':
        return <MarketTheses />
      case 'portfolio':
        return <PortfolioSimulator />
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Analytics</h2>
            <p className="text-gray-600">Coming soon - Detailed performance tracking and analytics</p>
          </div>
        )
      case 'signals':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trading Signals</h2>
            <p className="text-gray-600">Coming soon - AI-generated trading signals and recommendations</p>
          </div>
        )
      default:
        return <MarketOverview />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Equity Analyzer...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="gradient-bg p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Equity Analyzer</h1>
          <p className="text-gray-600 mb-8">
            Intelligent investment platform powered by AI. Analyze news, generate market theses, 
            and simulate trading strategies.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>✓ Real-time news analysis</span>
              <span>✓ AI-powered insights</span>
              <span>✓ Portfolio simulation</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App