import { create } from 'zustand'
// useKV from @github/spark/hooks is optional in some environments (Codespaces/devcontainer).
// Provide a safe localStorage fallback for persistence to avoid build errors when the
// external Spark hooks package isn't available.

// Multiplayer types
export interface MultiplayerPlayer {
  id: string
  username: string
  level: number
  wealth: number
  credits: number
  walletAddress: string
  isOnline: boolean
  lastSeen: number
  battlePower: number
  reputation: number
  clanId?: string
  avatar?: string
  achievements: string[]
}

export interface Clan {
  id: string
  name: string
  description: string
  leaderId: string
  members: string[]
  totalWealth: number
  level: number
  createdAt: number
  isRecruiting: boolean
  requirements: {
    minLevel: number
    minWealth: number
  }
  perks: {
    wealthBonus: number
    battleBonus: number
    tradingFeeReduction: number
  }
}

export interface TradeOffer {
  id: string
  sellerId: string
  buyerId?: string
  type: 'credits' | 'wealth' | 'business_outlet' | 'special_item'
  item: {
    id: string
    name: string
    quantity: number
    description?: string
  }
  price: number
  priceType: 'credits' | 'wealth'
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
  createdAt: number
  expiresAt: number
  escrowLocked: boolean
}

export interface BattleSession {
  id: string
  attacker: string
  defender: string
  attackType: 'standard' | 'wealth_assault' | 'land_siege' | 'business_sabotage' | 'clan_war'
  status: 'initiating' | 'active' | 'completed'
  startTime: number
  duration: number
  stakes: {
    type: 'credits' | 'wealth' | 'business_damage'
    amount: number
  }
  result?: {
    winner: string
    damage: number
    loot: number
    reputation: number
    wealthDeltaAttacker?: number
  }
}

export interface Notification {
  id: string
  type: 'battle_request' | 'battle_result' | 'trade_offer' | 'clan_invite' | 'achievement' | 'system'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: number
}

export interface WorldEvent {
  id: string
  type: 'market_crash' | 'gold_rush' | 'battle_tournament' | 'clan_war'
  title: string
  description: string
  startTime: number
  endTime: number
  effects: {
    type: string
    multiplier: number
    target: string
  }[]
  active: boolean
}

export interface MultiplayerState {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  presenceMode: 'live' | 'fallback' | 'disconnected'
  myPresenceId?: string
  onlinePlayers: MultiplayerPlayer[]
  playerSearch: string
  friends: string[]
  blockedPlayers: string[]
  availableClans: Clan[]
  clanInvites: string[]
  activeTradeOffers: TradeOffer[]
  myTradeOffers: TradeOffer[]
  tradeHistory: TradeOffer[]
  marketFilters: {
    type: string
    priceRange: [number, number]
    sortBy: 'price' | 'newest' | 'ending_soon'
  }
  activeBattles: BattleSession[]
  battleInvites: BattleSession[]
  battleHistory: BattleSession[]
  notifications: Notification[]
  unreadCount: number
  activeWorldEvents: WorldEvent[]
  wealthLeaderboard: MultiplayerPlayer[]
  battleLeaderboard: MultiplayerPlayer[]
  clanLeaderboard: Clan[]
  selectedPlayer?: MultiplayerPlayer
  showTradeModal: boolean
  showBattleModal: boolean
  showClanModal: boolean
  activeTab: string
  connectToMultiplayer: () => Promise<void>
  disconnect: () => void
  sendMessage: (type: string, data: any) => void
  searchPlayers: (query: string) => Promise<MultiplayerPlayer[]>
  sendFriendRequest: (playerId: string) => void
  blockPlayer: (playerId: string) => void
  createTradeOffer: (offer: Omit<TradeOffer, 'id' | 'sellerId' | 'createdAt' | 'status'>) => void
  acceptTradeOffer: (offerId: string) => void
  cancelTradeOffer: (offerId: string) => void
  searchTradeOffers: (filters: any) => Promise<TradeOffer[]>
  challengePlayer: (playerId: string, battleType: string, stakes: any) => void
  acceptBattleChallenge: (battleId: string) => void
  declineBattleChallenge: (battleId: string) => void
  executeBattleAction: (battleId: string, action: string) => void
  createClan: (clanData: Omit<Clan, 'id' | 'createdAt' | 'totalWealth' | 'level'>) => void
  joinClan: (clanId: string) => void
  leaveClan: () => void
  invitePlayerToClan: (playerId: string) => void
  kickClanMember: (playerId: string) => void
  markNotificationRead: (notificationId: string) => void
  clearAllNotifications: () => void
  setSelectedPlayer: (player?: MultiplayerPlayer) => void
  setShowTradeModal: (show: boolean) => void
  setShowBattleModal: (show: boolean) => void
  setShowClanModal: (show: boolean) => void
  setActiveTab: (tab: string) => void
  // Presence helpers
  setPresenceUsername: (name: string) => void
}

// Mock WebSocket connection for demonstration and fallback
class MockWebSocket {
  private callbacks: Map<string, Function[]> = new Map()
  private connected = false

  connect() {
    this.connected = true
    this.emit('connected', {})

    // Simulate some initial data
    setTimeout(() => {
      this.emit('players_online', mockOnlinePlayers)
      this.emit('trade_offers', mockTradeOffers)
      this.emit('clan_data', mockClans)
    }, 1000)
  }

  disconnect() {
    this.connected = false
    this.emit('disconnected', {})
  }

  send(type: string, data: any) {
    if (!this.connected) return

    // Simulate server responses
    setTimeout(() => {
      switch (type) {
        case 'challenge_player':
          this.emit('battle_invite', {
            id: `battle_${Date.now()}`,
            attacker: 'current_player',
            defender: data.playerId,
            attackType: data.battleType,
            status: 'initiating',
            startTime: Date.now(),
            duration: 120000, // default 2 minutes
            stakes: data.stakes
          })
          break
        case 'create_trade':
          this.emit('trade_created', {
            id: `trade_${Date.now()}`,
            ...data,
            status: 'active',
            createdAt: Date.now()
          })
          break
        case 'join_clan':
          this.emit('clan_joined', { clanId: data.clanId })
          break
      }
    }, 500)
  }

  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
}

// Mock data
const mockOnlinePlayers: MultiplayerPlayer[] = [
  {
    id: 'player_1',
    username: 'CryptoKing',
    level: 15,
    wealth: 50000,
    credits: 12000,
    walletAddress: 'Sol1234...abcd',
    isOnline: true,
    lastSeen: Date.now(),
    battlePower: 1500,
    reputation: 850,
    achievements: ['first_million', 'battle_veteran'],
    avatar: '👑'
  },
  {
    id: 'player_2',
    username: 'TradeMaster',
    level: 12,
    wealth: 35000,
    credits: 8500,
    walletAddress: 'Sol5678...efgh',
    isOnline: true,
    lastSeen: Date.now() - 300000,
    battlePower: 1200,
    reputation: 720,
    achievements: ['trading_expert'],
    avatar: '📈'
  },
  {
    id: 'player_3',
    username: 'BusinessMogul',
    level: 20,
    wealth: 100000,
    credits: 25000,
    walletAddress: 'Sol9876...ijkl',
    isOnline: false,
    lastSeen: Date.now() - 1800000,
    battlePower: 2000,
    reputation: 950,
    achievements: ['empire_builder', 'clan_leader'],
    avatar: '🏢'
  }
]

const mockTradeOffers: TradeOffer[] = [
  {
    id: 'trade_1',
    sellerId: 'player_1',
    type: 'credits',
    item: {
      id: 'credits_pack',
      name: 'Credit Pack',
      quantity: 1000,
      description: '1000 Premium Credits'
    },
    price: 500,
    priceType: 'wealth',
    status: 'active',
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() + 86400000,
    escrowLocked: false
  },
  {
    id: 'trade_2',
    sellerId: 'player_2',
    type: 'business_outlet',
    item: {
      id: 'farm_outlet',
      name: 'Organic Farm Outlet',
      quantity: 5,
      description: '5 Premium Farm Outlets'
    },
    price: 2500,
    priceType: 'credits',
    status: 'active',
    createdAt: Date.now() - 7200000,
    expiresAt: Date.now() + 172800000,
    escrowLocked: false
  }
]

const mockClans: Clan[] = [
  {
    id: 'clan_1',
    name: 'Solar Empire',
    description: 'Elite traders and builders united under the Solana sun',
    leaderId: 'player_3',
    members: ['player_3', 'player_4', 'player_5'],
    totalWealth: 250000,
    level: 8,
    createdAt: Date.now() - 2592000000,
    isRecruiting: true,
    requirements: {
      minLevel: 10,
      minWealth: 15000
    },
    perks: {
      wealthBonus: 0.15,
      battleBonus: 0.10,
      tradingFeeReduction: 0.25
    }
  },
  {
    id: 'clan_2',
    name: 'Crypto Crusaders',
    description: 'Warriors of the blockchain, masters of battle',
    leaderId: 'player_6',
    members: ['player_6', 'player_7'],
    totalWealth: 180000,
    level: 6,
    createdAt: Date.now() - 1296000000,
    isRecruiting: true,
    requirements: {
      minLevel: 8,
      minWealth: 10000
    },
    perks: {
      wealthBonus: 0.10,
      battleBonus: 0.20,
      tradingFeeReduction: 0.15
    }
  }
]

const mockWebSocket = new MockWebSocket()

// Real WebSocket presence client (optional)
class PresenceClient {
  private ws: WebSocket | null = null
  private url: string
  private callbacks: Map<string, Function[]> = new Map()
  private heartbeatTimer: any = null
  private id: string
  private username: string
  private connected = false

  constructor(url: string, id: string, username: string) {
    this.url = url
    this.id = id
    this.username = username
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)
    } catch (e) {
      // Browser will provide WebSocket global; SSR should skip
      return
    }
    this.ws.onopen = () => {
      this.connected = true
      this.emit('connected', {})
      this.send({ type: 'hello', payload: { id: this.id, username: this.username } })
      // Heartbeat every 10s (server tolerates up to 45s by default)
      this.heartbeatTimer = setInterval(() => {
        this.send({ type: 'heartbeat', payload: { username: this.username } })
      }, 10000)
    }
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as any)
        const { type, payload } = msg
        this.emit(type, payload)
      } catch {}
    }
    this.ws.onclose = () => {
      this.connected = false
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
      this.emit('disconnected', {})
    }
    this.ws.onerror = () => {
      // Let caller decide to fallback
    }
  }

  disconnect() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    if (this.ws) try { this.ws.close() } catch {}
  }

  setUsername(name: string) {
    this.username = name
    this.send({ type: 'set:username', payload: { username: name } })
  }

  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) this.callbacks.set(event, [])
    this.callbacks.get(event)!.push(callback)
  }

  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) callbacks.forEach(cb => cb(data))
  }

  private send(obj: any) {
    try { (this.ws as any)?.send(JSON.stringify(obj)) } catch {}
  }
}
// Guard to ensure we only register websocket listeners once. In dev/StrictMode
// effects can run twice causing duplicate listener registration which resulted
// in multiple (e.g. 4x) identical battle_invite entries per single challenge.
let wsListenersRegistered = false
let presenceClient: PresenceClient | null = null

// Create the multiplayer store
export const useMultiplayerStore = create<MultiplayerState>()((set, get) => ({
  // Initial state
  isConnected: false,
  connectionStatus: 'disconnected',
  presenceMode: 'disconnected',
  myPresenceId: undefined,
  
  onlinePlayers: [],
  playerSearch: '',
  friends: [],
  blockedPlayers: [],
  
  availableClans: [],
  clanInvites: [],
  
  activeTradeOffers: [],
  myTradeOffers: [],
  tradeHistory: [],
  marketFilters: {
    type: 'all',
    priceRange: [0, 999999],
    sortBy: 'newest'
  },
  
  activeBattles: [],
  battleInvites: [],
  battleHistory: [],
  
  notifications: [],
  unreadCount: 0,
  
  activeWorldEvents: [],
  
  wealthLeaderboard: [],
  battleLeaderboard: [],
  clanLeaderboard: [],
  
  showTradeModal: false,
  showBattleModal: false,
  showClanModal: false,
  activeTab: 'players',
  
  // Connection actions
  connectToMultiplayer: async () => {
    // If we're already connected just exit early.
    if (get().isConnected) return
    set({ connectionStatus: 'connecting' })

    if (!wsListenersRegistered) {
      // Set up WebSocket event listeners (only once)
      const handleConnected = () => {
        set({ isConnected: true, connectionStatus: 'connected' })
      }
      const handlePresenceUpdate = (players: any[]) => {
        // Map presence payload into MultiplayerPlayer shell objects
        const mapped: MultiplayerPlayer[] = players.map(p => ({
          id: p.id,
          username: p.username || `Guest_${String(p.id).slice(-4)}`,
          level: 1,
          wealth: 0,
          credits: 0,
          walletAddress: '',
          isOnline: true,
          lastSeen: p.lastSeen || Date.now(),
          battlePower: 0,
          reputation: 0,
          achievements: [],
          avatar: '👤'
        }))
        set({ onlinePlayers: mapped })
      }

      mockWebSocket.on('connected', handleConnected)
      mockWebSocket.on('players_online', (players: MultiplayerPlayer[]) => set({ onlinePlayers: players }))
      // Presence client events
      // @ts-ignore - runtime registration only if presenceClient is used
      const registerPresence = () => {
        if (!presenceClient) return
        presenceClient.on('connected', handleConnected)
        presenceClient.on('presence:update', handlePresenceUpdate)
      }
      registerPresence()

      mockWebSocket.on('trade_offers', (offers: TradeOffer[]) => {
        set({ activeTradeOffers: offers })
      })
      
      mockWebSocket.on('clan_data', (clans: Clan[]) => {
        set({ availableClans: clans })
      })
      
      mockWebSocket.on('battle_invite', (battle: BattleSession) => {
        set(state => {
          // Dedupe: skip if invite with same id already exists
          if (state.battleInvites.some(b => b.id === battle.id)) return state
          return {
            battleInvites: [...state.battleInvites, battle],
            notifications: [...state.notifications, {
              id: `notif_${Date.now()}`,
              type: 'battle_request',
              title: 'Battle Challenge!',
              message: `${battle.attacker} challenges you to battle!`,
              data: battle,
              read: false,
              createdAt: Date.now()
            }],
            unreadCount: state.unreadCount + 1
          }
        })
      })
      
      mockWebSocket.on('trade_created', (trade: TradeOffer) => {
        set(state => ({
          myTradeOffers: [...state.myTradeOffers, trade]
        }))
      })
      wsListenersRegistered = true
    }

    // Connect: try presence server first (browser only), else fallback to mock
    try {
      if (typeof window !== 'undefined') {
        // Create a guest id/username
        const stored = window.localStorage.getItem('ww-guest')
        let guest = stored ? JSON.parse(stored) : null
        if (!guest) {
          guest = { id: `guest_${Math.random().toString(36).slice(2,10)}`, username: '' }
          window.localStorage.setItem('ww-guest', JSON.stringify(guest))
        }
        set({ myPresenceId: guest.id })
        // Only connect if cloud endpoint provided
        const url = (process.env.NEXT_PUBLIC_PRESENCE_WS_URL || '').trim()
        if (url) {
          presenceClient = new PresenceClient(url, guest.id, guest.username || guest.id.replace('guest_', 'Guest_'))
          presenceClient.connect()
          // Re-register presence listeners in case they were not attached yet
          presenceClient.on('connected', () => set({ isConnected: true, connectionStatus: 'connected', presenceMode: 'live' }))
          presenceClient.on('presence:update', (list: any[]) => {
            const mapped: MultiplayerPlayer[] = list.map((p: any) => ({
              id: p.id,
              username: p.username || `Guest_${String(p.id).slice(-4)}`,
              level: 1,
              wealth: 0,
              credits: 0,
              walletAddress: '',
              isOnline: true,
              lastSeen: p.lastSeen || Date.now(),
              battlePower: 0,
              reputation: 0,
              achievements: [],
              avatar: '👤'
            }))
            set({ onlinePlayers: mapped })
          })
          presenceClient.on('disconnected', () => set({ isConnected: false, connectionStatus: 'disconnected', presenceMode: 'disconnected' }))
          return
        }
      }
    } catch {}

    // Fallback to mock
    set({ presenceMode: 'fallback' })
    mockWebSocket.connect()
  },
  
  disconnect: () => {
    mockWebSocket.disconnect()
    try { presenceClient?.disconnect() } catch {}
    set({ 
      isConnected: false, 
      connectionStatus: 'disconnected',
      presenceMode: 'disconnected',
      myPresenceId: undefined,
      onlinePlayers: [],
      activeTradeOffers: [],
      activeBattles: []
    })
  },
  
  sendMessage: (type: string, data: any) => {
    mockWebSocket.send(type, data)
  },
  
  // Player interaction actions
  searchPlayers: async (query: string) => {
    set({ playerSearch: query })
    const filtered = mockOnlinePlayers.filter(p => 
      p.username.toLowerCase().includes(query.toLowerCase()) ||
      p.walletAddress.toLowerCase().includes(query.toLowerCase())
    )
    return filtered
  },
  
  sendFriendRequest: (playerId: string) => {
    mockWebSocket.send('friend_request', { playerId })
  },
  
  blockPlayer: (playerId: string) => {
    set(state => ({
      blockedPlayers: [...state.blockedPlayers, playerId],
      onlinePlayers: state.onlinePlayers.filter(p => p.id !== playerId)
    }))
  },
  
  // Trading actions
  createTradeOffer: (offer) => {
    const fullOffer: TradeOffer = {
      ...offer,
      id: `trade_${Date.now()}`,
      sellerId: 'current_player',
      createdAt: Date.now(),
      status: 'active',
      escrowLocked: false
    }
    
    mockWebSocket.send('create_trade', fullOffer)
  },
  
  acceptTradeOffer: (offerId: string) => {
    mockWebSocket.send('accept_trade', { offerId })
    
    set(state => ({
      activeTradeOffers: state.activeTradeOffers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'pending' as const } : offer
      )
    }))
  },
  
  cancelTradeOffer: (offerId: string) => {
    mockWebSocket.send('cancel_trade', { offerId })
    
    set(state => ({
      myTradeOffers: state.myTradeOffers.filter(offer => offer.id !== offerId)
    }))
  },
  
  searchTradeOffers: async (filters: any) => {
    set({ marketFilters: { ...get().marketFilters, ...filters } })
    return mockTradeOffers.filter(offer => {
      if (filters.type && filters.type !== 'all' && offer.type !== filters.type) {
        return false
      }
      if (offer.price < filters.priceRange[0] || offer.price > filters.priceRange[1]) {
        return false
      }
      return true
    })
  },
  
  // Battle actions
  challengePlayer: (playerId: string, battleType: string, stakes: any) => {
    mockWebSocket.send('challenge_player', { playerId, battleType, stakes })
    
    set(state => ({
      notifications: [...state.notifications, {
        id: `notif_${Date.now()}`,
        type: 'system',
        title: 'Battle Challenge Sent',
        message: `Challenge sent to player!`,
        read: false,
        createdAt: Date.now()
      }],
      unreadCount: state.unreadCount + 1
    }))
  },
  
  acceptBattleChallenge: (battleId: string) => {
    mockWebSocket.send('accept_battle', { battleId })
    
    set(state => ({
      battleInvites: state.battleInvites.filter(b => b.id !== battleId),
      activeBattles: [...state.activeBattles, (() => {
        const found = state.battleInvites.find(b => b.id === battleId)!
        return {
          ...found,
          duration: found.duration || 120000,
          status: 'active'
        }
      })()]
    }))
  },
  
  declineBattleChallenge: (battleId: string) => {
    mockWebSocket.send('decline_battle', { battleId })
    
    set(state => ({
      battleInvites: state.battleInvites.filter(b => b.id !== battleId)
    }))
  },
  
  executeBattleAction: (battleId: string, action: string) => {
    mockWebSocket.send('battle_action', { battleId, action })
  },
  
  // Clan actions
  createClan: (clanData) => {
    const fullClan: Clan = {
      ...clanData,
      id: `clan_${Date.now()}`,
      createdAt: Date.now(),
      totalWealth: 0,
      level: 1
    }
    
    mockWebSocket.send('create_clan', fullClan)
  },
  
  joinClan: (clanId: string) => {
    mockWebSocket.send('join_clan', { clanId })
  },
  
  leaveClan: () => {
    mockWebSocket.send('leave_clan', {})
  },
  
  invitePlayerToClan: (playerId: string) => {
    mockWebSocket.send('clan_invite', { playerId })
  },
  
  kickClanMember: (playerId: string) => {
    mockWebSocket.send('kick_member', { playerId })
  },
  
  // Notification actions
  markNotificationRead: (notificationId: string) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }))
  },
  
  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
  
  // UI actions
  setSelectedPlayer: (player) => {
    set({ selectedPlayer: player })
  },
  
  setShowTradeModal: (show) => {
    set({ showTradeModal: show })
  },
  
  setShowBattleModal: (show) => {
    set({ showBattleModal: show })
  },
  
  setShowClanModal: (show) => {
    set({ showClanModal: show })
  },
  
  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },
  
  // Presence helpers
  setPresenceUsername: (name: string) => {
    try { presenceClient?.setUsername(name) } catch {}
    // Persist to guest record for future sessions
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ww-guest')
        const guest = raw ? JSON.parse(raw) : { id: 'guest_local' }
        localStorage.setItem('ww-guest', JSON.stringify({ ...guest, username: name }))
      } catch {}
    }
    // Optimistically update our entry in onlinePlayers when live
    const { myPresenceId, presenceMode } = get()
    if (presenceMode === 'live' && myPresenceId) {
      set(state => ({
        onlinePlayers: state.onlinePlayers.map(p => p.id === myPresenceId ? { ...p, username: name } : p)
      }))
    }
  }
}))

// Hook for persisted multiplayer data
export const usePersistedMultiplayerState = () => {
  const key = 'wealth-wars-multiplayer'

  const load = (): Partial<MultiplayerState> | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const save = (state: Partial<MultiplayerState>) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }

  return {
    multiplayerData: load(),
    saveMultiplayerState: save,
    loadMultiplayerState: load
  }
}
