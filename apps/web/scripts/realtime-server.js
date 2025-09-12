#!/usr/bin/env node
// Simple WebSocket server to broadcast clan create/join messages for local testing
// Usage: node scripts/realtime-server.js

const WebSocket = require('ws')
const port = process.env.PORT || 4000
const wss = new WebSocket.Server({ port })

let clans = [
  { id: '1', name: 'Dragon Lords', tag: '[DL]', leader: 'demo-1', members: 50, maxMembers: 50, description: 'Top PvP clan', trophies: 2100, rank: 1 },
  { id: '2', name: 'Phoenix Rising', tag: '[PR]', leader: 'demo-2', members: 48, maxMembers: 50, description: 'Rising stars', trophies: 1950, rank: 2 }
]

// pending join requests: { id, clanId, playerId, username }
let joinRequests = []

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload })
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg)
  })
}

wss.on('connection', (ws) => {
  console.info('[realtime-server] client connected')
  // send current clans
  ws.send(JSON.stringify({ type: 'clans:update', payload: clans }))

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      const { type, payload } = msg
      console.info('[realtime-server] received', type)
      if (type === 'clan:create') {
        // simple server-side create
        clans = [payload, ...clans]
        broadcast('clans:update', clans)
      } else if (type === 'clan:joinRequest') {
        // store the request and notify clan leaders
        const id = `${Date.now()}`
        const req = { id, clanId: payload.clanId, playerId: payload.playerId, username: payload.username || payload.playerId }
        joinRequests.push(req)
        broadcast('clan:joinRequest', req)
      } else if (type === 'clan:acceptJoin') {
        // payload: { requestId, clanId }
        const reqIndex = joinRequests.findIndex(r => r.id === payload.requestId)
        if (reqIndex >= 0) {
          const req = joinRequests.splice(reqIndex, 1)[0]
          // find clan and increment members (very naive)
          const clan = clans.find(c => c.id === payload.clanId)
          if (clan) {
            clan.members = (clan.members || 0) + 1
            // broadcast updated clans and accepted event
            broadcast('clans:update', clans)
            broadcast('clan:joinAccepted', { clanId: clan.id, playerId: req.playerId, username: req.username })
          }
        }
      }
    } catch (e) {
      console.warn('[realtime-server] invalid message', e)
    }
  })

  ws.on('close', () => console.info('[realtime-server] client disconnected'))
})

console.info(`[realtime-server] running on ws://localhost:${port}`)
