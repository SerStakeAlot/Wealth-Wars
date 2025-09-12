import React, { useState, useEffect } from 'react'
import { useMultiplayerStore } from '@/lib/multiplayerStore'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  X,
  Play
} from '@phosphor-icons/react'
import { AlertTriangle, Sword, Zap, Shield, Target, Crown, Timer, Coins, Users, CheckCircle, XCircle, Search } from 'lucide-react'

export function RealTimeBattleSystem() {
  const multiplayerStore = useMultiplayerStore()
  const gameStore = useGameStore()
  const [selectedOpponent, setSelectedOpponent] = useState<string>('')
  const [battleType, setBattleType] = useState<string>('raid')
  const [stakeAmount, setStakeAmount] = useState<number>(100)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(Date.now())

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
      case 'raid':
        return {
          name: 'Wealth Raid',
          description: 'Steal wealth directly from opponent',
          icon: <Coins className="h-4 w-4" />,
          color: 'text-warning'
        }
      case 'sabotage':
        return {
          name: 'Business Sabotage',
          description: 'Damage opponent\'s businesses',
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-destructive'
        }
      case 'steal':
        return {
          name: 'Credit Heist',
          description: 'Steal credits from opponent',
          icon: <Target className="h-4 w-4" />,
          color: 'text-info'
        }
      default:
        return {
          name: 'Unknown',
          description: 'Unknown battle type',
          icon: <Sword className="h-4 w-4" />,
          color: 'text-muted-foreground'
        }
    }
  }

  const challengePlayer = () => {
    if (!selectedOpponent) {
      toast.error('Please select an opponent')
      return
    }

    if (stakeAmount > gameStore.player.credits) {
      toast.error('Insufficient credits for this battle')
      return
    }

    const opponent = multiplayerStore.onlinePlayers.find(p => p.id === selectedOpponent)
    if (!opponent) {
      toast.error('Opponent not found')
      return
    }

    multiplayerStore.challengePlayer(selectedOpponent, battleType, {
      type: 'credits',
      amount: stakeAmount
    })

    toast.success(`Battle challenge sent to ${opponent.username}!`)
    setSelectedOpponent('')
    setStakeAmount(100)
  }

  // Attack cost and cooldowns mapping to match `performAttack`
  const attackMeta: Record<string, { costAmount: number; costCurrency: 'credits' | 'wealth'; cooldownMs: number }> = {
    raid: { costAmount: 25, costCurrency: 'wealth', cooldownMs: 24 * 60 * 60 * 1000 }, // land_siege
    sabotage: { costAmount: 25, costCurrency: 'credits', cooldownMs: 8 * 60 * 60 * 1000 }, // business_sabotage
    steal: { costAmount: 15, costCurrency: 'credits', cooldownMs: 4 * 60 * 60 * 1000 } // standard
  }

  const getCooldownRemaining = (typeKey: string) => {
    const mapping = {
      raid: 'lastLandSiege',
      sabotage: 'lastBusinessSabotage',
      steal: 'lastStandardAttack'
    } as Record<string, keyof typeof gameStore.battleState>

    const last = (gameStore.battleState as any)[mapping[typeKey]] || 0
    const cooldown = attackMeta[typeKey].cooldownMs
    const rem = Math.max(0, (last + cooldown) - currentTime)
    return rem
  }

  const canAffordAttack = (typeKey: string) => {
    const meta = attackMeta[typeKey]
    if (meta.costCurrency === 'credits') return gameStore.player.credits >= meta.costAmount
    return gameStore.player.wealth >= meta.costAmount
  }

  const isOnCooldown = (typeKey: string) => getCooldownRemaining(typeKey) > 0

  const acceptBattle = (battleId: string) => {
    multiplayerStore.acceptBattleChallenge(battleId)
    toast.success('Battle accepted! Preparing for combat...')
  }

  const declineBattle = (battleId: string) => {
    multiplayerStore.declineBattleChallenge(battleId)
    toast.info('Battle declined')
  }

  return (
    <div className="space-y-6">
      {/* Battle Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-primary" />
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
                  0
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Battles */}
      {multiplayerStore.activeBattles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse text-warning" />
              Active Battles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {multiplayerStore.activeBattles.map(battle => {
              const opponent = multiplayerStore.onlinePlayers.find(p => 
                p.id === (battle.attacker === gameStore.player.id ? battle.defender : battle.attacker)
              )
              const battleInfo = getBattleTypeInfo(battle.attackType)
              
              return (
                <div key={battle.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {battleInfo.icon}
                      <div>
                        <h3 className="font-semibold">{battleInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          vs {opponent?.username || 'Unknown Player'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Battle Progress</span>
                      <span>
                        {formatTimeRemaining(battle.startTime + battle.duration)}
                      </span>
                    </div>
                    <Progress 
                      value={((currentTime - battle.startTime) / battle.duration) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => multiplayerStore.executeBattleAction(battle.id, 'aggressive')}
                      className="flex-1 bg-destructive hover:bg-destructive/90"
                    >
                      <Sword className="h-4 w-4 mr-2" />
                      Attack
                    </Button>
                    <Button
                      onClick={() => multiplayerStore.executeBattleAction(battle.id, 'defensive')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Defend
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

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
            {multiplayerStore.battleInvites.map(battle => {
              const challenger = multiplayerStore.onlinePlayers.find(p => p.id === battle.attacker)
              const battleInfo = getBattleTypeInfo(battle.attackType)
              
              return (
                <div key={battle.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {battleInfo.icon}
                      <div>
                        <h3 className="font-semibold">Challenge from {challenger?.username}</h3>
                        <p className="text-sm text-muted-foreground">{battleInfo.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Stakes: {battle.stakes.amount} Credits
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
                <option value="raid">Wealth Raid</option>
                <option value="sabotage">Business Sabotage</option>
                <option value="steal">Credit Heist</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Stakes (Credits)</label>
              <input
                type="number"
                min={10}
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
                      {(player.wealth || 0).toLocaleString()} Wealth
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
            disabled={!selectedOpponent || !canAffordAttack(battleType) || isOnCooldown(battleType)}
            className="w-full bg-wealth-gradient hover:opacity-90"
            size="lg"
          >
            <Sword className="h-5 w-5 mr-2" />
            {isOnCooldown(battleType) ? `Cooldown: ${formatTimeRemaining(currentTime + getCooldownRemaining(battleType))}` : 'Send Battle Challenge'}
            <div className="text-xs ml-2">
              {attackMeta[battleType].costAmount} {attackMeta[battleType].costCurrency === 'credits' ? 'Credits' : 'WEALTH'}
            </div>
          </Button>

          <Button
            onClick={async () => {
              if (!selectedOpponent) return toast.error('Select an opponent')
              // map UI battleType to gameStore attackType
              const map: Record<string, any> = { raid: 'land_siege', sabotage: 'business_sabotage', steal: 'standard' }
              const attackKey = map[battleType]
              const result = gameStore.performAttack(selectedOpponent, attackKey)
              if (result.success) {
                toast.success(result.message || 'Attack succeeded')
              } else {
                toast.error(result.message || 'Attack failed')
              }
            }}
            disabled={!selectedOpponent || !canAffordAttack(battleType) || isOnCooldown(battleType)}
            variant="outline"
            className="w-full mt-2"
          >
            <Zap className="h-4 w-4 mr-2" />
            Execute Attack
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
                        <p className="text-sm mt-1">
                          {isWinner ? '+' : '-'}{battle.result.loot} Credits
                        </p>
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
