"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  createdAt: number
  read?: boolean
  dismissed?: boolean
  // If true, will surface in the top banner queue
  showInBanner?: boolean
  // Auto-dismiss timer for banner (ms). If omitted and sticky=false, defaults to 6000ms
  durationMs?: number
  // If true, banner won't auto-dismiss
  sticky?: boolean
}

interface NotificationState {
  notifications: AppNotification[]
  // Actions
  push: (n: Omit<Partial<AppNotification>, 'id' | 'createdAt'> & { title: string; type?: NotificationType }) => string
  dismiss: (id: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      push: (n) => {
        const id = n && (n as any).id ? String((n as any).id) : `ntf_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
        const type: NotificationType = n.type || 'info'
        const createdAt = Date.now()
        const next: AppNotification = {
          id,
          type,
          title: n.title,
          message: n.message,
          createdAt,
          read: false,
          dismissed: false,
          showInBanner: n.showInBanner !== false,
          durationMs: n.durationMs,
          sticky: n.sticky,
        }
        set((s) => ({ notifications: [next, ...s.notifications].slice(0, 100) }))
        return id
      },

      dismiss: (id) => {
        set((s) => ({ notifications: s.notifications.map((x) => (x.id === id ? { ...x, dismissed: true, read: true } : x)) }))
      },

      markRead: (id) => {
        set((s) => ({ notifications: s.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)) }))
      },

      markAllRead: () => {
        set((s) => ({ notifications: s.notifications.map((x) => ({ ...x, read: true })) }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'wwars-notifications',
      version: 1,
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          const mem = new Map<string, string>()
          return {
            getItem: (name: string) => mem.get(name) ?? null,
            setItem: (name: string, value: string) => {
              mem.set(name, value)
            },
            removeItem: (name: string) => {
              mem.delete(name)
            },
          } as unknown as Storage
        }
        return localStorage
      }),
      partialize: (state) => ({ notifications: state.notifications.slice(0, 50) }),
    }
  )
)

// Selectors and helpers
export const selectors = {
  unreadCount: (s: NotificationState) => s.notifications.filter((n) => !n.read).length,
  activeBanner: (s: NotificationState) =>
    s.notifications
      .filter((n) => n.showInBanner && !n.dismissed)
      .sort((a, b) => b.createdAt - a.createdAt)[0],
}
