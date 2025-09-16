"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Star, Trophy, Target, Crown } from 'lucide-react'
import { useGameStore } from '@/lib/gameStore'
import type { ReactNode } from 'react'

type Achv = {
  id: 'first_business' | 'wealthy_worker_1k' | 'business_empire' | 'battle_master'
  name: string
  description: string
  icon: ReactNode
  reward: string
  category: 'Business' | 'Wealth' | 'Combat'
}

const ACHIEVEMENTS: Achv[] = [
  {
    id: 'first_business',
    name: 'Entrepreneur',
    description: 'Purchase your first enhanced business',
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    reward: '50 Credits',
    category: 'Business',
  },
  {
    id: 'wealthy_worker_1k',
    name: 'Wealthy Worker',
    description: 'Earn 1,000 credits from work',
    icon: <Trophy className="h-6 w-6 text-blue-500" />,
    reward: '100 Credits + 200 XP',
    category: 'Wealth',
  },
  {
    id: 'business_empire',
    name: 'Business Empire',
    description: 'Own 10 enhanced businesses',
    icon: <Crown className="h-6 w-6 text-purple-500" />,
    reward: '500 Credits + 5 $WEALTH',
    category: 'Business',
  },
  {
    id: 'battle_master',
    name: 'Battle Master',
    description: 'Win 50 battles against other players',
    icon: <Target className="h-6 w-6 text-red-500" />,
    reward: '250 Credits + 1h Shield',
    category: 'Combat',
  },
]

export function AchievementSystem() {
  const enhancedBusinesses = useGameStore((s) => s.enhancedBusinesses)
  const player = useGameStore((s) => s.player)
  const achievementsClaimed = useGameStore((s) => s.achievementsClaimed)
  const claimAchievement = useGameStore((s: any) => s.claimAchievement as (id: string) => { success: boolean; reason?: string })

  const ownedEnhanced = enhancedBusinesses.filter((b) => b.owned).length
  const creditsEarned = player.totalCreditsEarned || 0
  const battlesWon = player.battlesWon || 0

  const progressFor = (id: Achv['id']) => {
    switch (id) {
      case 'first_business':
        return Math.min(100, Math.floor((ownedEnhanced >= 1 ? 1 : ownedEnhanced) * 100))
      case 'wealthy_worker_1k':
        return Math.min(100, Math.floor((creditsEarned / 1000) * 100))
      case 'business_empire':
        return Math.min(100, Math.floor((ownedEnhanced / 10) * 100))
      case 'battle_master':
        return Math.min(100, Math.floor((battlesWon / 50) * 100))
    }
  }

  const unlockedFor = (id: Achv['id']) => {
    switch (id) {
      case 'first_business':
        return ownedEnhanced >= 1
      case 'wealthy_worker_1k':
        return creditsEarned >= 1000
      case 'business_empire':
        return ownedEnhanced >= 10
      case 'battle_master':
        return battlesWon >= 50
    }
  }

  const isClaimed = (id: Achv['id']) => (achievementsClaimed || []).includes(id)

  // Category summary
  const categories = ['Business', 'Combat', 'Wealth'] as const
  const catCounts = categories.map((cat) => {
    const ach = ACHIEVEMENTS.filter((a) => a.category === cat)
    const unlocked = ach.filter((a) => unlockedFor(a.id)).length
    return { cat, unlocked, total: ach.length }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const progress = progressFor(a.id)
          const unlocked = unlockedFor(a.id)
          const claimed = isClaimed(a.id)
          return (
            <Card key={a.id} className={unlocked ? 'ring-2 ring-yellow-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {a.icon}
                    <div>
                      <CardTitle className="text-base">{a.name}</CardTitle>
                      <CardDescription>{a.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={claimed ? 'default' : unlocked ? 'default' : 'secondary'}>
                      {claimed ? 'Claimed' : unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      <span className="font-medium">Reward:</span> {a.reward}
                    </div>
                    <Button
                      size="sm"
                      disabled={!unlocked || claimed}
                      onClick={() => claimAchievement?.(a.id)}
                    >
                      {claimed ? 'Claimed' : 'Claim'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
          <CardDescription>Track your progress across different areas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {catCounts.map(({ cat, unlocked, total }) => (
              <div key={cat}>
                <div className={`text-2xl font-bold ${cat === 'Business' ? 'text-yellow-500' : cat === 'Combat' ? 'text-blue-500' : 'text-green-500'}`}>{unlocked}/{total}</div>
                <div className="text-sm text-muted-foreground">{cat}</div>
              </div>
            ))}
            <div>
              <div className="text-2xl font-bold text-purple-500">0/0</div>
              <div className="text-sm text-muted-foreground">Social</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}