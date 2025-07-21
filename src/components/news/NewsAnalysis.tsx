import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  ExternalLink,
  Brain,
  Clock
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { NewsArticle } from '@/types'

const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Rate Cut in Q2 2024',
    content: 'The Federal Reserve indicated today that economic conditions may warrant a rate reduction...',
    url: 'https://example.com/fed-rate-cut',
    publishedAt: '2024-01-15T10:30:00Z',
    source: 'Financial Times',
    sentiment: 'positive',
    relevantTickers: ['SPY', 'QQQ', 'IWM'],
    aiSummary: 'Bullish signal for equities as lower rates typically boost valuations across sectors.'
  },
  {
    id: '2',
    title: 'Tech Earnings Season Shows Mixed Results Amid AI Investment Surge',
    content: 'Major technology companies reported varied quarterly results as AI infrastructure spending continues...',
    url: 'https://example.com/tech-earnings',
    publishedAt: '2024-01-15T08:15:00Z',
    source: 'Reuters',
    sentiment: 'neutral',
    relevantTickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
    aiSummary: 'Mixed earnings but strong AI investment theme suggests long-term growth potential.'
  },
  {
    id: '3',
    title: 'Energy Sector Faces Headwinds as Oil Prices Decline',
    content: 'Crude oil prices dropped 3% today following increased production forecasts...',
    url: 'https://example.com/oil-decline',
    publishedAt: '2024-01-15T07:45:00Z',
    source: 'Bloomberg',
    sentiment: 'negative',
    relevantTickers: ['XOM', 'CVX', 'COP'],
    aiSummary: 'Bearish outlook for energy stocks as oversupply concerns weigh on oil prices.'
  }
]

export function NewsAnalysis() {
  const [news, setNews] = useState<NewsArticle[]>(mockNews)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSentiment = selectedSentiment === 'all' || article.sentiment === selectedSentiment
    return matchesSearch && matchesSentiment
  })

  const analyzeNews = async (article: NewsArticle) => {
    setIsAnalyzing(true)
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this financial news article for investment implications:
        
        Title: ${article.title}
        Content: ${article.content}
        
        Provide:
        1. Market sentiment (bullish/bearish/neutral)
        2. Affected sectors and stocks
        3. Short-term and long-term implications
        4. Investment recommendations
        
        Keep the analysis concise and actionable.`,
        maxTokens: 300
      })
      
      // Update the article with AI analysis
      setNews(prev => prev.map(n => 
        n.id === article.id 
          ? { ...n, aiSummary: text }
          : n
      ))
    } catch (error) {
      console.error('Failed to analyze news:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />
      case 'negative': return <TrendingDown className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">News Analysis</h2>
        <p className="text-gray-600">AI-powered sentiment analysis of financial news</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Tabs value={selectedSentiment} onValueChange={setSelectedSentiment}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="neutral">Neutral</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredNews.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <Badge className={`${getSentimentColor(article.sentiment)} flex items-center gap-1`}>
                      {getSentimentIcon(article.sentiment)}
                      {article.sentiment}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3">{article.content}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {article.relevantTickers.map((ticker) => (
                  <Badge key={ticker} variant="outline">
                    {ticker}
                  </Badge>
                ))}
              </div>

              {article.aiSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">AI Analysis</span>
                  </div>
                  <p className="text-blue-800 text-sm">{article.aiSummary}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeNews(article)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                </Button>
                
                <div className="text-xs text-gray-500">
                  Impact: {article.relevantTickers.length} stocks
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}