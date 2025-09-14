"use client"

type Handler = (payload: any) => void

const handlers: Record<string, Handler[]> = {}
let urlInUse = ''

function connect(url?: string) {
  if (typeof window === 'undefined') return
  const envUrl = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_REALTIME_URL as string)) || ''
  const u = url || envUrl
  if (!u) {
    console.info('[realtime] URL not configured, skipping connect')
    return
  }
  if (urlInUse === u) return
  urlInUse = u
  // let ws: WebSocket | null = null;
  //
  // ws = new WebSocket(u)
  //
  // ws.addEventListener('open', () => {
  //   console.info('[realtime] connected to', u)
  // })
  //
  // ws.addEventListener('message', (ev) => {
  //   try {
  //     const msg = JSON.parse(ev.data)
  //     const { type, payload } = msg
  //     ;(handlers[type] || []).forEach(h => h(payload))
  //   } catch (e) {
  //     console.warn('[realtime] invalid message', e)
  //   }
  // })
  //
  // ws.addEventListener('close', () => {
  //   console.info('[realtime] disconnected')
  //   // attempt reconnect
  //   ws = null
  //   // Only attempt reconnect if URL is configured
  //   if (u) setTimeout(() => connect(u), 2000)
  // })
}

function on(event: string, handler: Handler) {
  handlers[event] = handlers[event] || []
  handlers[event].push(handler)
  return () => {
    handlers[event] = (handlers[event] || []).filter(h => h !== handler)
  }
}

function emit(type: string, payload: any) {
  // if (!ws || ws.readyState !== WebSocket.OPEN) {
  //   console.info('[realtime] not connected, skipping emit', type)
  //   return
  // }
  // ws.send(JSON.stringify({ type, payload }))
}

function close() {
  // if (!ws) return
  // ws.close()
  // ws = null
}

export const realtime = {
  connect,
  on,
  emit,
  close,
}

export default realtime
