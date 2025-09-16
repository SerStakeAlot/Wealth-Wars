'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function LotteryTab() {
  const game = useGameStore()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto settle when window ends
  useEffect(() => {
    try { game.settleLotteryIfNeeded() } catch {}
  }, [tick])

  const round = game.lottery.currentRound
  const settings = game.lottery.settings
  const timeLeftMs = game.getLotteryRemainingMs()
  const timeLeft = useMemo(() => formatMs(timeLeftMs), [timeLeftMs])
  const uniquePlayers = Array.from(new Set(round.entries.map(e => e.playerId)))

  const canEnter = !round.locked && !round.settled && timeLeftMs > 0 && uniquePlayers.length < settings.maxEntries

  const handleEnter = () => {
    const res = game.enterLottery()
    if (!res.success) return
  }

  const last = game.lottery.lastRound
  const youCanClaim = !!last && last.settled && last.winnerId !== game.player.id && (last.entries.some(e => e.playerId === game.player.id)) && !(last.claims && last.claims[game.player.id])
  const handleClaim = () => {
    game.claimLotteryShare()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lottery</CardTitle>
          <CardDescription>Enter with {settings.entryAmount} $WEALTH. Max {settings.maxEntries} entrants. Round locks after {Math.floor(settings.durationMs/60000)} minutes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded border border-border p-3">
              <div className="text-muted-foreground">Round</div>
              <div className="text-lg font-semibold">#{round.id}</div>
            </div>
            <div className="rounded border border-border p-3">
              <div className="text-muted-foreground">Entries</div>
              <div className="text-lg font-semibold">{uniquePlayers.length}/{settings.maxEntries}</div>
            </div>
            <div className="rounded border border-border p-3">
              <div className="text-muted-foreground">Pot</div>
              <div className="text-lg font-semibold">{round.pot} $WEALTH</div>
            </div>
            <div className="rounded border border-border p-3">
              <div className="text-muted-foreground">Time left</div>
              <div className="text-lg font-semibold">{round.locked || round.settled ? 'Locked' : timeLeft}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleEnter} disabled={!canEnter} className="bg-green-600 hover:bg-green-700">
              Enter — {settings.entryAmount} $WEALTH
            </Button>
            {!canEnter && !round.settled && <Badge variant="secondary">Closed</Badge>}
            {round.settled && <Badge className="bg-purple-600">Settled</Badge>}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Payouts: Winner 80% • Treasury 10% • Redistribution 10% (losers can claim)
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Entrants</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {uniquePlayers.length === 0 && <div className="text-muted-foreground">No entries yet</div>}
              {uniquePlayers.map(id => (
                <div key={id} className="rounded border border-border p-2 flex items-center justify-between">
                  <div>{id}</div>
                  {round.entries.find(e => e.playerId === id)?.timestamp && (
                    <div className="text-xs text-muted-foreground">{new Date(round.entries.find(e => e.playerId === id)!.timestamp).toLocaleTimeString()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Round</CardTitle>
          <CardDescription>View the previous round result and claim your redistribution if eligible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!last && <div className="text-sm text-muted-foreground">No completed round yet.</div>}
          {last && (
            <div className="space-y-2 text-sm">
              <div>Round #{last.id} • Pot {last.pot} $WEALTH</div>
              <div>Winner: {last.winnerId || '—'}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-border p-2">Winner: {last.payouts?.winner ?? 0}</div>
                <div className="rounded border border-border p-2">Treasury: {last.payouts?.treasury ?? 0}</div>
                <div className="rounded border border-border p-2">Redistribution: {last.payouts?.redistribution ?? 0}</div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button onClick={handleClaim} disabled={!youCanClaim}>
                  Claim Redistribution
                </Button>
                {!youCanClaim && <span className="text-xs text-muted-foreground">No claim available</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}
