"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useGameStore } from '@/lib/gameStore'
import { toast } from 'sonner'

const getStatusColor = (condition: number) => {
  if (condition >= 80) return 'text-green-500'
  if (condition >= 60) return 'text-yellow-500'
  if (condition >= 40) return 'text-orange-500'
  return 'text-red-500'
}

const getStatusIcon = (condition: number) => {
  if (condition >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
  if (condition >= 60) return <Clock className="h-4 w-4 text-yellow-500" />
  return <AlertTriangle className="h-4 w-4 text-red-500" />
}

const timeAgo = (ts: number) => {
  if (!ts || ts === 0) return 'Never'
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const getMaintenanceCost = (business: any) => {
  // Mirror the store's repair cost formula: Math.floor((100 - condition) * baseCost * 0.1)
  return Math.floor((100 - business.condition) * business.baseCost * 0.1)
}

export function MaintenanceSystem() {
  const businesses = useGameStore(state => state.businesses)
  const playerCredits = useGameStore(state => state.player.credits)
  const repairBusiness = useGameStore(state => state.repairBusiness)

  const handleMaintain = (business: any) => {
    const cost = getMaintenanceCost(business)
    if (playerCredits < cost) {
      toast.error('Not enough credits for maintenance')
      return
    }

    // small maintenance, heal by 20 points
    repairBusiness(business.id, 20)
    toast.success(`${business.name} maintained`, { description: `- ${cost} credits` })
  }

  const handleEmergency = (business: any) => {
    const cost = getMaintenanceCost(business)
    if (playerCredits < cost) {
      toast.error('Not enough credits for emergency repair')
      return
    }

    // big repair, heal by 80 points
    repairBusiness(business.id, 80)
    toast.success(`${business.name} emergency repaired`, { description: `- ${cost} credits` })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Business Maintenance
          </CardTitle>
          <CardDescription>
            Keep your businesses in top condition for maximum efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Budget: {playerCredits.toLocaleString()} Credits</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Regular maintenance prevents costly emergency repairs and keeps profits flowing.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {businesses.map((business) => (
          <Card key={business.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(business.condition)}
                      <span className="font-medium">{business.name}</span>
                    </div>
                    <span className={`text-sm font-medium capitalize ${getStatusColor(business.condition)}`}>
                      {business.condition >= 80 ? 'excellent' : business.condition >= 60 ? 'good' : business.condition >= 40 ? 'poor' : 'critical'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Condition</span>
                      <span className={getStatusColor(business.condition)}>{business.condition}%</span>
                    </div>
                    <Progress value={business.condition} className="h-2" />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last maintenance: {timeAgo(business.lastMaintenance)}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col gap-2">
                  <Button 
                    size="sm"
                    variant={business.condition < 60 ? "default" : "outline"}
                    className="min-w-[140px]"
                    onClick={() => handleMaintain(business)}
                    disabled={business.condition >= 100}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintain ({getMaintenanceCost(business)} credits)
                  </Button>
                  
                  {business.condition < 40 && (
                    <Button size="sm" variant="outline" className="min-w-[140px] border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleEmergency(business)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Repair
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Regular maintenance costs less than emergency repairs</p>
          <p>• Businesses below 60% condition produce reduced profits</p>
          <p>• Businesses below 20% condition may go offline</p>
          <p>• Set aside 10% of your income for maintenance</p>
        </CardContent>
      </Card>
    </div>
  )
}