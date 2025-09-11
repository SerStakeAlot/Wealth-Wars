'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X } from 'lucide-react'
import { useState } from 'react'

export function NotificationCenter() {
  const [notifications] = useState([
    { id: '1', type: 'info', title: 'New Achievement!', message: 'You unlocked "Business Mogul"', time: '2m ago' },
    { id: '2', type: 'warning', title: 'Maintenance Required', message: 'Widget Factory needs attention', time: '15m ago' },
    { id: '3', type: 'success', title: 'Attack Successful!', message: 'You stole 250 credits from RichRival', time: '1h ago' }
  ])
  
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {notifications.length}
          </Badge>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 rounded border hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Badge variant={notification.type === 'warning' ? 'destructive' : 'secondary'}>
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full">
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}