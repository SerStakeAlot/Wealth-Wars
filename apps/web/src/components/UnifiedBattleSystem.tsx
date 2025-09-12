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
  Swords,
  Shield,
  Zap,
  Target,
  Users,
  Trophy,
  Star,
  Timer,
  TrendingUp,
  Award,
  Crown,
  Flame,
  Eye,
  Crosshair
} from 'lucide-react'

export function UnifiedBattleSystem() {
  const gameStore = useGameStore()
  const [activeBattleTab, setActiveBattleTab] = useState('arena')
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [battleInProgress, setBattleInProgress] = useState(false)
  const [battleResult, setBattleResult] = useState<any>(null)

  // Mock battle opponents
  const opponents = [
    { id: 1, name: 'CryptoKing', level: 15, wealth: 50000, winRate: 0.75, avatar: '👑' },
    { id: 2, name: 'WealthHunter', level: 12, wealth: 35000, winRate: 0.68, avatar: '🏹' },
    { id: 3, name: 'EmpireBuilder', level: 18, wealth: 75000, winRate: 0.82, avatar: '🏰' },
    { id: 4, name: 'MarketMaster', level: 10, wealth: 25000, winRate: 0.60, avatar: '📈' },
    { id: 5, name: 'FortuneSeeker', level: 20, wealth: 100000, winRate: 0.88, avatar: '💎' }
  ]

  const startBattle = (opponent: any) => {
    setSelectedOpponent(opponent)
    setBattleInProgress(true)
    setBattleResult(null)

    // Simulate battle (3 seconds)
    setTimeout(() => {
      const playerWin = Math.random() > 0.4 // 60% win rate
      const rewards = playerWin ? {
        credits: Math.floor(Math.random() * 100) + 50,
        xp: Math.floor(Math.random() * 20) + 10
      } : {
        credits: Math.floor(Math.random() * 30) + 10,
        xp: Math.floor(Math.random() * 5) + 1
      }

      setBattleResult({
        won: playerWin,
        opponent: opponent,
        rewards: rewards
      })

      if (playerWin) {
        gameStore.player.credits += rewards.credits
        gameStore.player.xp += rewards.xp
        toast.success(`Victory! Earned ${rewards.credits} credits and ${rewards.xp} XP!`)
      } else {
        gameStore.player.credits += rewards.credits
        toast.error(`Defeat! Earned ${rewards.credits} credits as consolation.`)
      }

      setBattleInProgress(false)
    }, 3000)
  }

  const BattleArena = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Battle Arena
          </CardTitle>
          <CardDescription>
            Challenge other players to battles and earn rewards!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {opponents.map((opponent) => (
              <Card key={opponent.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{opponent.avatar}</div>
                      <div>
                        <h3 className="font-semibold">{opponent.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Level {opponent.level}</span>
                          <span>${opponent.wealth.toLocaleString()}</span>
                          <span>{Math.round(opponent.winRate * 100)}% win rate</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => startBattle(opponent)}
                      disabled={battleInProgress}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Swords className="h-4 w-4 mr-2" />
                      Battle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Battle Result Modal */}
      {battleResult && (
        <Dialog open={!!battleResult} onOpenChange={() => setBattleResult(null)}>
          <DialogContent className="sm:max-w-md bg-card border border-border shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {battleResult.won ? (
                  <>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Victory!
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 text-gray-500" />
                    Defeat
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Battle against {battleResult.opponent.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {battleResult.won ? '🏆' : '💔'}
                </div>
                <p className="text-lg font-semibold">
                  {battleResult.won ? 'You Won!' : 'You Lost!'}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Rewards:</h4>
                <div className="flex justify-between">
                  <span>Credits: +{battleResult.rewards.credits}</span>
                  <span>XP: +{battleResult.rewards.xp}</span>
                </div>
              </div>
              <Button
                onClick={() => setBattleResult(null)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )

  const BattleStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Total Wins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Total Losses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">60%</p>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Battles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { opponent: 'CryptoKing', result: 'win', reward: 75, time: '2 hours ago' },
              { opponent: 'WealthHunter', result: 'loss', reward: 25, time: '5 hours ago' },
              { opponent: 'EmpireBuilder', result: 'win', reward: 120, time: '1 day ago' }
            ].map((battle, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${battle.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">vs {battle.opponent}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>+{battle.reward} credits</span>
                  <span className="text-muted-foreground">{battle.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const Tournaments = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Active Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Weekly Championship</h3>
                <Badge className="bg-yellow-600">Premium</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Compete against the best players for massive rewards!
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span>Prize Pool: $10,000</span>
                  <span className="ml-4">Ends in 2 days</span>
                </div>
                <Button size="sm">Join Tournament</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Daily Challenge</h3>
                <Badge variant="secondary">Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Quick battles with daily rewards!
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span>Prize: 500 credits</span>
                  <span className="ml-4">Ends in 8 hours</span>
                </div>
                <Button size="sm" variant="outline">Join Challenge</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeBattleTab} onValueChange={setActiveBattleTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="arena">Battle Arena</TabsTrigger>
          <TabsTrigger value="stats">Battle Stats</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="arena">
          <BattleArena />
        </TabsContent>

        <TabsContent value="stats">
          <BattleStats />
        </TabsContent>

        <TabsContent value="tournaments">
          <Tournaments />
        </TabsContent>
      </Tabs>

      {battleInProgress && (
        <Card className="border-yellow-500">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Battle in Progress...</h3>
            <p className="text-muted-foreground">
              Fighting against {selectedOpponent?.name}...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}