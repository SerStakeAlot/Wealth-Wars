"use client";

import React, { useState, useEffect } from 'react'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Swords,
  Shield,
  Zap,
  Target,
  Crown,
  Timer,
  Coins,
  Users,
  Search,
  X,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

export function RealTimeBattleSystem() {
  const multiplayerStore = useMultiplayerStore()
  const gameStore = useGameStore()
  const [selectedOpponent, setSelectedOpponent] = useState<string>('')
  const [battleType, setBattleType] = useState<string>('standard')
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [resultModal, setResultModal] = useState<null | { won: boolean; title: string; description: string }>(null)

  // Update time every second for real-time countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredPlayers = multiplayerStore.onlinePlayers.filter(player => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    player.id !== gameStore.player.id
  )

  const formatTimeRemaining = (endTime: number) => {
    const remaining = Math.max(0, endTime - currentTime)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getBattleTypeInfo = (type: string) => {
    switch (type) {
      case 'standard':
        return {
          name: 'Standard Attack',
          description: 'Basic attack with 10% max theft',
          icon: <Swords className="h-4 w-4" />,
          color: 'text-warning',
          cost: { amount: 15, currency: 'credits' }
        }
      case 'business_sabotage':
        return {
          name: 'Business Sabotage',
          description: 'Damage opponent\'s businesses',
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-destructive',
          cost: { amount: 25, currency: 'credits' }
        }
      case 'wealth_assault':
        return {
          name: 'Wealth Assault',
          description: 'High-stakes wealth theft (25% cap)',
          icon: <Coins className="h-4 w-4" />,
          color: 'text-info',
          cost: { amount: 10, currency: 'wealth' }
        }
      case 'land_siege':
        return {
          name: 'Land Siege',
          description: 'Siege to capture or plunder land (35% cap)',
          icon: <Crown className="h-4 w-4" />,
          color: 'text-warning',
          cost: { amount: 25, currency: 'wealth' }
        }
      default:
        return {
          name: 'Unknown',
          description: 'Unknown battle type',
          icon: <Swords className="h-4 w-4" />,
          color: 'text-muted-foreground'
        }
    }
  }

  const challengePlayer = () => {
    if (!selectedOpponent) {
      toast.error('Please select an opponent')
      return
    }

    // Stakes are optional and in credits; only enforce if > 0
    if (stakeAmount > 0 && stakeAmount > gameStore.player.credits) {
      toast.error('Insufficient credits for the stake amount')
      return
    }

    const opponent = multiplayerStore.onlinePlayers.find(p => p.id === selectedOpponent)
    if (!opponent) {
      toast.error('Opponent not found')
      return
    }

    multiplayerStore.challengePlayer(selectedOpponent, battleType, { type: 'credits', amount: stakeAmount })

    toast.success(`Battle challenge sent to ${opponent.username}!`)
    setSelectedOpponent('')
  setStakeAmount(0)
  }

  const acceptBattle = (battleId: string) => {
    // Move invite to active (for internal state consistency), then resolve immediately
    multiplayerStore.acceptBattleChallenge(battleId)

    const ms = useMultiplayerStore.getState()
    const active = ms.activeBattles.find(b => b.id === battleId)
    if (!active) {
      toast.error('Battle not found')
      return
    }

    // Enforce attack costs based on type
    const info = getBattleTypeInfo(active.attackType)
    const cost = (info as any).cost as { amount: number; currency: 'credits' | 'wealth' } | undefined
    if (cost && cost.amount > 0) {
      if (cost.currency === 'credits') {
        if (gameStore.player.credits < cost.amount) {
          toast.error(`Need ${cost.amount} credits for this attack`)
          return
        }
        useGameStore.setState(s => ({ player: { ...s.player, credits: s.player.credits - cost.amount } }))
      } else {
        if (gameStore.player.wealth < cost.amount) {
          toast.error(`Need ${cost.amount} $WEALTH for this attack`)
          return
        }
        useGameStore.setState(s => ({ player: { ...s.player, wealth: Math.max(0, s.player.wealth - cost.amount) } }))
      }
    }

    // Determine roles and opponent
    const youId = gameStore.player.id || 'current_player'
    const attackerIsYou = active.attacker === youId || active.attacker === 'current_player'
    const opponentId = attackerIsYou ? active.defender : active.attacker
    const opponent = ms.onlinePlayers.find(p => p.id === opponentId)

    // Offense/Defense scores
    const yourWAR = (() => { try { return gameStore.calculateWAR() } catch { return 1000 } })()
    const oppScore = opponent?.battlePower ?? 1200
    const defenderDefenseRating = attackerIsYou
      ? Math.min(100, Math.floor((opponent?.battlePower ?? 1200) / 20)) // approx
      : gameStore.getDefenseRating()

    const attackerScore = attackerIsYou ? yourWAR : oppScore
    const defenderScore = attackerIsYou ? oppScore : yourWAR

    // Success chance modeled on core attack math, adjusted by defense rating
    let successChance = 0.6 + ((attackerScore - defenderScore) / 2000) - (defenderDefenseRating / 200)
    successChance = Math.max(0.1, Math.min(0.9, successChance))
    const roll = Math.random()
    const attackerWins = roll < successChance

    // Stakes transfer (credits) — compute actual deltas (clamp at available balances)
    const stake = active.stakes?.type === 'credits' ? (active.stakes?.amount ?? 0) : 0
    const youWin = attackerIsYou ? attackerWins : !attackerWins
    let creditDeltaForYou = 0
    let actualStakePaid = 0
    if (stake > 0) {
      const myCreditsBefore = useGameStore.getState().player.credits
      const oppCreditsBefore = opponent?.credits ?? 0
      if (youWin) {
        // Opponent pays up to their available credits; you receive that amount
        actualStakePaid = Math.min(stake, oppCreditsBefore)
        creditDeltaForYou = actualStakePaid
        // You gain
        useGameStore.setState(s => ({ player: { ...s.player, credits: s.player.credits + actualStakePaid } }))
        // Opponent loses
        try {
          useMultiplayerStore.setState((ms: any) => ({
            onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === opponentId ? { ...p, credits: Math.max(0, (p.credits ?? 0) - actualStakePaid) } : p)
          }))
        } catch {}
      } else {
        // You pay up to your available credits; opponent receives that amount
        actualStakePaid = Math.min(stake, myCreditsBefore)
        creditDeltaForYou = -actualStakePaid
        // You lose
        useGameStore.setState(s => ({ player: { ...s.player, credits: Math.max(0, s.player.credits - actualStakePaid) } }))
        // Opponent gains
        try {
          useMultiplayerStore.setState((ms: any) => ({
            onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === opponentId ? { ...p, credits: (p.credits ?? 0) + actualStakePaid } : p)
          }))
        } catch {}
      }
    }

    // Wealth transfer on successful wealth-related attacks (standard/wealth_assault/land_siege)
    let wealthDeltaForYou = 0
    const isWealthTheft = active.attackType === 'standard' || active.attackType === 'wealth_assault' || active.attackType === 'land_siege'
    if (attackerWins && isWealthTheft) {
      const cap = active.attackType === 'standard' ? 0.10 : (active.attackType === 'wealth_assault' ? 0.25 : 0.35)
      // Determine defender's current wealth based on roles
      const defenderWealth = attackerIsYou ? (opponent?.wealth ?? 0) : (useGameStore.getState().player.wealth)
      let stolen = Math.floor(defenderWealth * cap)
      if (stolen < 0) stolen = 0
      if (stolen > defenderWealth) stolen = defenderWealth
      if (stolen > 0) {
        if (attackerIsYou) {
          // You gain, opponent loses
          useGameStore.setState(s => ({ player: { ...s.player, wealth: s.player.wealth + stolen } }))
          try {
            useMultiplayerStore.setState((ms: any) => ({
              onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === opponentId ? { ...p, wealth: Math.max(0, (p.wealth ?? 0) - stolen) } : p)
            }))
          } catch {}
          wealthDeltaForYou = stolen
        } else {
          // You lose, opponent gains
          useGameStore.setState(s => ({ player: { ...s.player, wealth: Math.max(0, s.player.wealth - stolen) } }))
          try {
            useMultiplayerStore.setState((ms: any) => ({
              onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === opponentId ? { ...p, wealth: (p.wealth ?? 0) + stolen } : p)
            }))
          } catch {}
          wealthDeltaForYou = -stolen
        }
      }
    }

    // Apply sabotage effects on defender when attacker wins
    if (active.attackType === 'business_sabotage' && attackerWins) {
      if (!attackerIsYou) {
        // You are the defender; apply damage to your businesses
        const state = useGameStore.getState()
        const hasInsurance = state.enhancedBusinesses.some(b => b.owned && state.activeSlots.includes(b.id) && b.id === 'insurance_company')
        let dmg = 30
        if (hasInsurance) dmg = Math.floor(dmg / 2)
        // Increase normal business damage meter
        useGameStore.setState(s => ({
          battleState: {
            ...s.battleState,
            businessDamage: Math.min(100, (s.battleState.businessDamage || 0) + dmg)
          }
        }))

        // Nick 1–2 random owned enhanced businesses' condition by 5–10% (halved if insurance), floor 60%
        const owned = state.enhancedBusinesses
          .map((eb, i) => ({ eb, i }))
          .filter(x => x.eb.owned)
        if (owned.length > 0) {
          const count = Math.min(owned.length, 1 + Math.round(Math.random()))
          const shuffled = owned.sort(() => Math.random() - 0.5).slice(0, count)
          const impacted: Array<{ name: string; delta: number }> = []
          useGameStore.setState(s => ({
            enhancedBusinesses: s.enhancedBusinesses.map((eb, i) => {
              const hit = shuffled.find(x => x.i === i)
              if (!hit) return eb
              const base = 5 + Math.floor(Math.random() * 6) // 5..10
              const delta = hasInsurance ? Math.ceil(base / 2) : base
              const current = typeof eb.condition === 'number' ? eb.condition! : 100
              impacted.push({ name: eb.name, delta })
              return { ...eb, condition: Math.max(60, current - delta) }
            })
          }))
          if (impacted.length > 0) {
            const details = impacted.map(i => `${i.name} -${i.delta}%`).join(', ')
            toast.error(`Sabotage damaged enhanced businesses`, { description: details })
          }
        }
      } else {
        // Opponent is defender; reflect demo damage into mock multiplayer store target
        const defId = opponentId
        try {
          useMultiplayerStore.setState((ms: any) => ({
            onlinePlayers: ms.onlinePlayers.map((p: any) => p.id === defId ? {
              ...p,
              battleState: {
                ...(p.battleState || {}),
                businessDamage: Math.min(100, ((p.battleState?.businessDamage) || 0) + 30)
              }
            } : p)
          }))
        } catch {}
      }
    }

    // Record result into history and clear from active
    const winnerId = attackerWins ? active.attacker : active.defender
    useMultiplayerStore.setState(state => ({
      activeBattles: state.activeBattles.filter(b => b.id !== battleId),
      battleHistory: [
        {
          ...active,
          status: 'completed',
          result: {
            winner: winnerId,
            damage: active.attackType === 'business_sabotage' ? (attackerWins ? 30 : 0) : 0,
            loot: actualStakePaid,
            reputation: attackerWins ? 10 : 2,
            wealthDeltaAttacker: isWealthTheft ? (attackerWins ? Math.abs(wealthDeltaForYou) : 0) : 0
          }
        },
        ...state.battleHistory
      ]
    }))

    // Toast + modal like the Arena sim
    const creditNote = creditDeltaForYou !== 0 ? ` ${creditDeltaForYou > 0 ? '+' : ''}${creditDeltaForYou} credits` : ''
    if (youWin) {
      const wealthNote = wealthDeltaForYou > 0 ? ` • +${wealthDeltaForYou} $WEALTH` : ''
      toast.success(`Victory!${creditNote}${wealthNote}`)
    } else {
      const wealthNote = wealthDeltaForYou < 0 ? ` • ${wealthDeltaForYou} $WEALTH` : ''
      toast.error(`Defeat!${creditNote}${wealthNote}`)
    }
    
    // Show modal for more prominent feedback
    setResultModal({
      won: youWin,
      title: youWin ? 'Victory!' : 'Defeat',
      description: youWin
        ? `You won the challenge.${creditDeltaForYou > 0 ? ` You received ${creditDeltaForYou} credits.` : ''}${wealthDeltaForYou > 0 ? ` You also stole ${wealthDeltaForYou} $WEALTH.` : ''}`
        : `You lost the challenge.${creditDeltaForYou < 0 ? ` You paid ${Math.abs(creditDeltaForYou)} credits.` : ''}${wealthDeltaForYou < 0 ? ` You also lost ${Math.abs(wealthDeltaForYou)} $WEALTH.` : ''}`
    })
  }

  const declineBattle = (battleId: string) => {
    multiplayerStore.declineBattleChallenge(battleId)
    toast.info('Battle declined')
  }

  return (
    <div className="space-y-6">
      {/* Result Modal */}
      {resultModal && (
        <Dialog open={!!resultModal} onOpenChange={(o) => !o && setResultModal(null)}>
          <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
            <DialogHeader>
              <DialogTitle>{resultModal.title}</DialogTitle>
              <DialogDescription>{resultModal.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <Button className="w-full" onClick={() => setResultModal(null)}>Continue</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Battle Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Real-Time Battle System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Battle Power</p>
                <p className="text-lg font-bold text-primary">
                  {Math.floor(gameStore.player.wealth / 10 + gameStore.player.level * 50)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Win Streak</p>
                <p className="text-lg font-bold text-warning">
                  {multiplayerStore.battleHistory.filter(b => b.result?.winner === gameStore.player.id).length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm font-medium">Battles Today</p>
                <p className="text-lg font-bold text-info">
                  {gameStore.battleState.attacksToday}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Battles removed: resolution happens instantly upon acceptance */}

      {/* Battle Invites */}
      {multiplayerStore.battleInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-info" />
              Battle Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {multiplayerStore.battleInvites.map((battle, idx) => {
              const challenger = multiplayerStore.onlinePlayers.find(p => p.id === battle.attacker)
              const battleInfo = getBattleTypeInfo(battle.attackType)
              // Estimate success chance breakdown (attacker vs defender)
              const youId = gameStore.player.id || 'current_player'
              const attackerIsYou = battle.attacker === youId || battle.attacker === 'current_player'
              const opponentId = attackerIsYou ? battle.defender : battle.attacker
              const opponent = multiplayerStore.onlinePlayers.find(p => p.id === opponentId)
              const yourWAR = (() => { try { return gameStore.calculateWAR() } catch { return 1000 } })()
              const oppScore = opponent?.battlePower ?? 1200
              const defenderDefenseRating = attackerIsYou
                ? Math.min(100, Math.floor((opponent?.battlePower ?? 1200) / 20))
                : gameStore.getDefenseRating()
              const attackerScore = attackerIsYou ? yourWAR : oppScore
              const defenderScore = attackerIsYou ? oppScore : yourWAR
              let est = 0.6 + ((attackerScore - defenderScore) / 2000) - (defenderDefenseRating / 200)
              est = Math.max(0.1, Math.min(0.9, est))
              
              return (
                <div key={battle.id || `invite-${idx}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {battleInfo.icon ?? <Swords className="h-4 w-4" />}
                      <div>
                        <h3 className="font-semibold">Challenge from {challenger?.username}</h3>
                        <p className="text-sm text-muted-foreground">{battleInfo.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Offense: {attackerScore} • Defense: {defenderDefenseRating} • Est. Success: {Math.round(est * 100)}%
                        </p>
                        {battleInfo.cost && (
                          <p className="text-xs text-muted-foreground">Cost: {battleInfo.cost.amount} {battleInfo.cost.currency === 'wealth' ? '$WEALTH' : 'Credits'}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      Stakes: {battle.stakes?.amount ?? 0} Credits
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptBattle(battle.id)}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => declineBattle(battle.id)}
                      variant="outline"
                      className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Challenge Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Challenge Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Battle Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Battle Type</label>
              <select value={battleType} onChange={(e) => setBattleType(e.target.value)}>
                <option value="standard">Standard Attack (15 Credits)</option>
                <option value="wealth_assault">Wealth Assault (10 $WEALTH)</option>
                <option value="land_siege">Land Siege (25 $WEALTH)</option>
                <option value="business_sabotage">Business Sabotage (25 Credits)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Stakes (Credits)</label>
              <input
                type="number"
                min={0}
                max={gameStore.player.credits}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Online Players List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPlayers.map(player => (
              <div
                key={player.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedOpponent === player.id 
                    ? 'border-primary bg-primary/10' 
                    : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => setSelectedOpponent(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{player.avatar || '👤'}</div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {player.username}
                        {player.isOnline && (
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Level {player.level} • Battle Power: {player.battlePower}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {player.wealth.toLocaleString()} Wealth
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rep: {player.reputation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No players found</p>
              </div>
            )}
          </div>

          <Button
            onClick={challengePlayer}
            disabled={!selectedOpponent}
            className="w-full bg-wealth-gradient hover:opacity-90"
            size="lg"
          >
            <Swords className="h-5 w-5 mr-2" />
            Send Battle Challenge
          </Button>
        </CardContent>
      </Card>

      {/* Recent Battle History */}
      {multiplayerStore.battleHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Recent Battles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {multiplayerStore.battleHistory.slice(0, 5).map(battle => {
                const opponent = multiplayerStore.onlinePlayers.find(p => 
                  p.id === (battle.attacker === gameStore.player.id ? battle.defender : battle.attacker)
                )
                const isWinner = battle.result?.winner === gameStore.player.id
                const attackerIsYou = battle.attacker === gameStore.player.id
                const wealthDeltaAttacker = battle.result?.wealthDeltaAttacker ?? 0
                const wealthDeltaForYou = attackerIsYou
                  ? (isWinner ? wealthDeltaAttacker : 0)
                  : (isWinner ? 0 : -wealthDeltaAttacker)
                const battleInfo = getBattleTypeInfo(battle.attackType)

                return (
                  <div key={battle.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {battleInfo.icon}
                      <div>
                        <p className="font-medium">
                          {battleInfo.name} vs {opponent?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(battle.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={isWinner ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}
                      >
                        {isWinner ? 'Victory' : 'Defeat'}
                      </Badge>
                      {battle.result && (
                        <div className="text-sm mt-1 space-y-0.5">
                          <p>{isWinner ? '+' : '-'}{battle.result.loot} Credits</p>
                          {wealthDeltaForYou !== 0 && (
                            <p>{wealthDeltaForYou > 0 ? '+' : ''}{wealthDeltaForYou} $WEALTH</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RealTimeBattleSystem
