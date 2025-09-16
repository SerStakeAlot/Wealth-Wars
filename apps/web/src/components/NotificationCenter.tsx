'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNotificationStore } from '@/lib/notificationStore'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const notifications = useNotificationStore((s) => s.notifications)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const markRead = useNotificationStore((s) => s.markRead)
  const dismiss = useNotificationStore((s) => s.dismiss)
  const clearAll = useNotificationStore((s) => s.clearAll)
  // Only show non-dismissed notifications in the dropdown
  const visible = useMemo(() => notifications.filter((n) => !n.dismissed), [notifications])
  const unreadCount = useMemo(() => visible.filter((n) => !n.read).length, [visible])
  const sorted = useMemo(() => visible.slice().sort((a, b) => b.createdAt - a.createdAt), [visible])

  const fmtTime = (ts: number) => {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-400 text-black font-bold shadow">
            {unreadCount}
          </div>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-slate-700 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-white">
          <div className="p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold gold-gradient">Notifications</h3>
              <div className="flex items-center gap-1">
                {sorted.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllRead()} aria-label="Mark all as read">
                    Mark all read
                  </Button>
                )}
                {sorted.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => clearAll()} aria-label="Clear all notifications">
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {sorted.length > 0 ? (
              <div className="p-2 space-y-2">
                {sorted.map((n) => (
                  <div key={n.id} className={`p-3 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors ${n.read ? '' : 'ring-1 ring-yellow-400/30'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <button
                        className="text-left space-y-1 flex-1"
                        onClick={() => markRead(n.id)}
                        aria-label="Mark notification as read"
                      >
                        <p className="font-semibold text-sm gold-gradient">{n.title}</p>
                        {n.message && <p className="text-sm text-muted-foreground">{n.message}</p>}
                        <p className="text-xs text-muted-foreground">{fmtTime(n.createdAt)}</p>
                      </button>
                      <div className="flex items-center gap-2">
                        <Badge variant={n.type === 'warning' || n.type === 'error' ? 'destructive' : 'secondary'}>
                          {n.type}
                        </Badge>
                        <button className="text-slate-400 hover:text-white" aria-label="Dismiss notification" onClick={() => dismiss(n.id)}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
            )}
          </div>

          {/* Footer intentionally removed; actions moved to header for visibility */}
        </div>
      )}
    </div>
  )
}