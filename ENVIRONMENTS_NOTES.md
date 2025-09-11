# Wealth Wars: Environment Separation Notes

## Overview
This document outlines the strict separation between the two main environments for Wealth Wars development:

- **Localhost Development (Main Project)**
- **Vercel Demo Deployment (Public Demo)**

## Environment Purposes

### 1. Localhost Development (Main Project)
- **Purpose:** Main development environment for building, testing, and solidifying the Wealth Wars project.
- **Behavior:**
  - Full game experience with all features enabled.
  - No demo restrictions or demo-only logic.
  - Environment variable `NEXT_PUBLIC_DEMO_ONLY` is **not** set or used.
  - All changes here are for the main project only.
- **Workflow:**
  - Use `npm run dev` or equivalent to start the local server.
  - All new features, bug fixes, and mainline development happen here.
  - Never let demo logic or restrictions affect this environment.

### 2. Vercel Demo Deployment (Public Demo)
- **Purpose:** Public demo for users to interact with a limited version of Wealth Wars and provide feedback.
- **Behavior:**
  - Demo mode is enabled via `NEXT_PUBLIC_DEMO_ONLY` environment variable (set in Vercel project settings).
  - Demo logic is active (e.g., limited features, demo-specific purchasing, etc.).
  - Some features may be restricted or behave differently for demo purposes.
  - No changes here should affect the main project or localhost.
- **Workflow:**
  - Deploy to Vercel using `vercel --prod` or via Vercel dashboard.
  - All demo-specific changes are made here.
  - Never let main project changes or unrestricted features leak into the demo.

## Key Technical Notes
- **Middleware (`middleware.ts`):**
  - Handles demo site detection and routing.
  - Excludes `localhost` from demo logic.
  - Demo logic is only active on Vercel deployments.
- **Game Page (`game/page.tsx`):**
  - Contains logic for demo mode and redirects.
  - Demo logic is disabled for localhost, enabled for Vercel.
- **Demo Store (`lib/demo-store.ts`):**
  - Manages demo state and business purchasing logic.
  - Demo mode now allows normal business purchases.
- **Homepage (`page.tsx`):**
  - Shows Play Now and Play Demo buttons.
  - Demo detection excludes localhost.
- **Environment Variables:**
  - `.env.local` is for local dev only; do not set demo variables here.
  - Vercel project settings control demo mode via `NEXT_PUBLIC_DEMO_ONLY`.

## Workflow & Communication
- **Always specify which environment you want to work on:**
  - "Localhost" = main project, unrestricted.
  - "Vercel demo" = public demo, demo logic enabled.
- **Never mix changes between environments.**
- **If you open a new session, ask the agent to read this document to get up to speed.**

---
_Last updated: September 11, 2025_

## Troubleshooting: Common Issues & Fixes

### Issue: "Play Now" Button Redirects to Demo on Localhost
**Symptoms:**
- Localhost redirects to `/demo` instead of showing normal game UI
- Error message about demo site detection
- Normal game features are restricted on localhost

**Root Cause:** 
Hardcoded `NEXT_PUBLIC_DEMO_ONLY='true'` in `next.config.ts` overrides environment detection.

**Fix:**
1. **Check `apps/web/next.config.ts`:**
   ```typescript
   // ❌ WRONG - This forces localhost into demo mode
   env: {
     NEXT_PUBLIC_DEMO_ONLY: 'true',
   },
   
   // ✅ CORRECT - Comment out or remove
   // env: {
   //   NEXT_PUBLIC_DEMO_ONLY: 'true', // Only for Vercel demo
   // },
   ```

2. **Verify localhost detection in `lib/demo-site-config.ts`:**
   - Ensure localhost is excluded from demo logic
   - Check `isDemoSite()` function returns `false` for localhost

### Issue: React Hook Errors (useConnection, useState violations)
**Symptoms:**
- `useConnection()` runtime errors
- "Cannot call hooks conditionally" errors
- Fast Refresh reload due to runtime errors

**Root Cause:** 
React Rules of Hooks violations - hooks called after conditional logic or not at component top.

**Fix:**
1. **Move ALL useState calls to component top:**
   ```typescript
   function GamePage() {
     // ✅ ALL useState calls FIRST
     const [state1, setState1] = useState(value);
     const [state2, setState2] = useState(value);
     
     // ✅ Other hooks after useState
     const connection = useConnection();
     const router = useRouter();
     
     // ✅ Conditional logic AFTER all hooks
     if (condition) return <div>...</div>;
   }
   ```

2. **Safe hook destructuring:**
   ```typescript
   // ❌ WRONG - Direct destructuring can fail
   const { connection } = useConnection();
   
   // ✅ CORRECT - Safe with fallback
   const connectionContext = useConnection();
   const connection = connectionContext?.connection || null;
   ```

### Issue: Game Page Compilation Errors
**Symptoms:**
- TypeScript compilation failures
- Cannot redeclare variable errors
- Duplicate function implementation errors

**Root Cause:**
Duplicate useState declarations scattered throughout component.

**Fix:**
1. **Consolidate all useState at top**
2. **Remove duplicate declarations**
3. **Follow React component structure:**
   ```typescript
   function Component() {
     // 1. ALL useState calls
     // 2. Other hooks (useEffect, etc.)  
     // 3. Regular variables/functions
     // 4. Conditional returns
     // 5. Main JSX return
   }
   ```

### Emergency Recovery Commands
If issues persist, use these recovery commands:

```bash
# 1. Restore original game page from git
cd /workspaces/Wealth-Wars
git checkout HEAD -- apps/web/src/app/game/page.tsx

# 2. Remove hardcoded demo env var
# Edit apps/web/next.config.ts and comment out env.NEXT_PUBLIC_DEMO_ONLY

# 3. Fix useConnection hook
# Edit apps/web/src/app/hooks/useWealthWarsProgram.ts with safe destructuring

# 4. Restart dev server
cd apps/web && npm run dev
```

---
_Last updated: September 11, 2025_
