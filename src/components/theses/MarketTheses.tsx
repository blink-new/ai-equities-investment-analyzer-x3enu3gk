import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Brain,
  Plus,
  BarChart3
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { MarketThesis } from '@/types'

const mockTheses: MarketThesis[] = [
  {
    id: '1',
    title: 'AI Infrastructure Boom',
    description: 'Semiconductor and cloud infrastructure companies will benefit from massive AI adoption across industries.',
    sector: 'Technology',
    tickers: ['NVDA', 'AMD', 'MSFT', 'GOOGL'],
    confidence: 85,
    createdAt: '2024-01-15T10:00:00Z',
    supportingNews: ['ai-earnings-surge', 'cloud-infrastructure-growth'],
    expectedReturn: 25.5,
    riskLevel: 'medium',
    timeHorizon: '6M'
  },
  {
    id: '2',
    title: 'Energy Transition Acceleration',
    description: 'Renewable energy and battery technology stocks positioned for growth as global climate policies tighten.',
    sector: 'Energy',
    tickers: ['TSLA', 'ENPH', 'FSLR', 'NEE'],
    confidence: 72,
    createdAt: '2024-01-14T15:30:00Z',
    supportingNews: ['climate-policy-update', 'renewable-investment-surge'],
    expectedReturn: 18.3,
    riskLevel: 'high',
    timeHorizon: '1Y'
  },
  {
    id: '3',
    title: 'Healthcare Innovation Wave',
    description: 'Biotech and medical device companies with breakthrough therapies and AI-driven drug discovery.',
    sector: 'Healthcare',
    tickers: ['JNJ', 'PFE', 'MRNA', 'ISRG'],
    confidence: 68,
    createdAt: '2024-01-13T09:15:00Z',
    supportingNews: ['fda-approvals-increase', 'ai-drug-discovery'],
    expectedReturn: 15.7,
    riskLevel: 'medium',
    timeHorizon: '1Y'
  }
]

export function MarketTheses() {
  const [theses, setTheses] = useState<MarketThesis[]>(mockTheses)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateNewThesis = async () => {
    setIsGenerating(true)
    try {
      const { object } = await blink.ai.generateObject({
        prompt: `Based on current market conditions and recent news, generate a new investment thesis. Consider:
        - Current market trends
        - Sector rotation patterns
        - Economic indicators
        - Geopolitical factors
        
        Create a compelling investment thesis with specific stock recommendations.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            sector: { type: 'string' },
            tickers: { 
              type: 'array',
              items: { type: 'string' }
            },
            confidence: { type: 'number', minimum: 0, maximum: 100 },
            expectedReturn: { type: 'number' },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
            timeHorizon: { type: 'string', enum: ['1M', '3M', '6M', '1Y'] }
          },
          required: ['title', 'description', 'sector', 'tickers', 'confidence', 'expectedReturn', 'riskLevel', 'timeHorizon']
        }
      })

      const newThesis: MarketThesis = {
        id: Date.now().toString(),
        ...object,
        createdAt: new Date().toISOString(),
        supportingNews: []
      }

      setTheses(prev => [newThesis, ...prev])
    } catch (error) {
      console.error('Failed to generate thesis:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Theses</h2>
          <p className="text-gray-600">AI-generated investment theses based on market analysis</p>
        </div>
        <Button 
          onClick={generateNewThesis}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Brain className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Generate Thesis
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {theses.map((thesis) => (
          <Card key={thesis.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{thesis.title}</CardTitle>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline">{thesis.sector}</Badge>
                    <Badge className={getRiskColor(thesis.riskLevel)}>
                      {thesis.riskLevel} risk
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {thesis.timeHorizon}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className={`font-bold ${getConfidenceColor(thesis.confidence)}`}>
                      {thesis.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Confidence</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{thesis.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Expected Return</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">+{thesis.expectedReturn}%</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Confidence</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={thesis.confidence} className="h-2" />
                    <p className="text-sm text-blue-600">{thesis.confidence}% confident</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Positions</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{thesis.tickers.length} stocks</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Recommended Stocks</h4>
                <div className="flex flex-wrap gap-2">
                  {thesis.tickers.map((ticker) => (
                    <Badge key={ticker} variant="secondary" className="font-mono">
                      {ticker}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Created {new Date(thesis.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Create Portfolio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {theses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No theses generated yet</h3>
            <p className="text-gray-600 mb-4">Generate your first AI-powered investment thesis.</p>
            <Button onClick={generateNewThesis} disabled={isGenerating}>
              <Plus className="h-4 w-4 mr-2" />
              Generate First Thesis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}