// Wealth Wars Presence Lambda (API Gateway WebSocket)
// Handles $connect, $disconnect, and app-level routes: hello, heartbeat, set:username

const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const TABLE = process.env.TABLE_NAME
const TTL_SECONDS = Number(process.env.TTL_SECONDS || 60)

function ttlEpoch() {
  return Math.floor(Date.now() / 1000) + TTL_SECONDS
}

function now() { return Date.now() }

async function putConnection({ connectionId, playerId, username }) {
  const item = {
    connectionId,
    playerId,
    username: username || (playerId ? `Guest_${String(playerId).slice(-4)}` : ''),
    lastSeen: now(),
    ttl: ttlEpoch()
  }
  await ddb.put({ TableName: TABLE, Item: item }).promise()
}

async function deleteConnection(connectionId) {
  await ddb.delete({ TableName: TABLE, Key: { connectionId } }).promise()
}

async function scanConnections() {
  const res = await ddb.scan({ TableName: TABLE, ProjectionExpression: 'connectionId, playerId, username, lastSeen' }).promise()
  return res.Items || []
}

async function broadcast(event, message) {
  const mgmt = new AWS.ApiGatewayManagementApi({
    endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`
  })
  const conns = await scanConnections()
  const payload = JSON.stringify(message)
  await Promise.allSettled(conns.map(async c => {
    try {
      await mgmt.postToConnection({ ConnectionId: c.connectionId, Data: payload }).promise()
    } catch (e) {
      if (e.statusCode === 410) {
        await deleteConnection(c.connectionId)
      }
    }
  }))
}

async function sendPresenceSnapshot(event) {
  const list = await scanConnections()
  const payload = {
    type: 'presence:update',
    payload: list.map(p => ({ id: p.playerId, username: p.username, lastSeen: p.lastSeen }))
  }
  await broadcast(event, payload)
}

exports.main = async (event) => {
  const { routeKey, connectionId } = event.requestContext
  try {
    if (routeKey === '$connect') {
      // Initial put with connection only; playerId/username set after hello
      await putConnection({ connectionId })
      return { statusCode: 200, body: 'connected' }
    }
    if (routeKey === '$disconnect') {
      await deleteConnection(connectionId)
      await sendPresenceSnapshot(event)
      return { statusCode: 200, body: 'disconnected' }
    }

    // Parse payload for application messages
    let body
    try { body = JSON.parse(event.body || '{}') } catch { body = {} }
    const type = body.type || routeKey
    const payload = body.payload || {}

    if (type === 'hello') {
      const playerId = String(payload.id || '') || `guest_${Math.random().toString(36).slice(2,10)}`
      const username = String(payload.username || '') || `Guest_${playerId.slice(-4)}`
      await putConnection({ connectionId, playerId, username })
      await sendPresenceSnapshot(event)
      return { statusCode: 200, body: 'hello' }
    }

    if (type === 'heartbeat') {
      // Update ttl and lastSeen; keep existing playerId/username
      const conns = await ddb.get({ TableName: TABLE, Key: { connectionId } }).promise()
      const current = conns.Item || { connectionId }
      await putConnection({
        connectionId,
        playerId: current.playerId || `guest_${Math.random().toString(36).slice(2,10)}`,
        username: payload.username || current.username
      })
      await sendPresenceSnapshot(event)
      return { statusCode: 200, body: 'heartbeat' }
    }

    if (type === 'set:username') {
      const conns = await ddb.get({ TableName: TABLE, Key: { connectionId } }).promise()
      const current = conns.Item || { connectionId }
      await putConnection({
        connectionId,
        playerId: current.playerId || `guest_${Math.random().toString(36).slice(2,10)}`,
        username: String(payload.username || current.username || '')
      })
      await sendPresenceSnapshot(event)
      return { statusCode: 200, body: 'set:username' }
    }

    // Default: echo or ignore
    return { statusCode: 200, body: 'ok' }
  } catch (e) {
    console.error('Error handling route', routeKey, e)
    return { statusCode: 500, body: 'error' }
  }
}
