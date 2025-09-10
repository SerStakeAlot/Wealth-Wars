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
_Last updated: September 10, 2025_
