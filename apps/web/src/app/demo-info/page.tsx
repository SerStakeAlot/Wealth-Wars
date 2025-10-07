import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Wealth Wars Demo – Founding Citizen Phase',
  description: 'Earn Credits, climb the leaderboard, and secure your share of the first Developer Vault reward — up to 10,000,000 $WEALTH.'
}

export default function DemoInfoPage() {
  return (
    <main className="relative min-h-screen bg-[#060a11] text-slate-200 font-sans overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 30% 25%, rgba(255,215,64,0.25), transparent 60%)'}} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#060a11_0%,#09121b_50%,#0d1824_100%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-10 md:py-16">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="font-black tracking-wider text-lg md:text-xl bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-400 text-transparent bg-clip-text drop-shadow">WEALTH WARS</Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest px-3 py-1 rounded bg-amber-400 text-slate-900 shadow-inner animate-pulse">DEMO • COMING SOON</span>
            <Link href="/game" className="text-[11px] font-semibold px-4 py-2 rounded border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition">ENTER GAME</Link>
          </div>
        </header>

        <div className="space-y-8">
          <section className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-400 bg-clip-text text-transparent">Wealth Wars Demo — <span className="text-amber-300">Coming Soon</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">The First Citizens Rise. Earn Credits, climb the leaderboard, and secure your share of the first Developer Vault reward — up to 10,000,000 $WEALTH in total.</p>
            <p className="text-slate-400 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">Your activity in this phase will carry forward into the main game. You’re not just testing — you are shaping the foundation.</p>
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            <InfoCard title="1️⃣ Clock-In Every 30m" color="emerald">
              Each clock-in grants <strong className="text-emerald-300">1,000 Credits</strong>. Cooldown: 30 minutes. Stay active — consistency compounds.
            </InfoCard>
            <InfoCard title="2️⃣ Share for Bonus" color="amber">
              Each verified share (X / Telegram) = +1 click +1,000 Credits. <span className="text-amber-300">Max 5 shares/day</span> to prevent spam.
            </InfoCard>
            <InfoCard title="3️⃣ Stack Credits" color="cyan">
              All Credits tracked off-chain until Vault snapshot (Oct 30). Every credit matters.
            </InfoCard>
          </section>

          <section className="space-y-4" id="vault">
            <h2 className="text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3 text-emerald-200"><span className="inline-block w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-700 rounded"/>🏦 The Developer’s Vault Event</h2>
            <p className="text-sm text-slate-300">On October 30, the first Vault Distribution occurs:</p>
            <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900/40 text-xs">
              <table className="w-full">
                <thead className="bg-slate-800/60 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Pool</th>
                    <th className="px-3 py-2 text-left font-medium">Size</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Demo Player Rewards</td>
                    <td className="px-3 py-2">6M–10M $WEALTH</td>
                    <td className="px-3 py-2">Proportional to total Credits earned by all players.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Snapshot Time</td>
                    <td className="px-3 py-2">Oct 30, 00:00 UTC</td>
                    <td className="px-3 py-2">Player totals frozen; rewards calculated.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Distribution</td>
                    <td className="px-3 py-2">Direct to wallet</td>
                    <td className="px-3 py-2">Claimable or auto-send (TBA).</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-300">Your percentage share is purely your Credits ÷ total global Credits. <span className="text-emerald-300 font-semibold">Consistency wins.</span></p>
          </section>

          <section className="space-y-4" id="carryover">
            <h2 className="text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3 text-emerald-200"><span className="inline-block w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-700 rounded"/>🔁 Carryover to Main Game</h2>
            <p className="text-sm text-slate-300">Demo Credits convert into <span className="text-amber-300 font-semibold">Founding Credits</span> at launch.</p>
            <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900/40 text-xs">
              <table className="w-full">
                <thead className="bg-slate-800/60 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">System</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Carryover Pool</td>
                    <td className="px-3 py-2">1–2% of the main economy seeded to demo players.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Conversion</td>
                    <td className="px-3 py-2">Based on your share of total demo Credits.</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-amber-300">Purpose</td>
                    <td className="px-3 py-2">Prestige + early acceleration.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <blockquote className="border-l-2 border-emerald-400 pl-4 italic text-slate-300/90">“Founding Credits from the first demo will be honored at launch — the earliest Citizens begin their new lives with a head start.”</blockquote>
            <p className="text-sm text-slate-300">Earn the badge: <span className="font-semibold text-emerald-300">“Founding Citizen — Season Zero.”</span></p>
          </section>

          <section className="space-y-4" id="win">
            <h2 className="text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3 text-emerald-200"><span className="inline-block w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-700 rounded"/>🎖️ How to Win</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-slate-300">
              <li>Clock in often — every 30 minutes counts.</li>
              <li>Share strategically — each verified share = extra click.</li>
              <li>Stay consistent — streak bonuses will compound.</li>
              <li>Climb the leaderboard — top 10 gain recognition + boosts.</li>
              <li>Be early — every Credit carries forward.</li>
            </ul>
          </section>

          <section className="mt-12 text-center space-y-6">
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">The Vault Opens <span className="text-amber-300 font-semibold">October 30</span>. Earn. Share. Rise. Become a Founding Citizen.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="px-8 py-3 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[13px] font-semibold hover:bg-emerald-500/30 transition">ENTER DEMO GAME</Link>
              <Link href="/" className="px-8 py-3 rounded bg-slate-700/30 border border-slate-500/40 text-slate-200 text-[13px] font-semibold hover:bg-slate-700/50 transition">BACK HOME</Link>
            </div>
          </section>
        </div>

        <footer className="mt-20 py-10 text-center text-[11px] text-slate-500 border-t border-slate-800/60">© {new Date().getFullYear()} Wealth Wars • Demo Phase Info • All preliminary values subject to change.</footer>
      </div>
    </main>
  )
}

function InfoCard({ title, children, color }:{ title: string; children: React.ReactNode; color: 'emerald'|'amber'|'cyan'}) {
  const colorMap = {
    emerald: 'from-emerald-600/20 to-emerald-700/10 border-emerald-500/30 text-emerald-200',
    amber: 'from-amber-600/20 to-amber-700/10 border-amber-500/30 text-amber-200',
    cyan: 'from-cyan-600/20 to-cyan-700/10 border-cyan-500/30 text-cyan-200'
  } as const
  return (
    <div className={`relative rounded-lg border p-5 bg-gradient-to-b ${colorMap[color]} text-xs md:text-[13px] leading-relaxed shadow-[0_0_0_1px_rgba(255,255,255,0.05)]`}> 
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-xl opacity-20 pointer-events-none" />
      <h3 className="font-semibold mb-2 tracking-wide text-[12px] md:text-xs uppercase opacity-90">{title}</h3>
      <div className="text-slate-300/90">{children}</div>
    </div>
  )
}
