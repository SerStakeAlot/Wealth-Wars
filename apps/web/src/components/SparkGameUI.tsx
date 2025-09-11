'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Coins, 
  TrendingUp, 
  Building2, 
  Zap, 
  Shield, 
  Swords,
  Timer,
  Star,
  Trophy,
  User,
  Sparkles,
  ArrowUpRight,
  Play,
  Share2,
  X,
  Wrench,
  Users,
  Menu,
  Home
} from 'lucide-react'

// Import our new components
import { Leaderboard } from '@/components/Leaderboard'
import { BattleSystem } from '@/components/BattleSystem'
import { MaintenanceSystem } from '@/components/MaintenanceSystem'
import { EnhancedGameStats } from '@/components/EnhancedGameStats'
import { NotificationCenter } from '@/components/NotificationCenter'
import { AchievementSystem } from '@/components/AchievementSystem'

interface SparkGameUIProps {
  onReturnHome?: () => void
}

export function SparkGameUI({ onReturnHome }: SparkGameUIProps) {
  const gameStore = useGameStore()
  const [isConnected, setIsConnected] = useState(true) // Assume connected since we're in game
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Update current time every second for cooldown calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Initialize player on first load
  useEffect(() => {
    if (!gameStore.player.id) {
      gameStore.initializePlayer()
    }
  }, [])
  
  // Calculate work cooldown
  const workCooldownRemaining = () => {
    const baseCooldown = 7200000 // 2 hours
    const cooldownReduction = gameStore.rapidProcessingRemaining > 0 ? 0.5 : 0
    const actualCooldown = baseCooldown * (1 - cooldownReduction)
    const timeRemaining = actualCooldown - (currentTime - gameStore.lastWorkTime)
    return Math.max(0, timeRemaining)
  }
  
  const isWorkOnCooldown = () => workCooldownRemaining() > 0
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m ${seconds}s`
  }
  
  const calculateBusinessProfit = (business: any) => {
    if (business.outlets === 0) return 0
    return business.baseProfit * business.outlets * (business.condition / 100)
  }
  
  const calculateBusinessNextCost = (business: any) => {
    return Math.floor(business.baseCost * Math.pow(1.15, business.outlets))
  }
  
  const canAfford = (cost: number) => gameStore.player.credits >= cost
  
  const ShareModal = () => (
    <Dialog open={gameStore.showShareModal} onOpenChange={gameStore.setShowShareModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Boost Your Rewards!
          </DialogTitle>
          <DialogDescription>
            Share your progress and earn 1.5x credits from your last work action!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => {
              // Mock share action
              const bonus = Math.floor(20 * 0.5) // 50% bonus
              gameStore.player.credits += bonus
              toast('Shared! Earned bonus credits!', {
                description: `You earned ${bonus} bonus credits for sharing!`
              })
              gameStore.setShowShareModal(false)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share for Bonus
          </Button>
          <Button 
            variant="outline" 
            onClick={() => gameStore.setShowShareModal(false)}
          >
            Skip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
  
  // Mobile Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-6 gap-1 p-2">
        {[
          { id: 'overview', icon: Home, label: 'Home' },
          { id: 'businesses', icon: Building2, label: 'Business' },
          { id: 'battle', icon: Swords, label: 'Battle' },
          { id: 'maintenance', icon: Wrench, label: 'Maintain' },
          { id: 'achievements', icon: Star, label: 'Achieve' },
          { id: 'leaderboard', icon: Trophy, label: 'Rankings' }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            className="flex flex-col h-auto py-2 px-1"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4 mb-1" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Wealth Wars
            </h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Level {gameStore.player.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-semibold">{gameStore.player.credits.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{gameStore.player.wealth.toLocaleString()}</span>
              </div>
            </div>
            
            <NotificationCenter />
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReturnHome}
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {gameStore.player.walletAddress ? 
                  (gameStore.player.walletAddress.slice(0, 8) + '...') : 
                  'Exit Game'}
              </span>
              <span className="sm:hidden">
                Profile
              </span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Mobile Stats Bar */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-semibold">{gameStore.player.credits.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-semibold">{gameStore.player.wealth.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wealth</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="battle">Battle</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Analytics */}
              <EnhancedGameStats />
              
              {/* Player Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <p className="text-2xl font-bold">{gameStore.player.level}</p>
                      </div>
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mt-4">
                      <Progress 
                        value={(gameStore.player.xp % 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {gameStore.player.xp % 100}/100 XP
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Credits</p>
                        <p className="text-2xl font-bold">{gameStore.player.credits.toLocaleString()}</p>
                      </div>
                      <Coins className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Wealth</p>
                        <p className="text-2xl font-bold">{gameStore.player.wealth.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Work Streak</p>
                        <p className="text-2xl font-bold">{gameStore.workStreak}</p>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Work System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Work System
                  </CardTitle>
                  <CardDescription>
                    Click to work and earn credits. Complete work sessions to build your empire.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button
                      size="lg"
                      onClick={gameStore.doWork}
                      disabled={isWorkOnCooldown()}
                      className="bg-green-600 hover:bg-green-700 font-semibold text-lg px-8"
                    >
                      {isWorkOnCooldown() ? (
                        <>
                          <Timer className="h-5 w-5 mr-2" />
                          Cooldown: {formatTime(workCooldownRemaining())}
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Work (+20 Credits)
                        </>
                      )}
                    </Button>
                    
                    {gameStore.rapidProcessingRemaining > 0 && (
                      <Badge variant="secondary" className="animate-pulse">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Rapid Processing: {gameStore.rapidProcessingRemaining} uses left
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Economy System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    Token Economy
                  </CardTitle>
                  <CardDescription>
                    Convert between credits and $WEALTH tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => gameStore.convertCreditsToWealth()}
                      disabled={!canAfford(100)}
                      className="h-24 flex flex-col gap-2"
                    >
                      <span>Convert Credits → $WEALTH</span>
                      <span className="text-sm opacity-75">100 Credits = 1 $WEALTH</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      disabled={gameStore.player.wealth < 1}
                      className="h-24 flex flex-col gap-2"
                    >
                      <span>Convert $WEALTH → Credits</span>
                      <span className="text-sm opacity-75">1 $WEALTH = 100 Credits</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Business tabs */}
            <TabsContent value="businesses" className="space-y-4">
              <div className="grid gap-4">
                {gameStore.businesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{business.icon}</div>
                          <div>
                            <h3 className="font-semibold">{business.name}</h3>
                            <p className="text-sm text-muted-foreground">{business.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Outlets: {business.outlets}</span>
                              <span>Profit/cycle: {calculateBusinessProfit(business)}</span>
                              <div className="flex items-center gap-1">
                                <span>Condition:</span>
                                <Progress value={business.condition} className="w-16 h-2" />
                                <span>{business.condition}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => gameStore.buyBusinessOutlet(business.id)}
                            disabled={!canAfford(calculateBusinessNextCost(business))}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Buy Outlet ({calculateBusinessNextCost(business)} credits)
                          </Button>
                          
                          {business.outlets > 0 && !business.hasManager && (
                            <Button
                              variant="outline"
                              onClick={() => gameStore.hireManager(business.id)}
                              disabled={!canAfford(business.baseCost * 5)}
                            >
                              Hire Manager ({business.baseCost * 5} credits)
                            </Button>
                          )}
                          
                          {business.outlets > 0 && (
                            <Button
                              variant="secondary"
                              onClick={() => gameStore.collectBusiness(business.id)}
                            >
                              Collect Profits
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Enhanced Businesses */}
              <Separator />
              <h3 className="text-lg font-semibold">Enhanced Businesses</h3>
              <div className="grid gap-4">
                {gameStore.enhancedBusinesses.map((business) => {
                  const isOnCooldown = currentTime - business.lastActivated < business.cooldown * 1000
                  const cooldownRemaining = business.cooldown * 1000 - (currentTime - business.lastActivated)
                  const isSynergyActive = gameStore.activeEnhancedBusinesses.includes(business.id)
                  
                  return (
                    <Card key={business.id} className="hover:shadow-lg transition-shadow border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{business.icon}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{business.name}</h3>
                                <Badge variant={business.abilityType === 'passive' ? 'default' : 'secondary'}>
                                  {business.abilityType}
                                </Badge>
                                {isSynergyActive && (
                                  <Badge className="bg-green-600 text-white">
                                    Synergy Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{business.description}</p>
                              <div className="mt-2">
                                <p className="text-sm font-medium text-primary">{business.abilityName}</p>
                                <p className="text-xs text-muted-foreground">{business.abilityDescription}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span>Outlets: {business.outlets}</span>
                                {business.outlets > 0 && (
                                  <span>Profit/cycle: {calculateBusinessProfit(business)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {business.outlets === 0 ? (
                              <Button
                                onClick={() => gameStore.buyEnhancedBusiness(business.id)}
                                disabled={!canAfford(calculateBusinessNextCost(business))}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Buy ({calculateBusinessNextCost(business)} credits)
                              </Button>
                            ) : (
                              <>
                                {business.abilityType !== 'passive' && (
                                  <Button
                                    onClick={() => gameStore.activateAbility(business.id)}
                                    disabled={isOnCooldown}
                                    variant="outline"
                                  >
                                    {isOnCooldown ? `Cooldown: ${formatTime(cooldownRemaining)}` : 'Activate'}
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={() => gameStore.toggleSynergy(business.id)}
                                  variant={isSynergyActive ? 'default' : 'outline'}
                                  size="sm"
                                >
                                  {isSynergyActive ? 'Remove Synergy' : 'Add Synergy'}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => gameStore.buyBusinessOutlet(business.id)}
                                  disabled={!canAfford(calculateBusinessNextCost(business))}
                                >
                                  +Outlet ({calculateBusinessNextCost(business)})
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              
              {gameStore.activeEnhancedBusinesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Active Synergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Work Bonus:</span>
                      <Badge className="bg-green-600 text-white">
                        +{gameStore.activeEnhancedBusinesses.length * 10}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="battle">
              <BattleSystem />
            </TabsContent>
            
            <TabsContent value="maintenance">
              <MaintenanceSystem />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementSystem />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <Leaderboard />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Mobile Content - show current tab content */}
        <div className="md:hidden">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <EnhancedGameStats />
              
              {/* Work System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Work System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="lg"
                    onClick={gameStore.doWork}
                    disabled={isWorkOnCooldown()}
                    className="w-full bg-green-600 hover:bg-green-700 font-semibold text-lg"
                  >
                    {isWorkOnCooldown() ? (
                      <>
                        <Timer className="h-5 w-5 mr-2" />
                        Cooldown: {formatTime(workCooldownRemaining())}
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Work (+20 Credits)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'businesses' && (
            <div className="space-y-4">
              {gameStore.businesses.map((business) => (
                <Card key={business.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{business.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{business.name}</h3>
                          <p className="text-xs text-muted-foreground">{business.description}</p>
                          <div className="text-sm mt-1">
                            <span>Outlets: {business.outlets}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => gameStore.buyBusinessOutlet(business.id)}
                        disabled={!canAfford(calculateBusinessNextCost(business))}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Buy Outlet ({calculateBusinessNextCost(business)} credits)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {activeTab === 'battle' && <BattleSystem />}
          {activeTab === 'maintenance' && <MaintenanceSystem />}
          {activeTab === 'achievements' && <AchievementSystem />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
        
      </main>

      {/* Share Modal */}
      <ShareModal />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}