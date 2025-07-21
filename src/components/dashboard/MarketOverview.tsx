import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

const marketData = [
  {
    name: 'S&P 500',
    value: '4,567.89',
    change: '+23.45',
    changePercent: '+0.52%',
    trend: 'up'
  },
  {
    name: 'NASDAQ',
    value: '14,234.56',
    change: '-45.67',
    changePercent: '-0.32%',
    trend: 'down'
  },
  {
    name: 'DOW JONES',
    value: '34,567.12',
    change: '+156.78',
    changePercent: '+0.45%',
    trend: 'up'
  },
  {
    name: 'VIX',
    value: '18.45',
    change: '-1.23',
    changePercent: '-6.25%',
    trend: 'down'
  }
]

const topMovers = [
  { symbol: 'AAPL', name: 'Apple Inc.', change: '+2.34%', price: '$178.45' },
  { symbol: 'TSLA', name: 'Tesla Inc.', change: '+5.67%', price: '$245.89' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', change: '+3.21%', price: '$456.78' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', change: '+1.89%', price: '$334.56' },
]

export function MarketOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Overview</h2>
        <p className="text-gray-600">Real-time market data and key indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((market) => (
          <Card key={market.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{market.name}</h3>
                {market.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{market.value}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {market.change}
                  </span>
                  <Badge 
                    variant={market.trend === 'up' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {market.changePercent}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Top Movers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMovers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{stock.symbol}</p>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{stock.price}</p>
                    <p className="text-sm text-green-600 font-medium">{stock.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Market Sentiment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Bull/Bear Ratio</span>
                <span className="text-lg font-bold text-green-600">65/35</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+12.5%</p>
                  <p className="text-sm text-gray-600">Weekly Gain</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">2.1B</p>
                  <p className="text-sm text-gray-600">Volume (24h)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}