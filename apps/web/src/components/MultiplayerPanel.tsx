 'use client'

import React, { useEffect } from 'react'
import { useMultiplayerStore } from '../lib/multiplayerStore'

type Props = {
  embedded?: boolean
}

export default function MultiplayerPanel({ embedded = false }: Props) {
  const {
    onlinePlayers,
    isConnected,
    connectionStatus,
    connectToMultiplayer,
    disconnect,
  } = useMultiplayerStore()

  useEffect(() => {
    // Auto connect for demo purposes when the panel mounts
    if (!isConnected) {
      connectToMultiplayer().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`multiplayerPanel ${embedded ? 'embedded' : 'floating'}`}>
      <div className="header">
        <strong>Multiplayer</strong>
        <div className="status">{connectionStatus}</div>
      </div>

      <div className="controls">
        {!isConnected ? (
          <button onClick={() => connectToMultiplayer()}>Connect</button>
        ) : (
          <button onClick={() => disconnect()}>Disconnect</button>
        )}
      </div>

      <ul className="players">
        {onlinePlayers.map(p => (
          <li key={p.id} className={`player ${p.isOnline ? 'online' : 'offline'}`}>
            <span className="avatar">{p.avatar ?? '🙂'}</span>
            <span className="name">{p.username}</span>
            <span className="meta">Lv {p.level} • {p.credits}c</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .multiplayerPanel {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          padding: 12px; border-radius: 12px; color: #e6edf5; box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }
        .multiplayerPanel.floating { position: absolute; left: 18px; bottom: 18px; z-index: 9; width: 260px; }
        .multiplayerPanel.embedded { position: static; width: 100%; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
        .status { font-size:12px; color:#9aa7bd }
        .controls { display:flex; gap:8px; margin-bottom:8px }
        button { background: linear-gradient(180deg,#22c55e,#166534); color:white; border: none; padding:6px 10px; border-radius:8px; cursor:pointer }
        .players { list-style:none; padding:0; margin:0; max-height:180px; overflow:auto }
        .player { display:flex; gap:8px; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.02) }
        .avatar { width:32px; height:32px; display:grid; place-items:center; background:rgba(255,255,255,0.03); border-radius:8px }
        .name { font-weight:700 }
        .meta { margin-left:auto; font-size:12px; color:#9aa7bd }
        .online .avatar { box-shadow:0 0 0 3px rgba(34,197,94,0.08) }
      `}</style>
    </div>
  )
}
