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
  Timer as TimerIcon,
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
import RealTimeBattleSystem from '@/components/RealTimeBattleSystem'
import BoostBar from '@/components/BoostBar'
import WealthWarsLogo from '@/components/WealthWarsLogo'
import { AvatarButton } from '@/components/AvatarButton'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { calculateActiveSynergies, calculateSynergyEffects } from '@/app/lib/synergies'

interface SparkGameUIProps {
  onReturnHome?: () => void
}

export function SparkGameUI({ onReturnHome }: SparkGameUIProps) {
  const gameStore = useGameStore()
  const isSSR = typeof window === 'undefined';
  const [isConnected, setIsConnected] = useState(true) // Assume connected since we're in game
  const [currentTime, setCurrentTime] = useState(isSSR ? 0 : Date.now())
  const [activeTab, setActiveTab] = useState('overview')
  const [showConverterModal, setShowConverterModal] = useState(false)
  const [convertAmount, setConvertAmount] = useState<number>(100)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('overview') // State for active sub-tab in businesses tab
  
  // Update current time every second for cooldown calculations
  useEffect(() => {
    if (!isSSR) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  
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
      const connect = useMultiplayerStore.getState().connectToMultiplayer
      // Fire and forget; connection handled internally
      connect()
    } catch (e) {
      console.info('failed to start realtime', e)
    }
  }, [])
  // Calculate work cooldown using centralized store helper
  const workCooldownRemaining = () => {
    return gameStore.getWorkCooldownRemaining(currentTime)
  }
  
  // Auto-manager tick: periodically attempts automated work when cooldown ends
  useEffect(() => {
    // On resume, first perform offline catch-up
    try {
      useGameStore.getState().catchUpManagerWork()
    } catch {}

    const tick = () => {
      try {
        useGameStore.getState().autoManagerWork()
        // Process sustained/timed effects
        useGameStore.getState().tickEffects()
      } catch {
        // ignore
      }
    }
    // run once, then interval
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

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
    // Enhanced businesses don't generate passive profit, only work bonuses
    if (business.category) return 0
    return gameStore.getBusinessProfit(business)
  }
  
  const calculateBusinessNextCost = (business: any) => {
    return gameStore.getOutletNextCost(business.id)
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

              const amount = gameStore.lastWorkReward ?? 0
              const text = encodeURIComponent(
                `Just clocked in at @WealthWars and earned ${amount} credits! 💰 Building my business empire one work action at a time. #WealthWars #GameFi #Crypto`
              )
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
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Analytics */}
              <EnhancedGameStats />
              
              {/* Player Stats (remove duplicated Credits/Wealth since EnhancedGameStats covers them) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <TimerIcon className="h-5 w-5" />
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
                      onClick={() => gameStore.doWork()}
                      disabled={isWorkOnCooldown()}
                      className="bg-green-600 hover:bg-green-700 font-semibold text-lg px-8"
                    >
                      {isWorkOnCooldown() ? (
                        <>
                          <TimerIcon className="h-5 w-5 mr-2" />
                          Cooldown: {formatTime(workCooldownRemaining())}
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Work (+{gameStore.getExpectedWorkPayout()} Credits)
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
                      <TimerIcon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Manager Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Manager
                  </CardTitle>
                  <CardDescription>
                    A global manager auto-clicks work for you when off cooldown. Each hire grants limited actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="text-sm">
                    <div className="font-medium">Remaining Actions</div>
                    <div className="text-2xl font-bold">{gameStore.manager.charges}</div>
                  </div>
                  <Button
                    onClick={() => gameStore.hireGlobalManager()}
                    disabled={gameStore.player.credits < gameStore.getManagerCost()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Hire (+20 actions) — {gameStore.getManagerCost()} credits
                  </Button>
                </CardContent>
              </Card>
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
              <Tabs
                value={activeSubTab} // Added state to control the active sub-tab
                onValueChange={setActiveSubTab} // Added handler to update the state
                defaultValue="overview"
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid gap-4">
                    {gameStore.businesses.map((business) => (
                      <Card key={business.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="text-3xl">{business.icon}</div>
                              <div>
                                <h3 className="font-semibold">{business.name}</h3>
                                <p className="text-sm text-muted-foreground">{business.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span>Outlets: {business.outlets}</span>
                                  <span>Profit/cycle: {calculateBusinessProfit(business)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <Button
                                onClick={() => gameStore.buyBusinessOutlet(business.id)}
                                disabled={!canAfford(calculateBusinessNextCost(business))}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Buy Outlet ({calculateBusinessNextCost(business)} credits)
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Enhanced Businesses Controls */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Enhanced Businesses
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        Active Slots: {gameStore.activeSlots.length}/{gameStore.maxSlots}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {gameStore.enhancedBusinesses.map((eb) => {
                        const owned = eb.owned;
                        const isActive = gameStore.activeSlots.includes(eb.id);
                        const now = currentTime;
                        const last = eb.lastActivated || 0;
                        const cd = eb.cooldown || 0;
                        const remaining = Math.max(0, cd - (now - last));
                        const canActivate = owned && remaining === 0;
                        return (
                          <Card key={eb.id} className={`hover:shadow-lg transition-shadow ${isActive ? 'border-green-600' : ''}`}>
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{eb.icon}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{eb.name}</h4>
                                    {owned ? (
                                      <Badge variant="secondary">Owned</Badge>
                                    ) : (
                                      <Badge>Cost: {eb.cost} $WEALTH</Badge>
                                    )}
                                    {isActive && <Badge className="bg-green-600">Slotted</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{eb.description}</p>
                                  <div className="text-xs text-muted-foreground capitalize">Category: {eb.category}</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!owned ? (
                                  <Button
                                    onClick={() => gameStore.buyEnhancedBusiness(eb.id)}
                                    disabled={gameStore.player.wealth < eb.cost}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    Buy — {eb.cost} $WEALTH
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant={isActive ? 'outline' : 'default'}
                                      onClick={() => gameStore.toggleBusinessSlot(eb.id)}
                                      disabled={!isActive && gameStore.activeSlots.length >= gameStore.maxSlots}
                                      size="sm"
                                    >
                                      {isActive ? 'Remove from Slot' : 'Activate Slot'}
                                    </Button>
                                    <Button
                                      onClick={() => gameStore.activateEnhancedBusiness(eb.id)}
                                      disabled={!canActivate}
                                      size="sm"
                                    >
                                      {canActivate ? 'Activate Ability' : `CD: ${formatTime(remaining)}`}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance">
                  <MaintenanceSystem />
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="combat">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Swords className="h-5 w-5" />
                        PvP Actions
                      </CardTitle>
                      <CardDescription>Choose your attack mode and engage rivals.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <UnifiedBattleSystem />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Real-time Battles
                      </CardTitle>
                      <CardDescription>Live skirmishes and instant feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RealTimeBattleSystem />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Defense & Shields
                      </CardTitle>
                      <CardDescription>Purchase shields and view current protection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Compact controls sourced from store to avoid duplication */}
                      <div className="flex flex-col gap-3">
                        <div className="text-sm text-muted-foreground">
                          Defense Rating: {gameStore.getDefenseRating()}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => gameStore.purchaseShield('basic')}
                            disabled={gameStore.player.wealth < 25}
                            title="1 hour duration"
                          >
                            Basic • 25 $WEALTH
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => gameStore.purchaseShield('advanced')}
                            disabled={gameStore.player.wealth < 50}
                            title="24 hours duration"
                          >
                            Advanced • 50 $WEALTH
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => gameStore.purchaseShield('elite')}
                            disabled={gameStore.player.wealth < 100}
                            title="72 hours duration"
                          >
                            Elite • 100 $WEALTH
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {gameStore.battleState.activeShield && gameStore.battleState.activeShield.expires > Date.now()
                            ? `Active: ${gameStore.battleState.activeShield.type} shield`
                            : 'No active shield'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TimerIcon className="h-5 w-5" />
                        Attack Cooldowns
                      </CardTitle>
                      <CardDescription>Keep an eye on when each attack is ready.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Standard: <span className="font-medium">{Math.max(0, (4*60*60*1000) - (Date.now() - (gameStore.battleState.lastStandardAttack || 0))) > 0 ? formatTime(Math.max(0, (4*60*60*1000) - (Date.now() - (gameStore.battleState.lastStandardAttack || 0)))) : 'Ready'}</span></div>
                        <div>Wealth Assault: <span className="font-medium">{Math.max(0, (12*60*60*1000) - (Date.now() - (gameStore.battleState.lastWealthAssault || 0))) > 0 ? formatTime(Math.max(0, (12*60*60*1000) - (Date.now() - (gameStore.battleState.lastWealthAssault || 0)))) : 'Ready'}</span></div>
                        <div>Land Siege: <span className="font-medium">{Math.max(0, (24*60*60*1000) - (Date.now() - (gameStore.battleState.lastLandSiege || 0))) > 0 ? formatTime(Math.max(0, (24*60*60*1000) - (Date.now() - (gameStore.battleState.lastLandSiege || 0)))) : 'Ready'}</span></div>
                        <div>Sabotage: <span className="font-medium">{Math.max(0, (8*60*60*1000) - (Date.now() - (gameStore.battleState.lastBusinessSabotage || 0))) > 0 ? formatTime(Math.max(0, (8*60*60*1000) - (Date.now() - (gameStore.battleState.lastBusinessSabotage || 0)))) : 'Ready'}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Multiplayer grid positioned below the attack cooldown grid on the right side */}
                  <MultiplayerPanel embedded />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="clans">
              <ClanSystem />
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
                    onClick={() => gameStore.doWork()}
                    disabled={isWorkOnCooldown()}
                    className="w-full bg-green-600 hover:bg-green-700 font-semibold text-lg"
                  >
                    {isWorkOnCooldown() ? (
                      <>
                        <TimerIcon className="h-5 w-5 mr-2" />
                        Cooldown: {formatTime(workCooldownRemaining())}
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Work (+{gameStore.getExpectedWorkPayout()} Credits)
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

              {/* Enhanced Businesses (mobile) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Enhanced Businesses
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {gameStore.activeSlots.length}/{gameStore.maxSlots} slots
                  </div>
                </div>
                <div className="space-y-3">
                  {gameStore.enhancedBusinesses.map((eb) => {
                    const owned = eb.owned;
                    const isActive = gameStore.activeSlots.includes(eb.id);
                    const now = currentTime;
                    const last = eb.lastActivated || 0;
                    const cd = eb.cooldown || 0;
                    const remaining = Math.max(0, cd - (now - last));
                    const canActivate = owned && remaining === 0;
                    return (
                      <Card key={eb.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{eb.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{eb.name}</h4>
                                {owned ? (
                                  <Badge variant="secondary">Owned</Badge>
                                ) : (
                                  <Badge>Cost: {eb.cost} $WEALTH</Badge>
                                )}
                                {isActive && <Badge className="bg-green-600">Slotted</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{eb.description}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {!owned ? (
                              <Button
                                onClick={() => gameStore.buyEnhancedBusiness(eb.id)}
                                disabled={gameStore.player.wealth < eb.cost}
                                className="col-span-2 bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                Buy — {eb.cost} $WEALTH
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant={isActive ? 'outline' : 'default'}
                                  onClick={() => gameStore.toggleBusinessSlot(eb.id)}
                                  disabled={!isActive && gameStore.activeSlots.length >= gameStore.maxSlots}
                                  size="sm"
                                >
                                  {isActive ? 'Remove Slot' : 'Activate Slot'}
                                </Button>
                                <Button
                                  onClick={() => gameStore.activateEnhancedBusiness(eb.id)}
                                  disabled={!canActivate}
                                  size="sm"
                                >
                                  {canActivate ? 'Activate' : `CD: ${formatTime(remaining)}`}
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'combat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <UnifiedBattleSystem />
                <RealTimeBattleSystem />
                <MultiplayerPanel embedded />
              </div>
            </div>
          )}
          {activeTab === 'clans' && <ClanSystem />}
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