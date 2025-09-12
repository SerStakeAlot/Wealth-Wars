import { create } from 'zustand'
import realtime from '@/lib/realtime'
import { useGameStore } from '@/lib/gameStore'

export interface OnlinePlayer {
  id: string
  username: string
  avatar?: string
  isOnline?: boolean
  level?: number
  battlePower?: number
  wealth?: number
  reputation?: number
  // per-player battle state for demo/testing: shields and accumulated business damage
  battleState?: {
    activeShield?: { expires: number }
    businessDamage?: number
    insuranceActive?: boolean
  }
}

export interface BattleEntry {
  id: string
  attacker: string
  defender: string
  attackType: string
  startTime: number
  duration: number
  stakes?: { type: string; amount: number }
  result?: { winner?: string; loot?: number }
}

export interface BattleInvite {
  id: string
  attacker: string
  attackType: string
  stakes: { type: string; amount: number }
}

interface MultiplayerState {
  onlinePlayers: OnlinePlayer[]
  activeBattles: BattleEntry[]
  battleInvites: BattleInvite[]
  battleHistory: BattleEntry[]
  // clans
  clans: Array<{ id: string; name: string; tag?: string; leader?: string; members: number; maxMembers: number; description?: string; trophies?: number; rank?: number }>

  createClan: (name: string, description: string, leaderId: string) => void
  requestJoinClan: (clanId: string, playerId: string, username?: string) => void
  // pending join requests
  joinRequests: Array<{ id: string; clanId: string; playerId: string; username?: string }>
  acceptJoinRequest: (requestId: string, clanId: string) => void
  setClans: (clans: any[]) => void

  // actions
  challengePlayer: (opponentId: string, attackType: string, stakes: { type: string; amount: number }) => void
  acceptBattleChallenge: (battleId: string) => void
  declineBattleChallenge: (battleId: string) => void
  executeBattleAction: (battleId: string, action: string) => void
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  onlinePlayers: [
    { id: 'demo-1', username: 'DemoPlayer', wealth: 1000, battlePower: 1000, reputation: 0, battleState: { activeShield: { expires: 0 }, businessDamage: 0, insuranceActive: false } }
  ],
  activeBattles: [],
  battleInvites: [],
  battleHistory: [],
  clans: [
    { id: '1', name: 'Dragon Lords', tag: '[DL]', leader: 'demo-1', members: 50, maxMembers: 50, description: 'Top PvP clan', trophies: 2100, rank: 1 },
    { id: '2', name: 'Phoenix Rising', tag: '[PR]', leader: 'demo-2', members: 48, maxMembers: 50, description: 'Rising stars', trophies: 1950, rank: 2 }
  ],
  joinRequests: [],

  challengePlayer: (opponentId: string, attackType: string, stakes: { type: string; amount: number }) => {
    // simple no-op stub: add a battle invite to battleInvites
    const id = `invite_${Date.now()}`
    set(state => ({ battleInvites: [...state.battleInvites, { id, attacker: 'local-player', attackType, stakes }] }))
  },

  acceptBattleChallenge: (battleId: string) => {
    // move from invites to activeBattles (stub)
    const invite = get().battleInvites.find(i => i.id === battleId)
    if (!invite) return
    const battle: BattleEntry = {
      id: `battle_${Date.now()}`,
      attacker: invite.attacker,
      defender: 'local-player',
      attackType: invite.attackType,
      startTime: Date.now(),
      duration: 600000, // 10 minutes
      stakes: invite.stakes
    }
    set(state => ({
      activeBattles: [...state.activeBattles, battle],
      battleInvites: state.battleInvites.filter(i => i.id !== battleId)
    }))
  },

  declineBattleChallenge: (battleId: string) => {
    set(state => ({ battleInvites: state.battleInvites.filter(i => i.id !== battleId) }))
  },

  executeBattleAction: (battleId: string, action: string) => {
    // stub: mark battle as finished and push to history
    const battle = get().activeBattles.find(b => b.id === battleId)
    if (!battle) return
    const result = { winner: 'local-player', loot: battle.stakes?.amount || 0 }
    const finished = { ...battle, result }
    set(state => ({
      activeBattles: state.activeBattles.filter(b => b.id !== battleId),
      battleHistory: [finished, ...state.battleHistory]
    }))
  }
  ,

  createClan: (name: string, description: string, leaderId: string) => {
    const id = `${Date.now()}`
    const newClan = { id, name, tag: `[${name.slice(0,3).toUpperCase()}]`, leader: leaderId, members: 1, maxMembers: 50, description, trophies: 0, rank: 999 }
    // optimistic update
    set(state => ({ clans: [newClan, ...state.clans] }))
    try {
      realtime.emit('clan:create', newClan)
    } catch (e) {
      console.info('realtime emit failed', e)
    }
  },

  requestJoinClan: (clanId: string, playerId: string) => {
    // Emit an event to the realtime server including the player's username from gameStore
    const gameStore = useGameStore.getState()
    const username = gameStore.player?.id ? (gameStore.player?.id === playerId ? gameStore.player?.id : gameStore.player?.id) : 'Player'
    console.info(`Join requested: clan=${clanId} player=${playerId} username=${username}`)
    try {
      realtime.emit('clan:joinRequest', { clanId, playerId, username })
    } catch (e) {
      console.info('realtime emit failed', e)
    }
  },

  acceptJoinRequest: (requestId: string, clanId: string) => {
    try {
      realtime.emit('clan:acceptJoin', { requestId, clanId })
    } catch (e) {
      console.info('realtime emit failed', e)
    }
  },

  setClans: (clans: any[]) => {
    set(() => ({ clans }))
  }
  ,

  // client-side helper to start realtime syncing (call from a component)
  startRealtime: () => {
    // connect and subscribe to clan updates
    try {
      realtime.connect()
      realtime.on('clans:update', (payload: any) => {
        set(() => ({ clans: payload }))
      })
      realtime.on('clan:joinRequest', (payload: any) => {
        set(state => ({ joinRequests: [payload, ...state.joinRequests] }))
      })
      realtime.on('clan:joinAccepted', (payload: any) => {
        // remove the matching join request (if present)
        set(state => ({ joinRequests: state.joinRequests.filter((r: any) => !(r.clanId === payload.clanId && r.playerId === payload.playerId)) }))
      })
    } catch (e) {
      console.info('realtime start failed', e)
    }
  }
}))

export default useMultiplayerStore
