'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, User } from 'lucide-react'

// Mock leaderboard data
const mockLeaderboard = [
  { id: '1', username: 'WealthKing', wealth: 15420, level: 15 },
  { id: '2', username: 'CryptoMogul', wealth: 12350, level: 12 },
  { id: '3', username: 'BusinessTitan', wealth: 9880, level: 11 },
  { id: '4', username: 'DigitalEmpire', wealth: 7650, level: 9 },
  { id: '5', username: 'VirtualVenture', wealth: 5230, level: 8 }
]

export function Leaderboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Leaderboard
        </CardTitle>
        <CardDescription>
          Top players by total wealth accumulated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockLeaderboard.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                #{index + 1}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{player.username}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{player.wealth.toLocaleString()}</span>
              </div>
              <span className="text-muted-foreground">Lv.{player.level}</span>
            </div>
          </div>
        ))}
        <div className="text-center pt-4 text-sm text-muted-foreground">
          Your rank: #247 • Keep building to climb higher!
        </div>
      </CardContent>
    </Card>
  )
}