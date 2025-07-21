import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { blink } from '@/blink/client'
import { Portfolio, PortfolioPosition } from '@/types'
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Search,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

export function PortfolioSimulator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Trade dialog state
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [tradeSymbol, setTradeSymbol] = useState('')
  const [tradeShares, setTradeShares] = useState('')
  const [tradePrice, setTradePrice] = useState('')
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null)
  const [searchResults, setSearchResults] = useState<StockQuote[]>([])

  // Portfolio creation state
  const [createPortfolioOpen, setCreatePortfolioOpen] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [newPortfolioCapital, setNewPortfolioCapital] = useState('100000')

  const loadPositions = async (portfolioId: string) => {
    try {
      const positionsData = await blink.db.portfolioPositions.list({
        where: { portfolioId },
        orderBy: { marketValue: 'desc' }
      })
      setPositions(positionsData)
    } catch (error) {
      console.error('Error loading positions:', error)
    }
  }

  const loadWatchlist = useCallback(async () => {
    try {
      const watchlistData = await blink.db.watchlist.list({
        where: { userId: user?.id },
        orderBy: { addedAt: 'desc' }
      })
      setWatchlist(watchlistData)
    } catch (error) {
      console.error('Error loading watchlist:', error)
    }
  }, [user?.id])

  const loadPortfolios = useCallback(async () => {
    try {
      const portfolioData = await blink.db.portfolios.list({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      })
      setPortfolios(portfolioData)
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData[0])
        loadPositions(portfolioData[0].id)
      }
    } catch (error) {
      console.error('Error loading portfolios:', error)
    }
  }, [user?.id, selectedPortfolio])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadPortfolios()
        loadWatchlist()
      }
      setLoading(false)
    })
    return unsubscribe
  }, [loadPortfolios, loadWatchlist])

  const createPortfolio = async () => {
    if (!newPortfolioName.trim() || !user) return

    try {
      const portfolioId = `portfolio_${Date.now()}`
      const capital = parseFloat(newPortfolioCapital)
      
      await blink.db.portfolios.create({
        id: portfolioId,
        userId: user.id,
        name: newPortfolioName,
        initialCapital: capital,
        currentValue: capital,
        cashBalance: capital,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      setNewPortfolioName('')
      setNewPortfolioCapital('100000')
      setCreatePortfolioOpen(false)
      loadPortfolios()
    } catch (error) {
      console.error('Error creating portfolio:', error)
    }
  }

  const searchStock = async (symbol: string) => {
    if (!symbol.trim()) return

    try {
      // Simulate stock search with mock data
      const mockStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24, volume: 45234567, marketCap: 2800000000000 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, changePercent: -0.85, volume: 23456789, marketCap: 1800000000000 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 4.67, changePercent: 1.25, volume: 34567890, marketCap: 2900000000000 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -5.23, changePercent: -2.06, volume: 67890123, marketCap: 790000000000 },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28, change: 12.45, changePercent: 1.44, volume: 45678901, marketCap: 2200000000000 }
      ]

      const results = mockStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
        stock.name.toLowerCase().includes(symbol.toLowerCase())
      )
      
      setSearchResults(results)
      if (results.length > 0) {
        setStockQuote(results[0])
        setTradePrice(results[0].price.toString())
      }
    } catch (error) {
      console.error('Error searching stocks:', error)
    }
  }

  const executeTrade = async () => {
    if (!selectedPortfolio || !tradeSymbol || !tradeShares || !tradePrice || !stockQuote) return

    try {
      const shares = parseFloat(tradeShares)
      const price = parseFloat(tradePrice)
      const totalAmount = shares * price
      const tradeId = `trade_${Date.now()}`

      // Record the trade
      await blink.db.trades.create({
        id: tradeId,
        portfolioId: selectedPortfolio.id,
        symbol: tradeSymbol.toUpperCase(),
        tradeType: tradeType,
        shares: shares,
        price: price,
        totalAmount: totalAmount,
        commission: 0,
        notes: `${tradeType.toUpperCase()} ${shares} shares of ${tradeSymbol.toUpperCase()} at $${price}`,
        executedAt: new Date().toISOString()
      })

      if (tradeType === 'buy') {
        // Check if position exists
        const existingPosition = positions.find(p => p.symbol === tradeSymbol.toUpperCase())
        
        if (existingPosition) {
          // Update existing position
          const newShares = existingPosition.shares + shares
          const newAvgPrice = ((existingPosition.shares * existingPosition.avgPrice) + totalAmount) / newShares
          
          await blink.db.portfolioPositions.update(existingPosition.id, {
            shares: newShares,
            avgPrice: newAvgPrice,
            currentPrice: price,
            marketValue: newShares * price,
            gainLoss: (price - newAvgPrice) * newShares,
            gainLossPercent: ((price - newAvgPrice) / newAvgPrice) * 100,
            updatedAt: new Date().toISOString()
          })
        } else {
          // Create new position
          const positionId = `position_${Date.now()}`
          await blink.db.portfolioPositions.create({
            id: positionId,
            portfolioId: selectedPortfolio.id,
            symbol: tradeSymbol.toUpperCase(),
            companyName: stockQuote.name,
            shares: shares,
            avgPrice: price,
            currentPrice: price,
            marketValue: totalAmount,
            gainLoss: 0,
            gainLossPercent: 0,
            sector: 'Technology', // Mock sector
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }

        // Update portfolio cash balance
        await blink.db.portfolios.update(selectedPortfolio.id, {
          cashBalance: selectedPortfolio.cashBalance - totalAmount,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Sell logic
        const existingPosition = positions.find(p => p.symbol === tradeSymbol.toUpperCase())
        if (existingPosition && existingPosition.shares >= shares) {
          const newShares = existingPosition.shares - shares
          
          if (newShares === 0) {
            // Remove position completely
            await blink.db.portfolioPositions.delete(existingPosition.id)
          } else {
            // Update position
            await blink.db.portfolioPositions.update(existingPosition.id, {
              shares: newShares,
              currentPrice: price,
              marketValue: newShares * price,
              gainLoss: (price - existingPosition.avgPrice) * newShares,
              gainLossPercent: ((price - existingPosition.avgPrice) / existingPosition.avgPrice) * 100,
              updatedAt: new Date().toISOString()
            })
          }

          // Update portfolio cash balance
          await blink.db.portfolios.update(selectedPortfolio.id, {
            cashBalance: selectedPortfolio.cashBalance + totalAmount,
            updatedAt: new Date().toISOString()
          })
        }
      }

      // Reset form and reload data
      setTradeDialogOpen(false)
      setTradeSymbol('')
      setTradeShares('')
      setTradePrice('')
      setStockQuote(null)
      setSearchResults([])
      
      loadPortfolios()
      if (selectedPortfolio) {
        loadPositions(selectedPortfolio.id)
      }
    } catch (error) {
      console.error('Error executing trade:', error)
    }
  }

  const addToWatchlist = async (symbol: string, name: string) => {
    if (!user) return

    try {
      const watchlistId = `watchlist_${Date.now()}`
      await blink.db.watchlist.create({
        id: watchlistId,
        userId: user.id,
        symbol: symbol.toUpperCase(),
        companyName: name,
        addedAt: new Date().toISOString()
      })
      loadWatchlist()
    } catch (error) {
      console.error('Error adding to watchlist:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Simulator</h1>
          <p className="text-gray-600">Practice trading with virtual money</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={createPortfolioOpen} onOpenChange={setCreatePortfolioOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
                <DialogDescription>
                  Start a new paper trading portfolio with virtual money
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="portfolio-name">Portfolio Name</Label>
                  <Input
                    id="portfolio-name"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    placeholder="My Trading Portfolio"
                  />
                </div>
                <div>
                  <Label htmlFor="initial-capital">Initial Capital</Label>
                  <Input
                    id="initial-capital"
                    type="number"
                    value={newPortfolioCapital}
                    onChange={(e) => setNewPortfolioCapital(e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <Button onClick={createPortfolio} className="w-full">
                  Create Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Execute Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Execute Trade</DialogTitle>
                <DialogDescription>
                  Buy or sell stocks with paper money
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Trade Type</Label>
                  <Select value={tradeType} onValueChange={(value: 'buy' | 'sell') => setTradeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="symbol"
                      value={tradeSymbol}
                      onChange={(e) => setTradeSymbol(e.target.value)}
                      placeholder="AAPL"
                      className="uppercase"
                    />
                    <Button
                      variant="outline"
                      onClick={() => searchStock(tradeSymbol)}
                      size="sm"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Search Results</Label>
                    {searchResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setTradeSymbol(stock.symbol)
                          setStockQuote(stock)
                          setTradePrice(stock.price.toString())
                          setSearchResults([])
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-gray-600">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(stock.price)}</div>
                            <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercent(stock.changePercent)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {stockQuote && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{stockQuote.symbol}</div>
                          <div className="text-sm text-gray-600">{stockQuote.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(stockQuote.price)}</div>
                          <div className={`text-sm ${stockQuote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(stockQuote.changePercent)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price per Share</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={tradePrice}
                    onChange={(e) => setTradePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {tradeShares && tradePrice && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="font-medium text-lg">
                      {formatCurrency(parseFloat(tradeShares) * parseFloat(tradePrice))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={executeTrade} 
                  className="w-full"
                  disabled={!tradeSymbol || !tradeShares || !tradePrice || !selectedPortfolio}
                >
                  Execute {tradeType === 'buy' ? 'Buy' : 'Sell'} Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolios Yet</h3>
            <p className="text-gray-600 mb-4">Create your first portfolio to start paper trading</p>
            <Button onClick={() => setCreatePortfolioOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Portfolio Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Selection</CardTitle>
                <CardDescription>Choose a portfolio to view and manage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolios.map((portfolio) => (
                    <Card
                      key={portfolio.id}
                      className={`cursor-pointer transition-all ${
                        selectedPortfolio?.id === portfolio.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => {
                        setSelectedPortfolio(portfolio)
                        loadPositions(portfolio.id)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{portfolio.name}</h3>
                          <Badge variant={Number(portfolio.totalGainLoss) >= 0 ? 'default' : 'destructive'}>
                            {formatPercent(Number(portfolio.totalGainLossPercent))}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold">
                            {formatCurrency(Number(portfolio.currentValue))}
                          </div>
                          <div className={`text-sm ${Number(portfolio.totalGainLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(portfolio.totalGainLoss) >= 0 ? '+' : ''}{formatCurrency(Number(portfolio.totalGainLoss))}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cash: {formatCurrency(Number(portfolio.cashBalance))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Summary */}
            {selectedPortfolio && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(Number(selectedPortfolio.currentValue))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                        <p className={`text-2xl font-bold ${Number(selectedPortfolio.totalGainLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Number(selectedPortfolio.totalGainLoss))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <PieChart className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(Number(selectedPortfolio.cashBalance))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Positions</p>
                        <p className="text-2xl font-bold">{positions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Current Positions</CardTitle>
                <CardDescription>Your active stock positions in {selectedPortfolio?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No positions yet. Execute your first trade to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Avg Price</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right">Market Value</TableHead>
                        <TableHead className="text-right">Gain/Loss</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>{position.companyName}</TableCell>
                          <TableCell className="text-right">{Number(position.shares).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(position.avgPrice))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(position.currentPrice))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(position.marketValue))}</TableCell>
                          <TableCell className={`text-right ${Number(position.gainLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Number(position.gainLoss))}
                          </TableCell>
                          <TableCell className={`text-right ${Number(position.gainLossPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(Number(position.gainLossPercent))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Stocks you're monitoring for potential trades</CardDescription>
              </CardHeader>
              <CardContent>
                {watchlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No stocks in your watchlist yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchlist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-sm text-gray-600">{item.companyName}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTradeSymbol(item.symbol)
                              setTradeDialogOpen(true)
                            }}
                          >
                            Trade
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await blink.db.watchlist.delete(item.id)
                              loadWatchlist()
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>All your executed trades for {selectedPortfolio?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Trade history will appear here after you execute trades.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}