export interface NewsArticle {
  id: string
  title: string
  content: string
  url: string
  publishedAt: string
  source: string
  sentiment: 'positive' | 'negative' | 'neutral'
  relevantTickers: string[]
  aiSummary?: string
}

export interface MarketThesis {
  id: string
  title: string
  description: string
  sector: string
  tickers: string[]
  confidence: number
  createdAt: string
  supportingNews: string[]
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  timeHorizon: '1M' | '3M' | '6M' | '1Y'
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe?: number
  sector: string
}

export interface PortfolioPosition {
  id: string
  portfolioId: string
  symbol: string
  companyName?: string
  shares: number
  avgPrice: number
  currentPrice: number
  marketValue: number
  gainLoss: number
  gainLossPercent: number
  sector?: string
  createdAt: string
  updatedAt: string
}

export interface Portfolio {
  id: string
  name: string
  userId: string
  initialCapital: number
  currentValue: number
  cashBalance: number
  totalGainLoss: number
  totalGainLossPercent: number
  positions?: PortfolioPosition[]
  createdAt: string
  updatedAt: string
}

export interface TradingSignal {
  id: string
  symbol: string
  action: 'buy' | 'sell' | 'hold'
  confidence: number
  targetPrice: number
  stopLoss?: number
  reasoning: string
  createdAt: string
}

export interface BacktestResult {
  id: string
  strategyName: string
  startDate: string
  endDate: string
  initialCapital: number
  finalValue: number
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  trades: number
}