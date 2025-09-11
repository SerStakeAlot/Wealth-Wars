'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, Trophy, Target, Crown } from 'lucide-react'

export function AchievementSystem() {
  const achievements = [
    {
      id: 'first_business',
      name: 'Entrepreneur',
      description: 'Purchase your first business',
      progress: 100,
      unlocked: true,
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      reward: '50 Credits'
    },
    {
      id: 'wealthy_worker', 
      name: 'Wealthy Worker',
      description: 'Earn 1,000 credits from work',
      progress: 75,
      unlocked: false,
      icon: <Trophy className="h-6 w-6 text-blue-500" />,
      reward: '100 Credits + XP Boost'
    },
    {
      id: 'business_empire',
      name: 'Business Empire',
      description: 'Own 10 different businesses',
      progress: 40,
      unlocked: false,
      icon: <Crown className="h-6 w-6 text-purple-500" />,
      reward: 'Elite Status + Special Badge'
    },
    {
      id: 'battle_master',
      name: 'Battle Master',
      description: 'Win 50 battles against other players',
      progress: 22,
      unlocked: false,
      icon: <Target className="h-6 w-6 text-red-500" />,
      reward: 'Combat Multiplier + Shield'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={achievement.unlocked ? 'ring-2 ring-yellow-500' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {achievement.icon}
                  <div>
                    <CardTitle className="text-base">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                  {achievement.unlocked ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{achievement.progress}%</span>
                </div>
                <Progress value={achievement.progress} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Reward:</span> {achievement.reward}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
          <CardDescription>Track your progress across different areas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-500">3/12</div>
              <div className="text-sm text-muted-foreground">Business</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">1/8</div>
              <div className="text-sm text-muted-foreground">Combat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">5/15</div>
              <div className="text-sm text-muted-foreground">Wealth</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">2/6</div>
              <div className="text-sm text-muted-foreground">Social</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}