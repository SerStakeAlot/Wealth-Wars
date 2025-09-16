"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Swords, Coins, Shield, Building2, Trophy, BookOpen, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { useNotificationStore } from '@/lib/notificationStore'

export default function AboutTab() {
  const resetGame = useGameStore(s => s.resetGame)
  const pushNotif = useNotificationStore(s => s.push)
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            About Wealth Wars
          </CardTitle>
          <CardDescription>A strategic, player-vs-player economy game on Solana.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Wealth Wars is a competitive strategy game where you build a business empire, battle rivals, and manage risk across credits and $WEALTH. Progress by clocking in to work, acquiring and activating enhanced businesses, and engaging in tactical PvP with shields, insurance, and cooldown-based attack types.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Core Gameplay
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-4 space-y-1">
              <li>Clock In to earn credits (base 25+), with cooldowns that scale by streaks and boosts.</li>
              <li>Buy normal businesses for passive multipliers; own and slot Enhanced Businesses to unlock abilities.</li>
              <li>Activate abilities with individual cooldowns; some are instant, some are sustained.</li>
              <li>Convert between Credits and $WEALTH in the Treasury to optimize your strategy.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5" />
              PvP & Combat Types
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-4 space-y-1">
              <li>Standard (credits): classic skirmish, up to 10% $WEALTH theft on success.</li>
              <li>Wealth Assault (wealth): high-stakes attack, up to 25% $WEALTH theft.</li>
              <li>Land Siege (wealth): siege for up to 35% $WEALTH theft.</li>
              <li>Business Sabotage (credits): damages normal business multipliers and lightly nicks enhanced businesses.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Defense & Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-4 space-y-1">
              <li>Buy shields with $WEALTH (1h/24h/72h) to increase defense rating and reduce attack success.</li>
              <li>Insurance mitigates sabotage damage to both normal and enhanced businesses.</li>
              <li>Defense rating impacts opponent success probability; outcomes are clamped for fairness.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Economy & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ul className="list-disc pl-4 space-y-1">
              <li>Two currencies: Credits (work-driven) and $WEALTH (premium/strategic spends).</li>
              <li>Attacks cost either credits or $WEALTH; theft amounts are capped per attack type.</li>
              <li>Convert resources in Treasury, and reinvest to grow multipliers and power.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Progression & Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc pl-4 space-y-1">
            <li>Level up by playing; streaks and boosts accelerate growth.</li>
            <li>Clans, achievements, and leaderboards showcase your rise to the top.</li>
            <li>Recent battles summarize wins/losses, credits stakes, and $WEALTH changes.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Solana</Badge>
        <Badge variant="secondary">Next.js</Badge>
        <Badge variant="secondary">Zustand</Badge>
        <Badge variant="secondary">shadcn/ui</Badge>
        <Badge variant="secondary">Anchor</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset Progress
          </CardTitle>
          <CardDescription>Clear all local session data and start fresh at 100 credits / 1000 $WEALTH.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>This only affects your local browser storage (no shared backend). It wipes businesses, enhanced slots, cooldowns, land, manager charges, and notifications.</p>
          {!confirming && (
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10" onClick={() => setConfirming(true)}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Progress
            </Button>
          )}
          {confirming && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  resetGame()
                  try { pushNotif({ type: 'success', title: 'Progress reset', message: 'Game state restored to baseline', showInBanner: true, durationMs: 5000 }) } catch {}
                  setConfirming(false)
                }}
              >
                Confirm Reset
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          )}
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground">Manual clear (advanced)</summary>
            <div className="mt-2 text-xs space-y-1">
              <p>If something seems stuck you can also run this in your browser console:</p>
              <pre className="rounded bg-muted p-2 overflow-auto"><code>{`localStorage.removeItem('wealth-wars-store');
localStorage.removeItem('wwars-notifications');
location.reload();`}</code></pre>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
