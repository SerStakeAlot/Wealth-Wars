'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Swords, Shield, Zap, Timer, Trophy } from 'lucide-react'
import { useState } from 'react'

export function BattleSystem() {
  const [isAttacking, setIsAttacking] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  const mockTargets = [
    { id: '1', username: 'RichRival', wealth: 8500, defenseRating: 75, online: true },
    { id: '2', username: 'WealthyFoe', wealth: 6200, defenseRating: 60, online: false },
    { id: '3', username: 'BusinessBoss', wealth: 12000, defenseRating: 90, online: true }
  ]

  const handleAttack = async (targetId: string) => {
    setIsAttacking(true)
    setSelectedTarget(targetId)
    
    // Simulate attack
    setTimeout(() => {
      setIsAttacking(false)
      setSelectedTarget(null)
      // Could show result dialog here
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Battle Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Battle Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-muted-foreground">Attacks Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">73%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">85</div>
            <div className="text-sm text-muted-foreground">Defense Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">3</div>
            <div className="text-sm text-muted-foreground">Shield Time (h)</div>
          </div>
        </CardContent>
      </Card>

      {/* Defense Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Defense Systems
          </CardTitle>
          <CardDescription>
            Protect your wealth from incoming attacks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex flex-col gap-2 p-4">
              <Shield className="h-6 w-6" />
              <span className="font-medium">Basic Shield</span>
              <span className="text-xs text-muted-foreground">50 Credits • 2h Protection</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col gap-2 p-4">
              <Zap className="h-6 w-6" />
              <span className="font-medium">Energy Shield</span>
              <span className="text-xs text-muted-foreground">150 Credits • 6h Protection</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col gap-2 p-4">
              <Trophy className="h-6 w-6" />
              <span className="font-medium">Elite Shield</span>
              <span className="text-xs text-muted-foreground">500 Credits • 24h Protection</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attack Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Available Targets
          </CardTitle>
          <CardDescription>
            Choose your target wisely based on wealth and defense ratings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTargets.map((target) => (
            <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{target.username}</span>
                  <span className={`w-2 h-2 rounded-full ${target.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-muted-foreground">{target.online ? 'Online' : 'Offline'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Wealth: {target.wealth.toLocaleString()} | Defense: {target.defenseRating}%
                </div>
                <Progress value={target.defenseRating} className="h-2" />
              </div>
              <Button 
                onClick={() => handleAttack(target.id)}
                disabled={isAttacking && selectedTarget === target.id}
                className="ml-4"
              >
                {isAttacking && selectedTarget === target.id ? (
                  <>
                    <Timer className="h-4 w-4 mr-2 animate-spin" />
                    Attacking...
                  </>
                ) : (
                  <>
                    <Swords className="h-4 w-4 mr-2" />
                    Attack
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}