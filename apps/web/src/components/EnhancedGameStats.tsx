"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Activity, Target, Coins } from 'lucide-react'
import { useGameStore } from '@/lib/gameStore'

export function EnhancedGameStats() {
  const player = useGameStore(state => state.player)
  const businesses = useGameStore(state => state.businesses)
  const conversionRate = useGameStore(state => state.wealthToCreditsRate)

  const activeBusinessCount = businesses.reduce((c, b) => c + (b.outlets > 0 ? 1 : 0), 0)
  const totalOutlets = businesses.reduce((c, b) => c + b.outlets, 0)

  // Goals: show progress toward a credits milestone (adjustable)
  const creditsMilestone = 15000
  const creditsProgress = Math.min(100, Math.floor((player.credits / creditsMilestone) * 100))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Player Credits</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gold-gradient">{(player.credits || 0).toLocaleString()} Credits</div>
          <p className="text-xs text-muted-foreground">Live balance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">$WEALTH Holdings</CardTitle>
          <span className="h-4 w-4 text-muted-foreground font-semibold">$</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gold-gradient">${(player.wealth || 0).toLocaleString()} $WEALTH</div>
          <p className="text-xs text-muted-foreground">≈ <span className="gold-gradient">{(Math.floor((player.wealth || 0) * conversionRate)).toLocaleString()}</span> Credits equivalent</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBusinessCount} ({totalOutlets})</div>
          <p className="text-xs text-muted-foreground">Outlets active / total outlets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{creditsProgress}%</div>
          <Progress value={creditsProgress} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Next milestone: {creditsMilestone.toLocaleString()} Credits</p>
        </CardContent>
      </Card>
    </div>
  )
}