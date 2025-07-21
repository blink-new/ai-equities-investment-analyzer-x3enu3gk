import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  Target,
  PieChart,
  BarChart3,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'news', name: 'News Analysis', icon: Newspaper },
  { id: 'theses', name: 'Market Theses', icon: Target },
  { id: 'portfolio', name: 'Portfolio Simulator', icon: PieChart },
  { id: 'analytics', name: 'Performance Analytics', icon: BarChart3 },
  { id: 'signals', name: 'Trading Signals', icon: TrendingUp },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "bg-white border-r transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-gray-900">Navigation</h2>
              <p className="text-xs text-gray-500">AI Investment Tools</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                collapsed && "px-2",
                isActive && "bg-primary/10 text-primary border-primary/20"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.id === 'news' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Live
                    </Badge>
                  )}
                </>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10",
            collapsed && "px-2"
          )}
        >
          <Settings className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Settings"}
        </Button>
      </div>
    </div>
  )
}