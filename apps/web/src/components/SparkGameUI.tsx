'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'

// Import our new components
// Removed legacy standalone Leaderboard import; combined into Progress tab
import { BattleSystem } from '@/components/BattleSystem'
import { MaintenanceSystem } from '@/components/MaintenanceSystem'
import { EnhancedGameStats } from '@/components/EnhancedGameStats'
import { NotificationCenter } from '@/components/NotificationCenter'
import { useNotificationStore } from '@/lib/notificationStore'
// Removed direct AchievementSystem import; rendered inside ProgressTab
import MultiplayerPanel from '@/components/MultiplayerPanel'
import { ClanSystem } from '@/components/ClanSystem'
// Removed direct EnhancedLeaderboards import; rendered inside ProgressTab
// Removed UnifiedBattleSystem (simulated PvP) — real-time battles remain
import RealTimeBattleSystem from '@/components/RealTimeBattleSystem'
import BoostBar from '@/components/BoostBar'
import WealthWarsLogo from '@/components/WealthWarsLogo'
import { AvatarButton } from '@/components/AvatarButton'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { calculateActiveSynergies, calculateSynergyEffects } from '@/app/lib/synergies'
import AboutTab from '@/components/AboutTab'
import ProgressTab from '@/components/ProgressTab'
import LotteryTab from '@/components/LotteryTab'
import BusinessDetailsCard from '@/components/BusinessDetailsCard'
import BusinessAssetDetails from '@/components/BusinessAssetDetails'
import type { Asset } from '@/app/lib/types'
import type { Business } from '@/lib/gameStore'

interface SparkGameUIProps {
  onReturnHome?: () => void
}

export function SparkGameUI({ onReturnHome }: SparkGameUIProps) {
  const gameStore = useGameStore()
  // Seed a welcome/banner notif once per session if none exist
  const pushNotif = useNotificationStore((s) => s.push)
  const notifCount = useNotificationStore((s) => s.notifications.length)
  const isSSR = typeof window === 'undefined';
  const [mounted, setMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(true) // Assume connected since we're in game
  const [currentTime, setCurrentTime] = useState(isSSR ? 0 : Date.now())
  const [activeTab, setActiveTab] = useState('overview')
  // Treasury & DEX local UI state
  const [convertAmount, setConvertAmount] = useState<number>(100)
  const [swapFrom, setSwapFrom] = useState<'USD' | 'SOL' | 'WEALTH'>('USD')
  const [swapTo, setSwapTo] = useState<'USD' | 'SOL' | 'WEALTH'>('WEALTH')
  const [swapAmount, setSwapAmount] = useState<number>(100)
  const [slippagePct, setSlippagePct] = useState<number>(1)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('overview') // State for active sub-tab in businesses tab
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsBizId, setDetailsBizId] = useState<string | undefined>(undefined)
  const [assetOpen, setAssetOpen] = useState(false)
  const [assetDetails, setAssetDetails] = useState<Asset | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Open details by deep link (?biz=id) and keep URL in sync
  useEffect(() => {
    const q = searchParams?.get('biz')
    if (q && q !== detailsBizId) {
      setDetailsBizId(q)
      setDetailsOpen(true)
    }
    if (!q && detailsOpen) {
      // If param removed externally, close modal
      setDetailsOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const openBizDetails = (id: string) => {
    // Route to proper modal based on whether it's an enhanced business or a standard asset
    const isEnhanced = gameStore.enhancedBusinesses.some((b:any) => b.id === id)
    if (isEnhanced) {
      setDetailsBizId(id)
      setDetailsOpen(true)
      try {
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.set('biz', id)
        router.replace(`?${params.toString()}`, { scroll: false })
      } catch {}
      return
    }
    // Standard business: open BusinessAssetDetails without touching URL
      // Map our GameStore Business -> Asset shape used by BusinessAssetDetails
      const toAsset = (b: Business): Asset => ({
        id: b.id,
        name: b.name,
        level: Math.max(1, (b.outlets ?? 0)),
        yieldPerTick: Math.max(1, Math.round(b.workMultiplier)),
        upgradeCost: Math.max(1, Math.round(b.baseCost * (1 + (b.outlets ?? 0) * 0.5))),
        condition: b.condition,
        cooldowns: { collect: 0, upgrade: 0, defend: 0 },
        outlets: b.outlets,
        multiplier: 1,
      })
      const biz = gameStore.businesses.find((a:any) => a.id === id) as Business | undefined
      const asset = biz ? toAsset(biz) : null
    setAssetDetails(asset)
    setAssetOpen(!!asset)
  }

  const closeBizDetails = () => {
    setDetailsOpen(false)
    try {
      const params = new URLSearchParams(searchParams?.toString() || '')
      params.delete('biz')
      const q = params.toString()
      router.replace(q ? `?${q}` : '?', { scroll: false })
    } catch {}
  }
  const closeAssetDetails = () => {
    setAssetOpen(false)
    setAssetDetails(null)
  }
  // Mobile Treasury tabs (Convert/Swap/Details)
  const [treasuryTab, setTreasuryTab] = useState<'convert' | 'swap' | 'details'>('convert')
  const pool = (gameStore as any).exchangePool as {
    rateCreditsPerWealth: number
    feeBps: number
    globalDailyCapWealth: number
    userDailyCapWealth: number
    redeemedTodayWealth: number
    perUserRedeemedToday: Record<string, number>
    resetAt: number
  }
  const poolUserMinted = pool?.perUserRedeemedToday?.[gameStore.player.id] || 0
  const poolGlobalRemaining = Math.max(0, (pool?.globalDailyCapWealth || 0) - (pool?.redeemedTodayWealth || 0))
  const poolUserRemaining = Math.max(0, (pool?.userDailyCapWealth || 0) - poolUserMinted)
  const poolTreasuryRemaining = Math.max(0, (gameStore.treasuryReserve.wealth || 0))
  const poolMaxMintable = Math.max(0, Math.min(poolGlobalRemaining, poolUserRemaining, poolTreasuryRemaining))
  const poolResetIn = Math.max(0, (pool?.resetAt || 0) - currentTime)
  // Toggle for live price nudges in the demo DEX
  const [liveQuotes, setLiveQuotes] = useState(true)
  
  // Update current time every second for cooldown calculations
  useEffect(() => {
    if (!isSSR) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);
  
  // Ensure client-only UI bits render after mount to avoid SSR hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Welcome banner once when empty
  useEffect(() => {
    if (notifCount === 0) {
      pushNotif({
        type: 'info',
        title: 'Build your empire, defend your Wealth',
        message: 'Welcome to the alpha — check the Treasury/DEX and battle systems. This banner auto-hides.',
        showInBanner: true,
        durationMs: 7000,
      })
    }
  }, [notifCount, pushNotif])
  
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

  // Mounted-aware cooldown renderer to prevent SSR hydration mismatches
  const renderCooldown = (lastTimestamp: number | undefined, durationMs: number) => {
    if (!mounted) return '…'
    const last = lastTimestamp || 0
    const remaining = Math.max(0, durationMs - (currentTime - last))
    return remaining > 0 ? formatTime(remaining) : 'Ready'
  }

  // Mounted-aware shield status to avoid using Date.now() directly in render
  const renderShieldStatus = () => {
    if (!mounted) return '…'
    const shield = gameStore.battleState.activeShield
    if (shield && shield.expires > currentTime) {
      const remaining = Math.max(0, shield.expires - currentTime)
      return `Active: ${shield.type} shield (${formatTime(remaining)} left)`
    }
    return 'No active shield'
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

  // Inline quote helper for the DEX
  const dexQuote = (from: 'USD' | 'SOL' | 'WEALTH', to: 'USD' | 'SOL' | 'WEALTH', amount: number) => {
    try {
      const fn = (gameStore as any).getDexQuote as ((f:any,t:any,a:number)=>{amountOut:number,fee:number}) | undefined
      return fn ? fn(from, to, amount) : { amountOut: 0, fee: 0 }
    } catch { return { amountOut: 0, fee: 0 } }
  }
  
  const swapBalances = () => ({
    USD: (gameStore.player.usd || 0),
    SOL: (gameStore.player.sol || 0),
    WEALTH: gameStore.player.wealth,
  }) as Record<'USD' | 'SOL' | 'WEALTH', number>

  // Live price updates
  useEffect(() => {
    // Keep legacy nudge for WEALTH price jitter when live quotes are enabled
    const nudge = (useGameStore.getState() as any).nudgeMarketPrices as (() => void) | undefined
    let nudgeId: any = null
    if (nudge && liveQuotes) {
      nudgeId = setInterval(() => { try { nudge() } catch {} }, 5000)
    }

    // Fetch SOL/USD from a public API for more accurate pricing
    let cancelled = false
    const setPrices = (useGameStore.getState() as any).setMarketPrices as ((next: Partial<{ solUsd: number; wealthUsd: number }>) => void) | undefined
    const fetchPrices = async () => {
      if (!liveQuotes || !setPrices) return
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const j = await r.json().catch(() => null)
        const solUsd = j?.solana?.usd
        if (!cancelled && typeof solUsd === 'number' && isFinite(solUsd)) {
          try { setPrices({ solUsd }) } catch {}
        }
      } catch {
        // ignore network errors; keep demo defaults
      }
    }

    // initial fetch + interval
    fetchPrices()
    const priceId = setInterval(fetchPrices, 60_000)

    return () => {
      cancelled = true
      if (nudgeId) clearInterval(nudgeId)
      clearInterval(priceId)
    }
  }, [liveQuotes])

  // Unified quote values to keep displayed numbers consistent within a render
  const { qAmountOut, qFee, recvOut, minOut } = useMemo(() => {
    const q = dexQuote(swapFrom, swapTo, swapAmount)
    const out = q.amountOut || 0
    const fee = q.fee || 0
    const recv = swapTo === 'SOL' ? (Math.round(out * 1e4) / 1e4) : Math.floor(out)
    const min = swapTo === 'SOL'
      ? Math.round((out * (1 - slippagePct / 100)) * 1e4) / 1e4
      : Math.floor(out * (1 - slippagePct / 100))
    return { qAmountOut: out, qFee: fee, recvOut: recv, minOut: min }
  }, [swapFrom, swapTo, swapAmount, slippagePct, (gameStore as any).marketPrices, (gameStore as any).dexFeeBps])

  // Swap handler used by both mobile and desktop DEX buttons
  const handleSwap = () => {
    try {
      const fn = (gameStore as any).swapTokens as ((f:any,t:any,a:number)=>{ success: boolean; amountOut?: number; error?: string }) | undefined
      if (!fn) { toast.error('DEX not available'); return }
      const q = dexQuote(swapFrom, swapTo, swapAmount)
      const minOut = swapTo === 'SOL'
        ? Math.round((q.amountOut * (1 - slippagePct/100)) * 1e4)/1e4
        : Math.floor(q.amountOut * (1 - slippagePct/100))
      if ((q.amountOut || 0) <= 0) { toast.error('Invalid quote'); return }
      const res = fn(swapFrom, swapTo, swapAmount)
      if (!res.success) { toast.error(res.error || 'Swap failed'); return }
      if ((res.amountOut || 0) < minOut) { toast.error('Slippage exceeded'); return }
      toast.success(`Swapped ${swapAmount} ${swapFrom} → ${res.amountOut} ${swapTo}`)
    } catch (e:any) {
      toast.error(e?.message || 'Swap failed')
    }
  }
  
  // Mobile Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {[
          { id: 'overview', icon: Home, label: 'Home' },
          { id: 'combat', icon: Zap, label: 'Combat' },
          { id: 'progress', icon: Trophy, label: 'Progress' },
          { id: 'lottery', icon: Sparkles, label: 'Lottery' }
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="lottery">Lottery</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
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
                      disabled={mounted ? isWorkOnCooldown() : false}
                      className="bg-green-600 hover:bg-green-700 font-semibold text-lg px-8"
                    >
                      {mounted && isWorkOnCooldown() ? (
                        <>
                          <TimerIcon className="h-5 w-5 mr-2" />
                          Cooldown: {formatTime(workCooldownRemaining())}
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Work (+{mounted ? gameStore.getExpectedWorkPayout() : '…'} Credits)
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
                          {mounted ? (isWorkOnCooldown() ? formatTime(workCooldownRemaining()) : `Ready (${nextCooldownLabel()})`) : '…'}
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
              
              {/* Treasury & DEX */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    Treasury & DEX
                  </CardTitle>
                  <CardDescription>Swap SOL / USD / $WEALTH and convert Credits ⇄ $WEALTH. Tokenomics and reserves below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Balances Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded border border-border p-3">
                      <div className="text-muted-foreground">Credits</div>
                      <div className="text-lg font-semibold">{gameStore.player.credits.toLocaleString()}</div>
                    </div>
                    <div className="rounded border border-border p-3">
                      <div className="text-muted-foreground">$WEALTH</div>
                      <div className="text-lg font-semibold">{gameStore.player.wealth.toLocaleString()}</div>
                    </div>
                    <div className="rounded border border-border p-3">
                      <div className="text-muted-foreground">USD</div>
                      <div className="text-lg font-semibold">{(gameStore.player.usd || 0).toLocaleString()}</div>
                    </div>
                    <div className="rounded border border-border p-3">
                      <div className="text-muted-foreground">SOL</div>
                      <div className="text-lg font-semibold">{(gameStore.player.sol || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  {/* Mobile: Tabs for Converter, Swap, Details */}
                  <div className="md:hidden">
                    <Tabs value={treasuryTab} onValueChange={(v) => setTreasuryTab(v as 'convert' | 'swap' | 'details')} className="space-y-3">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="convert">Convert</TabsTrigger>
                        <TabsTrigger value="swap">Swap</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>
                      <TabsContent value="convert">
                        {/* Credits ⇄ WEALTH Converter (mobile) */}
                        <div className="rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">Exchange Pool: Credits → $WEALTH</div>
                            <div className="text-xs text-muted-foreground">Rate: {pool?.rateCreditsPerWealth ?? 100} C = 1 W • Fee {pool?.feeBps ?? 0} bps</div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input type="number" min={1} value={convertAmount} onChange={(e) => setConvertAmount(Number(e.target.value))} className="w-full sm:w-40 border rounded p-2 bg-background" />
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Button onClick={() => { if (!canConvertCredits(convertAmount)) { toast.error(`Need ${convertAmount} credits`); return } gameStore.convertCreditsToWealth(convertAmount) }} className="bg-green-600 hover:bg-green-700">Redeem</Button>
                              <Button variant="outline" disabled title="Disabled under Exchange Pool">$WEALTH → Credits</Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>Global remaining today: <span className="font-medium">{poolGlobalRemaining} W</span></div>
                            <div>Your remaining today: <span className="font-medium">{poolUserRemaining} W</span></div>
                            <div>Treasury availability: <span className="font-medium">{poolTreasuryRemaining} W</span></div>
                            <div>Resets in: <span className="font-medium">{formatTime(poolResetIn)}</span></div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="swap">
                        {/* DEX Swapper (mobile) */}
                        <div className="rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">DEX: Swap Tokens</div>
                            <div className="text-xs text-muted-foreground">1 SOL = ${(gameStore as any).marketPrices?.solUsd ?? 150} USD • 1 W = ${(gameStore as any).marketPrices?.wealthUsd ?? 1} USD • Fee {(gameStore as any).dexFeeBps ?? 50} bps</div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 items-center">
                            <div className="grid grid-cols-2 gap-2">
                              <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value as any)} className="border rounded p-2 bg-background"><option>USD</option><option>SOL</option><option>WEALTH</option></select>
                              <select value={swapTo} onChange={(e) => setSwapTo(e.target.value as any)} className="border rounded p-2 bg-background"><option>USD</option><option>SOL</option><option>WEALTH</option></select>
                            </div>
                            <div className="flex gap-2">
                              <input type="number" min={0} value={swapAmount} onChange={(e) => setSwapAmount(Number(e.target.value))} className="border rounded p-2 bg-background w-full" />
                              <Button variant="outline" size="sm" onClick={() => setSwapAmount(Math.floor(swapBalances()[swapFrom]))} title="Max">Max</Button>
                              <Button variant="ghost" onClick={() => { const f = swapFrom; setSwapFrom(swapTo); setSwapTo(f) }} title="Flip">↕︎</Button>
                            </div>
                            <Button onClick={handleSwap} className="bg-green-600 hover:bg-green-700" disabled={swapFrom === swapTo || swapAmount <= 0 || swapBalances()[swapFrom] < swapAmount}>Swap</Button>
                            <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-2">
                              <div>{mounted ? `You receive ≈ ${recvOut} ${swapTo} (fee ${swapFrom} ${Math.round((qFee||0)*100)/100})` : '…'}</div>
                              <div className="flex items-center gap-2"><span>Slippage</span><input type="number" min={0} max={5} value={slippagePct} onChange={(e)=>setSlippagePct(Number(e.target.value))} className="w-16 border rounded p-1 bg-background" /><span>%</span></div>
                              <div>{mounted ? `Min received: ${minOut} ${swapTo}` : 'Min received: …'}</div>
                            </div>
                          </div>
                          {/* close rounded container */}
                        </div>
                        </TabsContent>
                        <TabsContent value="details">
                          {/* Tokenomics & Reserves (mobile) */}
                          <div className="rounded-lg border border-border p-4">
                            <div className="font-medium mb-2">Tokenomics</div>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="rounded border border-border p-3">
                                <div className="text-muted-foreground">Treasury Reserves (Demo)</div>
                                <div>Credits: {gameStore.treasuryReserve.credits.toLocaleString()}</div>
                                <div>$WEALTH: {gameStore.treasuryReserve.wealth.toLocaleString()}</div>
                              </div>
                              <div className="rounded border border-border p-3">
                                <div className="text-muted-foreground">Conversion Policy</div>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Base 100 C → 1 W, 1 W → 50 C</li>
                                  <li>Trading Exchange: 15% better rates when slotted</li>
                                  <li>Marketing Agency: +25% better during active boost</li>
                                </ul>
                              </div>
                              <div className="rounded border border-border p-3">
                                <div className="text-muted-foreground">DEX Notes</div>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>Off-chain demo with fixed prices</li>
                                  <li>Fee {(gameStore as any).dexFeeBps ?? 50} bps applied on input</li>
                                  <li>SOL precision 4 dp, others integer</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                    </Tabs>
                  </div>

                  {/* Desktop: stacked sections */}
                  <div className="hidden md:block space-y-6">
                    {/* Converter (desktop) */}
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">Exchange Pool: Credits → $WEALTH</div>
                        <div className="text-xs text-muted-foreground">Rate: {pool?.rateCreditsPerWealth ?? 100} C = 1 W • Fee {pool?.feeBps ?? 0} bps</div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="number" min={1} value={convertAmount} onChange={(e) => setConvertAmount(Number(e.target.value))} className="w-full sm:w-40 border rounded p-2 bg-background" />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button onClick={() => { if (!canConvertCredits(convertAmount)) { toast.error(`Need ${convertAmount} credits`); return } gameStore.convertCreditsToWealth(convertAmount) }} className="bg-green-600 hover:bg-green-700">Redeem</Button>
                          <Button variant="outline" disabled title="Disabled under Exchange Pool">$WEALTH → Credits</Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-2">
                        <div>Global remaining: <span className="font-medium">{poolGlobalRemaining} W</span></div>
                        <div>Your remaining: <span className="font-medium">{poolUserRemaining} W</span></div>
                        <div>Treasury availability: <span className="font-medium">{poolTreasuryRemaining} W</span></div>
                        <div>Resets in: <span className="font-medium">{formatTime(poolResetIn)}</span></div>
                      </div>
                    </div>

                    {/* DEX Swapper (desktop) */}
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">DEX: Swap Tokens</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-3">
                          <span>Prices: 1 SOL = ${(gameStore as any).marketPrices?.solUsd ?? 150} USD • 1 W = ${(gameStore as any).marketPrices?.wealthUsd ?? 1} USD • Fee {(gameStore as any).dexFeeBps ?? 50} bps</span>
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input type="checkbox" className="accent-green-600" checked={liveQuotes} onChange={(e)=>setLiveQuotes(e.target.checked)} />
                            <span>Live quotes</span>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                        <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value as any)} className="border rounded p-2 bg-background"><option>USD</option><option>SOL</option><option>WEALTH</option></select>
                        <div className="flex gap-2">
                          <input type="number" min={0} value={swapAmount} onChange={(e) => setSwapAmount(Number(e.target.value))} className="border rounded p-2 bg-background w-full" />
                          <Button variant="outline" size="sm" onClick={() => setSwapAmount(Math.floor(swapBalances()[swapFrom]))} title="Max">Max</Button>
                        </div>
                        <select value={swapTo} onChange={(e) => setSwapTo(e.target.value as any)} className="border rounded p-2 bg-background"><option>USD</option><option>SOL</option><option>WEALTH</option></select>
                        <Button variant="ghost" onClick={() => { const f = swapFrom; setSwapFrom(swapTo); setSwapTo(f) }} title="Flip">↕︎</Button>
                        <Button onClick={handleSwap} className="bg-green-600 hover:bg-green-700" disabled={swapFrom === swapTo || swapAmount <= 0 || swapBalances()[swapFrom] < swapAmount}>Swap</Button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex-1">{mounted ? `You receive ≈ ${recvOut} ${swapTo} (fee ${swapFrom} ${Math.round((qFee||0)*100)/100})` : '…'}</div>
                        <div className="flex items-center gap-2"><span>Slippage</span><input type="number" min={0} max={5} value={slippagePct} onChange={(e)=>setSlippagePct(Number(e.target.value))} className="w-16 border rounded p-1 bg-background" /><span>%</span></div>
                        <div>{mounted ? `Min received: ${minOut} ${swapTo}` : 'Min received: …'}</div>
                      </div>
                    </div>

                    {/* Tokenomics & Reserves (desktop) */}
                    <div className="rounded-lg border border-border p-4">
                      <div className="font-medium mb-2">Tokenomics</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded border border-border p-3">
                          <div className="text-muted-foreground">Treasury Reserves (Demo)</div>
                          <div>Credits: {gameStore.treasuryReserve.credits.toLocaleString()}</div>
                          <div>$WEALTH: {gameStore.treasuryReserve.wealth.toLocaleString()}</div>
                        </div>
                        <div className="rounded border border-border p-3">
                          <div className="text-muted-foreground">Exchange Pool Policy</div>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>One-way: Credits → $WEALTH at pool rate</li>
                            <li>Fee {pool?.feeBps ?? 0} bps on input credits</li>
                            <li>Daily caps: Global {pool?.globalDailyCapWealth ?? 0} W, Per-user {pool?.userDailyCapWealth ?? 0} W</li>
                            <li>Trading Exchange/Marketing Agency can improve effective rate</li>
                          </ul>
                        </div>
                        <div className="rounded border border-border p-3">
                          <div className="text-muted-foreground">DEX Notes</div>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Off-chain demo with fixed prices</li>
                            <li>Fee {(gameStore as any).dexFeeBps ?? 50} bps applied on input</li>
                            <li>SOL precision 4 dp, others integer</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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
                      <Card
                        key={business.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => openBizDetails(business.id)}
                      >
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
                                onClick={(e) => { e.stopPropagation(); gameStore.buyBusinessOutlet(business.id) }}
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
                      <div
                        className="flex items-center gap-2"
                        title="Fill all 4 slots to unlock the ultimate synergy bonuses."
                      >
                        <div className="text-sm text-muted-foreground">
                          Active Slots: {gameStore.activeSlots.length}/{gameStore.maxSlots}
                        </div>
                        {gameStore.activeSlots.length >= 4 && (
                          <Badge className="bg-purple-600">Ultimate synergy</Badge>
                        )}
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
                          <Card
                            key={eb.id}
                            className={`hover:shadow-lg transition-shadow ${isActive ? 'border-green-600' : ''} cursor-pointer`}
                            onClick={() => openBizDetails(eb.id)}
                          >
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
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClickCapture={(e) => e.stopPropagation()}
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
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClickCapture={(e) => e.stopPropagation()}
                                    >
                                      {isActive ? 'Remove from Slot' : 'Activate Slot'}
                                    </Button>
                                    <Button
                                      onClick={() => gameStore.activateEnhancedBusiness(eb.id)}
                                      disabled={!canActivate}
                                      size="sm"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClickCapture={(e) => e.stopPropagation()}
                                    >
                                      {canActivate ? 'Activate Ability' : (mounted ? `CD: ${formatTime(remaining)}` : 'CD: …')}
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
                          {renderShieldStatus()}
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
                        <div>Standard: <span className="font-medium">{renderCooldown(gameStore.battleState.lastStandardAttack, 4*60*60*1000)}</span></div>
                        <div>Wealth Assault: <span className="font-medium">{renderCooldown(gameStore.battleState.lastWealthAssault, 12*60*60*1000)}</span></div>
                        <div>Land Siege: <span className="font-medium">{renderCooldown(gameStore.battleState.lastLandSiege, 24*60*60*1000)}</span></div>
                        <div>Sabotage: <span className="font-medium">{renderCooldown(gameStore.battleState.lastBusinessSabotage, 8*60*60*1000)}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Clans integrated into Combat */}
                  <ClanSystem />
                  {/* Multiplayer grid positioned below the attack cooldown grid on the right side */}
                  <MultiplayerPanel embedded />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="progress">
              <ProgressTab />
            </TabsContent>

            <TabsContent value="about">
              <AboutTab />
            </TabsContent>
            <TabsContent value="lottery">
              <LotteryTab />
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
                    disabled={mounted ? isWorkOnCooldown() : false}
                    className="w-full bg-green-600 hover:bg-green-700 font-semibold text-lg"
                  >
                    {mounted && isWorkOnCooldown() ? (
                      <>
                        <TimerIcon className="h-5 w-5 mr-2" />
                        Cooldown: {formatTime(workCooldownRemaining())}
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Work (+{mounted ? gameStore.getExpectedWorkPayout() : '…'} Credits)
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
                <Card
                  key={business.id}
                  className="cursor-pointer"
                  onClick={() => openBizDetails(business.id)}
                >
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
                        onClick={(e) => { e.stopPropagation(); gameStore.buyBusinessOutlet(business.id) }}
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
                  <div
                    className="flex items-center gap-2"
                    title="Fill all 4 slots to unlock the ultimate synergy bonuses."
                  >
                    <span className="text-xs text-muted-foreground">
                      {gameStore.activeSlots.length}/{gameStore.maxSlots} slots
                    </span>
                    {gameStore.activeSlots.length >= 4 && (
                      <Badge className="bg-purple-600">Ultimate</Badge>
                    )}
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
                      <Card key={eb.id} className="cursor-pointer" onClick={() => openBizDetails(eb.id)}>
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
                                onMouseDown={(e) => e.stopPropagation()}
                                onClickCapture={(e) => e.stopPropagation()}
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
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClickCapture={(e) => e.stopPropagation()}
                                >
                                  {isActive ? 'Remove Slot' : 'Activate Slot'}
                                </Button>
                                <Button
                                  onClick={() => gameStore.activateEnhancedBusiness(eb.id)}
                                  disabled={!canActivate}
                                  size="sm"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClickCapture={(e) => e.stopPropagation()}
                                >
                                  {canActivate ? 'Activate' : (mounted ? `CD: ${formatTime(remaining)}` : 'CD: …')}
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
                <RealTimeBattleSystem />
                <MultiplayerPanel embedded />
                {/* Clans integrated into Combat on mobile */}
                <ClanSystem />
              </div>
            </div>
          )}
          {activeTab === 'progress' && <ProgressTab />}
          {activeTab === 'lottery' && <LotteryTab />}
        </div>
        
      </main>

  {/* Business Details Modal (deep-link aware) */}
  <BusinessDetailsCard businessId={detailsBizId} open={detailsOpen} onClose={closeBizDetails} />
  {/* Standard Business Asset Details */}
  <BusinessAssetDetails open={assetOpen} asset={assetDetails} onClose={closeAssetDetails} />

  {/* Share Modal */}
      <ShareModal />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}