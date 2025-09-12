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
import MultiplayerPanel from '@/components/MultiplayerPanel'
import { ClanSystem } from '@/components/ClanSystem'
import { EnhancedLeaderboards } from '@/components/EnhancedLeaderboards'
import { UnifiedBattleSystem } from '@/components/UnifiedBattleSystem'
import BoostBar from '@/components/BoostBar'
import WealthWarsLogo from '@/components/WealthWarsLogo'
import { AvatarButton } from '@/components/AvatarButton'
import { useMultiplayerStore } from '@/lib/multiplayerStore'

interface SparkGameUIProps {
  onReturnHome?: () => void
}

export function SparkGameUI({ onReturnHome }: SparkGameUIProps) {
  const gameStore = useGameStore()
  const [isConnected, setIsConnected] = useState(true) // Assume connected since we're in game
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [activeTab, setActiveTab] = useState('overview')
  const [showConverterModal, setShowConverterModal] = useState(false)
  const [convertAmount, setConvertAmount] = useState<number>(100)
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

  // Show toast when a boost event occurs (consumed ability)
  const lastBoostEvent = useGameStore(state => state.lastBoostEvent)
  useEffect(() => {
    if (!lastBoostEvent) return
    toast(lastBoostEvent.message)
    gameStore.clearLastBoostEvent()
  }, [lastBoostEvent])

  // Start realtime client once on mount
  useEffect(() => {
    try {
      const start = useMultiplayerStore.getState().startRealtime
      start()
    } catch (e) {
      console.info('failed to start realtime', e)
    }
  }, [])
  
  // Calculate work cooldown
  const workCooldownRemaining = () => {
    const last = gameStore.player.lastWorkTimestamp || 0
    const consecutive = gameStore.player.consecutiveWorkClicks || 0
    if (last === 0) return 0
    const sixHours = 6 * 60 * 60 * 1000
    const twoHours = 2 * 60 * 60 * 1000
    const required = consecutive >= 3 ? sixHours : twoHours
    const timeRemaining = required - (currentTime - last)
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

  const nextCooldownLabel = () => {
    const consecutive = gameStore.player.consecutiveWorkClicks || 0
    return consecutive >= 3 ? '6h' : '2h'
  }

  const canConvertCredits = (amount: number) => {
    return gameStore.player.credits >= amount && amount > 0
  }

  const canConvertWealth = (amount: number) => {
    return gameStore.player.wealth >= amount && amount > 0
  }
  
  const calculateBusinessProfit = (business: any) => {
    if (business.outlets === 0) return 0
    // Enhanced businesses don't generate passive profit, only work bonuses
    if (business.category) return 0
    return business.baseCost * business.outlets * (business.condition / 100) * 0.1 // 10% of base cost per outlet
  }
  
  const calculateBusinessNextCost = (business: any) => {
    return Math.floor(business.baseCost * Math.pow(1.15, business.outlets))
  }
  
  const canAfford = (cost: number) => gameStore.player.credits >= cost
  
  const ShareModal = () => (
    <Dialog open={gameStore.showShareModal} onOpenChange={gameStore.setShowShareModal}>
  <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
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
              // Activate a one-time 1.5x boost for next work action, then open Twitter intent
              gameStore.setShareBoostActive(true)

              const text = encodeURIComponent("I'm playing @wealthwars — building my empire in Wealth Wars! Join me and earn rewards. #WealthWars")
              const url = `https://twitter.com/intent/tweet?text=${text}`
              window.open(url, '_blank', 'noopener')

              toast('Shared! 1.5x boost active for your next work action', {
                description: `Your next Work will earn 1.5x credits.`
              })
              gameStore.setShowShareModal(false)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share for 1.5x
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

  const TreasuryModal = () => (
    <Dialog open={showConverterModal} onOpenChange={setShowConverterModal}>
  <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Treasury Converter
          </DialogTitle>
          <DialogDescription>
            Convert between Credits and $WEALTH. Enter an amount then choose conversion direction.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <input
            type="number"
            min={1}
            value={convertAmount}
            onChange={(e) => setConvertAmount(Number(e.target.value))}
            className="w-full border rounded p-2"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (!canConvertCredits(convertAmount)) {
                  toast.error(`Need ${convertAmount} credits to convert`)
                  return
                }
                gameStore.convertCreditsToWealth(convertAmount)
                toast.success(`Converted ${convertAmount} credits to $WEALTH`)
                setShowConverterModal(false)
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Credits → $WEALTH
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (!canConvertWealth(convertAmount)) {
                  toast.error(`Need ${convertAmount} $WEALTH to convert`)
                  return
                }
                gameStore.convertWealthToCredits(convertAmount)
                toast.success(`Converted ${convertAmount} $WEALTH to credits`)
                setShowConverterModal(false)
              }}
              className="flex-1"
            >
              $WEALTH → Credits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  
  // Mobile Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {[
          { id: 'overview', icon: Home, label: 'Home' },
          { id: 'combat', icon: Zap, label: 'Combat' },
          { id: 'clans', icon: Shield, label: 'Clans' },
          { id: 'leaderboard', icon: Trophy, label: 'Top' }
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
            <WealthWarsLogo className="text-2xl" />
            {/* Replaced Level badge with Avatar/Wallet display so we can repurpose this space */}
            <div className="hidden sm:block">
              {/* AvatarButton shows username or 'Player' and toggles a small menu */}
              <AvatarButton />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold gold-gradient">{gameStore.player.credits.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground font-semibold">$</span>
                <span className="font-semibold gold-gradient">{gameStore.player.wealth.toLocaleString()}</span>
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
        
        {/* Mobile Stats Bar removed — stats are shown in the HUD and EnhancedGameStats */}
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="clans">Clans</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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
                        <p className="text-2xl font-bold">{gameStore.player.workStreak}</p>
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
                      <Timer className="h-5 w-5" />
                      Clock In
                    </CardTitle>
                    <CardDescription>
                      Clock in to earn credits. Complete clock-in sessions to build your empire.
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
                          Work (+25 Credits)
                        </>
                      )}
                    </Button>
                    
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Sessions: {gameStore.player.workSessionCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* HUD indicators (Boost handled in BoostBar) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Consecutive Clock-Ins</p>
                        <p className="text-lg font-bold">{gameStore.player.consecutiveWorkClicks || 0}</p>
                      </div>
                      <Zap className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Cooldown</p>
                        <p className="text-lg font-bold">
                          {isWorkOnCooldown() ? formatTime(workCooldownRemaining()) : `Ready (${nextCooldownLabel()})`}
                        </p>
                      </div>
                      <Timer className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Boost bar showing active enhanced-business abilities */}
              <div className="mt-4">
                <BoostBar />
              </div>
              
              {/* Economy System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5" />
                      Treasury
                    </CardTitle>
                    <CardDescription>
                      Convert between credits and $WEALTH in the Treasury
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => gameStore.convertCreditsToWealth(100)}
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
                      <span className="text-sm opacity-75">1 $WEALTH = 50 Credits</span>
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
                          
                          {business.condition < 100 && (
                            <Button
                              variant="secondary"
                              onClick={() => gameStore.repairBusiness(business.id, 100 - business.condition)}
                            >
                              Repair Business
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
                  const isOnCooldown = currentTime - business.lastActivated < business.cooldown
                  const cooldownRemaining = business.cooldown - (currentTime - business.lastActivated)
                  const isSlotActive = gameStore.activeSlots.includes(business.id)
                  
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
                                {isSlotActive && (
                                  <Badge className="bg-green-600 text-white">
                                    Active Slot
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{business.description}</p>
                              <div className="mt-2">
                                <p className="text-sm font-medium text-primary">{business.abilityName}</p>
                                <p className="text-xs text-muted-foreground">{business.abilityDescription}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span>Cost: {business.cost} $WEALTH</span>
                                <span>Work Multiplier: +{business.workMultiplier}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {!business.owned ? (
                              <Button
                                onClick={() => gameStore.buyEnhancedBusiness(business.id)}
                                disabled={gameStore.player.wealth < business.cost}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Buy ({business.cost} $WEALTH)
                              </Button>
                            ) : (
                              <>
                                {business.abilityType !== 'passive' && (
                                  <Button
                                    onClick={() => gameStore.activateEnhancedBusiness(business.id)}
                                    disabled={isOnCooldown}
                                    variant="outline"
                                  >
                                    {isOnCooldown ? `Cooldown: ${formatTime(cooldownRemaining)}` : 'Activate'}
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={() => gameStore.toggleBusinessSlot(business.id)}
                                  variant={isSlotActive ? 'default' : 'outline'}
                                  size="sm"
                                >
                                  {isSlotActive ? 'Remove from Slot' : 'Add to Slot'}
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
              
              {gameStore.activeSlots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Active Business Slots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Work Multiplier:</span>
                      <Badge className="bg-green-600 text-white">
                        +{gameStore.getWorkMultiplier()}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="combat">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <UnifiedBattleSystem />
                </div>
                <div>
                  <MultiplayerPanel />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="clans">
              <ClanSystem />
            </TabsContent>
            
            <TabsContent value="maintenance">
              <MaintenanceSystem />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementSystem />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <EnhancedLeaderboards />
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
                        Work (+25 Credits)
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
          
          {activeTab === 'combat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <UnifiedBattleSystem />
                <MultiplayerPanel />
              </div>
            </div>
          )}
          {activeTab === 'clans' && <ClanSystem />}
          {activeTab === 'maintenance' && <MaintenanceSystem />}
          {activeTab === 'achievements' && <AchievementSystem />}
          {activeTab === 'leaderboard' && <EnhancedLeaderboards />}
        </div>
        
      </main>

      {/* Share Modal */}
      <ShareModal />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}