'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export function MaintenanceSystem() {
  const mockBusinesses = [
    {
      id: 'lemonade_stand',
      name: 'Lemonade Stand',
      condition: 95,
      lastMaintenance: '2 days ago',
      status: 'excellent'
    },
    {
      id: 'coffee_cafe', 
      name: 'Coffee Cafe',
      condition: 78,
      lastMaintenance: '1 week ago',
      status: 'good'
    },
    {
      id: 'widget_factory',
      name: 'Widget Factory', 
      condition: 45,
      lastMaintenance: '3 weeks ago',
      status: 'poor'
    },
    {
      id: 'tech_startup',
      name: 'Tech Startup',
      condition: 23,
      lastMaintenance: '2 months ago',
      status: 'critical'
    }
  ]

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

  const getMaintenanceCost = (condition: number) => {
    if (condition >= 80) return 25
    if (condition >= 60) return 50
    if (condition >= 40) return 100
    return 200
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
              <span className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Budget: 1,250 Credits</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Regular maintenance prevents costly emergency repairs and keeps profits flowing.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockBusinesses.map((business) => (
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
                      {business.status}
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
                    Last maintenance: {business.lastMaintenance}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col gap-2">
                  <Button 
                    size="sm"
                    variant={business.condition < 60 ? "default" : "outline"}
                    className="min-w-[120px]"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintain ({getMaintenanceCost(business.condition)} credits)
                  </Button>
                  
                  {business.condition < 40 && (
                    <Button size="sm" variant="destructive" className="min-w-[120px]">
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