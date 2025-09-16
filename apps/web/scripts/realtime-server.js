#!/usr/bin/env node
// Realtime Presence WebSocket server
// Usage: node scripts/realtime-server.js

const WebSocket = require('ws')
const http = require('http')

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080
const HEARTBEAT_INTERVAL_MS = process.env.HEARTBEAT_INTERVAL_MS ? Number(process.env.HEARTBEAT_INTERVAL_MS) : 15000
const STALE_AFTER_MS = process.env.STALE_AFTER_MS ? Number(process.env.STALE_AFTER_MS) : 45000

// Minimal presence record kept in memory
// players: Map<playerId, { id, username, lastSeen }>
const players = new Map()
// clientIndex: Map<WebSocket, playerId>
const clientIndex = new Map()

const server = http.createServer()
const wss = new WebSocket.Server({ server })

function now() { return Date.now() }

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload })
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(msg) } catch {}
    }
  })
}

function sendPresence(ws) {
  const list = Array.from(players.values()).map(p => ({ id: p.id, username: p.username, lastSeen: p.lastSeen }))
  const msg = JSON.stringify({ type: 'presence:update', payload: list })
  try { ws.send(msg) } catch {}
}

function upsertPresence(id, username) {
  const entry = players.get(id) || { id, username: username || `Guest_${id.slice(-4)}`, lastSeen: 0 }
  entry.username = username || entry.username
  entry.lastSeen = now()
  players.set(id, entry)
}

function removePresenceById(id) {
  if (players.has(id)) {
    players.delete(id)
    broadcast('presence:update', Array.from(players.values()))
  }
}

function pruneStale() {
  const cutoff = now() - STALE_AFTER_MS
  let changed = false
  for (const [id, rec] of players.entries()) {
    if ((rec.lastSeen || 0) < cutoff) {
      players.delete(id)
      changed = true
    }
  }
  if (changed) broadcast('presence:update', Array.from(players.values()))
}

wss.on('connection', (ws) => {
  console.info('[presence] client connected')

  // Attach ping/pong heartbeat at socket level
  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })

  // Send initial presence snapshot
  sendPresence(ws)

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      const { type, payload } = msg
      if (type === 'hello') {
        const id = String(payload?.id || '') || `guest_${Math.random().toString(36).slice(2, 10)}`
        const username = String(payload?.username || '') || `Guest_${id.slice(-4)}`
        clientIndex.set(ws, id)
        upsertPresence(id, username)
        broadcast('presence:update', Array.from(players.values()))
      } else if (type === 'heartbeat') {
        const id = clientIndex.get(ws)
        if (id) {
          upsertPresence(id, payload?.username)
          // Optionally throttle presence broadcasts; for simplicity broadcast on each heartbeat
          broadcast('presence:update', Array.from(players.values()))
        }
      } else if (type === 'set:username') {
        const id = clientIndex.get(ws)
        if (id) {
          upsertPresence(id, String(payload?.username || ''))
          broadcast('presence:update', Array.from(players.values()))
        }
      }
    } catch (e) {
      console.warn('[presence] invalid message', e)
    }
  })

  ws.on('close', () => {
    const id = clientIndex.get(ws)
    clientIndex.delete(ws)
    if (id) removePresenceById(id)
    console.info('[presence] client disconnected')
  })
})

// Server-level heartbeat to terminate dead connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate()
    ws.isAlive = false
    try { ws.ping() } catch {}
  })
  pruneStale()
}, HEARTBEAT_INTERVAL_MS)

wss.on('close', () => clearInterval(interval))

server.listen(PORT, () => {
  console.info(`[presence] running on ws://localhost:${PORT}`)
})
