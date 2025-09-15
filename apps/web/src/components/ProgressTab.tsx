"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Trophy } from 'lucide-react'
import { AchievementSystem } from '@/components/AchievementSystem'
import { EnhancedLeaderboards } from '@/components/EnhancedLeaderboards'
import { useGameStore } from '@/lib/gameStore'

export default function ProgressTab() {
  const { activeSlots, maxSlots } = useGameStore()
  const ultimateActive = activeSlots.length >= 4
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Synergy Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div>
              Active Slots: <span className="font-semibold">{activeSlots.length}/{maxSlots}</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${ultimateActive ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              {ultimateActive ? 'Ultimate synergy active' : 'Fill all 4 slots to unlock ultimate synergy'}
            </div>
          </div>
        </CardContent>
      </Card>

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
