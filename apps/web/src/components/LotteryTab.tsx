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
  const [botsOn, setBotsOn] = useState(true)
  const [botCount, setBotCount] = useState(8)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto settle when window ends (tick-driven check)
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
  const claimable = Math.floor((game.lottery.claimable?.[game.player.id] || 0))
  const handleClaim = () => {
    game.claimLotteryShare()
  }

  // Demo bots: randomly try to enter while round is open, up to botCount unique bots
  useEffect(() => {
    if (!botsOn) return
    const tryBot = () => {
      const open = !round.locked && !round.settled && timeLeftMs > 0
      if (!open) return
      const existing = new Set(uniquePlayers)
      const playerEntered = existing.has(game.player.id)
      // Reserve one slot for the player if they haven't entered yet
      const maxFill = settings.maxEntries - (playerEntered ? 0 : 1)
      const current = existing.size
      if (current >= maxFill) return
      const needed = Math.max(0, Math.min(maxFill - current, botCount))
      if (needed <= 0) return
      // Random chance to add 0-2 bots per second
      const attempts = Math.floor(Math.random() * 3)
      for (let i = 0; i < attempts; i++) {
        // pick a bot id that is not in existing
        const botId = pickBotId(existing)
        if (!botId) break
        ;(game.enterLotteryBot as any)?.(botId)
        existing.add(botId)
      }
    }
    tryBot()
    const id = setInterval(tryBot, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botsOn, tick, botCount, settings.maxEntries, timeLeftMs])

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
            <label className="ml-auto text-xs flex items-center gap-2">
              <input type="checkbox" className="accent-green-600" checked={botsOn} onChange={(e)=>setBotsOn(e.target.checked)} />
              Demo bots
            </label>
            <div className="text-xs flex items-center gap-2">
              <span>Bots:</span>
              <input type="number" min={0} max={settings.maxEntries} value={botCount} onChange={(e)=>setBotCount(Number(e.target.value))} className="w-16 border rounded p-1 bg-background" />
            </div>
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
              <div className="flex items-center gap-3 mt-2">
                <div className="text-sm">Your claimable total: <span className="font-semibold">{claimable} $WEALTH</span></div>
                <Button onClick={handleClaim} disabled={claimable <= 0}>
                  Claim Now
                </Button>
                {claimable <= 0 && <span className="text-xs text-muted-foreground">No claimable yet</span>}
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

function pickBotId(existing: Set<string>): string | null {
  // Generate a pool of bot ids BOT_1..BOT_100 and pick first unused
  for (let i = 1; i <= 100; i++) {
    const id = `BOT_${i}`
    if (!existing.has(id)) return id
  }
  return null
}
