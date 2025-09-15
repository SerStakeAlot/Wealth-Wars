"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Trophy } from 'lucide-react'
import { AchievementSystem } from '@/components/AchievementSystem'
import { EnhancedLeaderboards } from '@/components/EnhancedLeaderboards'

export default function ProgressTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementSystem />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLeaderboards />
        </CardContent>
      </Card>
    </div>
  )
}
