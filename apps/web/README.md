This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Web App

## Pixel UI (Experimental)

The experimental retro Pixel UI lives at the `/pixel` route and is feature-flagged off by default.

Enable it by setting the environment variable in `apps/web/.env.local`:

```
NEXT_PUBLIC_PIXEL_UI=1
```

Then start (or restart) the dev server:

```
npm run dev:web
```

If the flag is not set you will see the placeholder message: "Pixel UI disabled. Set NEXT_PUBLIC_PIXEL_UI=1 to enable.".

## Info & Settings Panel

Open the in-game Info / Settings side panel via:

- Dock button labelled `INFO`
- Keyboard shortcut `I` (when shortcuts enabled)

Sections included:

1. Controls & Shortcuts – quick reference for panel toggles.
2. Clan XP Rules – how personal actions feed clan progression.
3. Level Perks Snapshot – milestone levels (1,5,10,15,...50) and their perk highlights.
4. Settings – toggle Reduced Motion & Keyboard Shortcuts (persisted in localStorage).
5. Formulas – core progression math (level, quest, work, exchange, share boost).

Settings Persistence Keys (localStorage):

```
ww_ps_reducedMotion
ww_ps_enableShortcuts
ww_ps_showAdvanced (future expansion)
```

## Level Unlock Modal

Click your LEVEL value in the top profile bar to open a modal showing:

- Current level highlight
- Upcoming 15 levels with any milestone perks (slots, defense, shield discount, exchange cap, work multiplier step)
- Core formulas for XP, caps, and discounts

Esc or outside click closes the modal.

### Milestone Summary

- Enhanced Business Slots: +1 at levels 5, 10, 15 (max 4 currently)
- Base Defense: +1 breakpoint every 5 levels (additional long‑tail scaling post-50 in code)
- Shield Discount: 5% every 5 levels (cap 30%)
- Exchange Daily User Cap: +1 per 2 levels up to 40, then +1 every 5 levels
- Work Multiplier Level Component: highlighted every 5 levels (grows gradually each level)

## Keyboard Shortcuts

Panel toggles (when enabled):

```
Q  Quests
A  Achievements
B  Battle Feed
C  Clan Panel
T  Chat
I  Info / Settings
H  Shortcut Hint Toast
```

Shortcuts can be disabled in the Info panel (persisted). Input/textarea focus automatically suppresses shortcuts.

## Clan XP Rules (Recap)

- Manual Work: 20% of personal XP gained -> clan XP
- Quest Claim: 50% of quest XP (fallback: credits/50 if no XP reward)
- Clan Level Up: every level increases XP threshold (level * 500); every 5 clan levels +5 max members

## Reduced Motion

When enabled, large entrance animations and particle bursts are skipped for accessibility & performance.

## Future Enhancements (Planned)

- Advanced Metrics toggle surfacing detailed multiplier breakdowns
- Dedicated Notifications / Help panel (currently H shows toast)
- Expanded unlock table beyond level 50
