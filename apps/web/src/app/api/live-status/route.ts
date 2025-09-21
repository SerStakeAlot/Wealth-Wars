import { NextResponse } from 'next/server'

// Simple health status endpoint. In production this could proxy or aggregate AWS service health.
// Returns a JSON status with timestamp and optional derived latency simulation.
// Extend later to check Solana RPC, Redis, DB, etc.

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()
  // Placeholder: simulate tiny workload
  const uptime = process.uptime()
  const latency = Date.now() - start
  return NextResponse.json({
    status: 'ok',
    uptimeSeconds: Math.floor(uptime),
    latencyMs: latency,
    timestamp: Date.now(),
    services: {
      api: 'up'
    }
  })
}
