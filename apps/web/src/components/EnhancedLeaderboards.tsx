'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Users,
  Target,
  Award,
  Flame
} from 'lucide-react'

export function EnhancedLeaderboards() {
  const gameStore = useGameStore()
  const [activeTab, setActiveTab] = useState('wealth')
  const [timeFilter, setTimeFilter] = useState('all')

  // Mock leaderboard data
  const wealthLeaderboard = [
    { rank: 1, name: 'CryptoKing', wealth: 500000, level: 25, avatar: '👑', change: '+5' },
    { rank: 2, name: 'EmpireBuilder', wealth: 450000, level: 23, avatar: '🏰', change: '+2' },
    { rank: 3, name: 'WealthHunter', wealth: 420000, level: 22, avatar: '🏹', change: '-1' },
    { rank: 4, name: 'MarketMaster', wealth: 380000, level: 20, avatar: '📈', change: '+3' },
    { rank: 5, name: 'FortuneSeeker', wealth: 350000, level: 19, avatar: '💎', change: '-2' },
    { rank: 6, name: 'BusinessTycoon', wealth: 320000, level: 18, avatar: '💼', change: '+1' },
    { rank: 7, name: 'TradeBaron', wealth: 290000, level: 17, avatar: '📊', change: '0' },
    { rank: 8, name: 'CoinCollector', wealth: 260000, level: 16, avatar: '🪙', change: '+4' },
    { rank: 9, name: 'AssetKing', wealth: 230000, level: 15, avatar: '👑', change: '-3' },
    { rank: 10, name: 'ProfitLord', wealth: 200000, level: 14, avatar: '💰', change: '+2' }
  ]

  const levelLeaderboard = [
    { rank: 1, name: 'LevelMaster', level: 30, xp: 15000, avatar: '⭐', change: '+1' },
    { rank: 2, name: 'XPGrinder', level: 28, xp: 14000, avatar: '⚡', change: '+3' },
    { rank: 3, name: 'ProgressKing', level: 27, xp: 13500, avatar: '📈', change: '-1' },
    { rank: 4, name: 'AchievementHunter', level: 26, xp: 13000, avatar: '🏆', change: '+2' },
    { rank: 5, name: 'SkillMaster', level: 25, xp: 12500, avatar: '🎯', change: '0' }
  ]

  const battleLeaderboard = [
    { rank: 1, name: 'BattleLord', wins: 150, winRate: 0.85, avatar: '⚔️', change: '+2' },
    { rank: 2, name: 'WarriorKing', wins: 140, winRate: 0.82, avatar: '👑', change: '-1' },
    { rank: 3, name: 'CombatMaster', wins: 135, winRate: 0.80, avatar: '🗡️', change: '+1' },
    { rank: 4, name: 'DuelChampion', wins: 130, winRate: 0.78, avatar: '🏆', change: '+3' },
    { rank: 5, name: 'FightWinner', wins: 125, winRate: 0.75, avatar: '💪', change: '-2' }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getChangeIndicator = (change: string) => {
    if (change.startsWith('+')) {
      return <span className="text-green-500 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {change}
      </span>
    } else if (change.startsWith('-')) {
      return <span className="text-red-500">{change}</span>
    } else {
      return <span className="text-muted-foreground">{change}</span>
    }
  }

  const LeaderboardTable = ({ data, type }: { data: any[], type: string }) => (
    <div className="space-y-2">
      {data.map((player, index) => (
        <Card key={player.rank} className={`hover:shadow-md transition-shadow ${
          player.rank <= 3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-transparent' : ''
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[60px]">
                  {getRankIcon(player.rank)}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{player.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {type === 'wealth' && (
                      <>
                        <span>Level {player.level}</span>
                        <span>•</span>
                        <span>${player.wealth.toLocaleString()}</span>
                      </>
                    )}
                    {type === 'level' && (
                      <>
                        <span>Level {player.level}</span>
                        <span>•</span>
                        <span>{player.xp.toLocaleString()} XP</span>
                      </>
                    )}
                    {type === 'battle' && (
                      <>
                        <span>{player.wins} wins</span>
                        <span>•</span>
                        <span>{Math.round(player.winRate * 100)}% win rate</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {getChangeIndicator(player.change)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const TopPlayers = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {wealthLeaderboard.slice(0, 3).map((player, index) => (
        <Card key={player.rank} className="text-center border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="text-4xl mb-2">{player.avatar}</div>
            <div className="flex justify-center mb-2">
              {getRankIcon(player.rank)}
            </div>
            <h3 className="font-bold text-lg">{player.name}</h3>
            <p className="text-2xl font-bold text-primary">
              ${player.wealth.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Level {player.level}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Enhanced Leaderboards
          </CardTitle>
          <CardDescription>
            Compete with players worldwide and climb the rankings!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopPlayers />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="wealth" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Wealth
            </TabsTrigger>
            <TabsTrigger value="level" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Level
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Battle
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant={timeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('all')}
            >
              All Time
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('month')}
            >
              This Month
            </Button>
            <Button
              variant={timeFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('week')}
            >
              This Week
            </Button>
          </div>
        </div>

        <TabsContent value="wealth">
          <LeaderboardTable data={wealthLeaderboard} type="wealth" />
        </TabsContent>

        <TabsContent value="level">
          <LeaderboardTable data={levelLeaderboard} type="level" />
        </TabsContent>

        <TabsContent value="battle">
          <LeaderboardTable data={battleLeaderboard} type="battle" />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">#247</div>
              <div className="text-sm text-muted-foreground">Wealth Rank</div>
              <div className="text-xs text-green-500 mt-1">↑ 12 this week</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">#89</div>
              <div className="text-sm text-muted-foreground">Level Rank</div>
              <div className="text-xs text-green-500 mt-1">↑ 5 this week</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">#156</div>
              <div className="text-sm text-muted-foreground">Battle Rank</div>
              <div className="text-xs text-red-500 mt-1">↓ 3 this week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}