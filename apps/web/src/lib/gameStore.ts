import { create } from 'zustand'
import { useGame } from '@/app/lib/store'

// Simple player interface that matches GitHub Spark expectations
export interface Player {
  id: string
  level: number
  xp: number
  credits: number
  wealth: number
  walletAddress?: string
}

// Business interface for the UI
export interface Business {
  id: string
  name: string
  description: string
  icon: string
  baseProfit: number
  baseCost: number
  outlets: number
  condition: number
  hasManager: boolean
}

// Enhanced business interface
export interface EnhancedBusiness {
  id: string
  name: string
  description: string
  icon: string
  abilityName: string
  abilityDescription: string
  abilityType: 'passive' | 'active' | 'upgrade' | 'sustained'
  baseProfit: number
  baseCost: number
  outlets: number
  owned: number
  cooldown: number
  lastActivated: number
}

// Game store state for Spark UI
interface SparkGameState {
  // Player state
  player: Player
  
  // UI state
  showShareModal: boolean
  
  // Work system
  lastWorkTime: number
  workStreak: number
  rapidProcessingRemaining: number
  
  // Businesses
  businesses: Business[]
  enhancedBusinesses: EnhancedBusiness[]
  
  // Enhanced business states
  activeSustainedAbilityId: string | null
  activeEnhancedBusinesses: string[]
  abilityCharges: Record<string, number>
  consumedUpgrades: string[]
  
  // Actions
  initializePlayer: (walletAddress?: string) => void
  doWork: () => void
  buyBusinessOutlet: (businessId: string) => void
  hireManager: (businessId: string) => void
  collectBusiness: (businessId: string) => void
  buyEnhancedBusiness: (businessId: string) => void
  activateAbility: (businessId: string) => void
  toggleSynergy: (businessId: string) => void
  convertCreditsToWealth: () => void
  setShowShareModal: (show: boolean) => void
}

// Mock businesses data based on the existing game
const mockBusinesses: Business[] = [
  {
    id: 'lemonade_stand',
    name: 'Lemonade Stand',
    description: 'A classic neighborhood business',
    icon: '🥤',
    baseProfit: 5,
    baseCost: 10,
    outlets: 0,
    condition: 100,
    hasManager: false
  },
  {
    id: 'coffee_cafe',
    name: 'Coffee Cafe',
    description: 'Premium coffee experience',
    icon: '☕',
    baseProfit: 25,
    baseCost: 50,
    outlets: 0,
    condition: 100,
    hasManager: false
  },
  {
    id: 'widget_factory',
    name: 'Widget Factory',
    description: 'Manufacturing excellence',
    icon: '🏭',
    baseProfit: 100,
    baseCost: 200,
    outlets: 0,
    condition: 100,
    hasManager: false
  }
]

// Mock enhanced businesses
const mockEnhancedBusinesses: EnhancedBusiness[] = [
  {
    id: 'fast_food_chain',
    name: 'Fast Food Chain',
    description: 'Quick service restaurant empire',
    icon: '🍔',
    abilityName: 'Quick Service',
    abilityDescription: 'Reduces work cooldown by 30 minutes per outlet',
    abilityType: 'passive',
    baseProfit: 50,
    baseCost: 100,
    outlets: 0,
    owned: 0,
    cooldown: 3600000, // 1 hour
    lastActivated: 0
  },
  {
    id: 'tech_startup',
    name: 'Tech Startup',
    description: 'Innovation at scale',
    icon: '💻',
    abilityName: 'Rapid Processing',
    abilityDescription: 'Next 5 work actions have 50% reduced cooldown',
    abilityType: 'active',
    baseProfit: 200,
    baseCost: 500,
    outlets: 0,
    owned: 0,
    cooldown: 7200000, // 2 hours
    lastActivated: 0
  }
]

// Create the Spark-compatible game store
export const useGameStore = create<SparkGameState>((set, get) => ({
  // Player state
  player: {
    id: 'demo-player',
    level: 1,
    xp: 0,
    credits: 25,
    wealth: 0,
    walletAddress: undefined
  },
  
  // UI state
  showShareModal: false,
  
  // Work system
  lastWorkTime: Date.now() - 7200000, // 2 hours ago so player can work immediately
  workStreak: 0,
  rapidProcessingRemaining: 0,
  
  // Businesses
  businesses: mockBusinesses,
  enhancedBusinesses: mockEnhancedBusinesses,
  
  // Enhanced business states
  activeSustainedAbilityId: null,
  activeEnhancedBusinesses: [],
  abilityCharges: {},
  consumedUpgrades: [],
  
  // Actions
  initializePlayer: (walletAddress?: string) => {
    set(state => ({
      player: {
        ...state.player,
        id: walletAddress ? `player-${walletAddress.slice(0, 8)}` : 'demo-player',
        walletAddress
      }
    }))
  },
  
  doWork: () => {
    const now = Date.now()
    const timeSinceLastWork = now - get().lastWorkTime
    const cooldown = get().rapidProcessingRemaining > 0 ? 3600000 : 7200000 // 1 hour if rapid, 2 hours normal
    
    if (timeSinceLastWork < cooldown) {
      return // Still on cooldown
    }
    
    set(state => {
      const bonusCredits = state.activeEnhancedBusinesses.length * 5 // Synergy bonus
      const totalCredits = 20 + bonusCredits
      
      return {
        player: {
          ...state.player,
          credits: state.player.credits + totalCredits,
          xp: state.player.xp + 10
        },
        lastWorkTime: now,
        workStreak: state.workStreak + 1,
        rapidProcessingRemaining: Math.max(0, state.rapidProcessingRemaining - 1),
        showShareModal: Math.random() > 0.7 // 30% chance to show share modal
      }
    })
  },
  
  buyBusinessOutlet: (businessId: string) => {
    const state = get()
    const businessIndex = state.businesses.findIndex(b => b.id === businessId)
    const enhancedBusinessIndex = state.enhancedBusinesses.findIndex(b => b.id === businessId)
    
    if (businessIndex >= 0) {
      const business = state.businesses[businessIndex]
      const cost = Math.floor(business.baseCost * Math.pow(1.15, business.outlets))
      
      if (state.player.credits >= cost) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - cost
          },
          businesses: state.businesses.map((b, i) => 
            i === businessIndex ? { ...b, outlets: b.outlets + 1 } : b
          )
        }))
      }
    } else if (enhancedBusinessIndex >= 0) {
      const business = state.enhancedBusinesses[enhancedBusinessIndex]
      const cost = Math.floor(business.baseCost * Math.pow(1.15, business.outlets))
      
      if (state.player.credits >= cost) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - cost
          },
          enhancedBusinesses: state.enhancedBusinesses.map((b, i) => 
            i === enhancedBusinessIndex ? { ...b, outlets: b.outlets + 1, owned: b.owned + 1 } : b
          )
        }))
      }
    }
  },
  
  hireManager: (businessId: string) => {
    const state = get()
    const businessIndex = state.businesses.findIndex(b => b.id === businessId)
    
    if (businessIndex >= 0) {
      const business = state.businesses[businessIndex]
      const cost = business.baseCost * 5
      
      if (state.player.credits >= cost && !business.hasManager) {
        set(state => ({
          player: {
            ...state.player,
            credits: state.player.credits - cost
          },
          businesses: state.businesses.map((b, i) => 
            i === businessIndex ? { ...b, hasManager: true } : b
          )
        }))
      }
    }
  },
  
  collectBusiness: (businessId: string) => {
    // Simple collection logic - businesses generate profit over time
    const state = get()
    const business = state.businesses.find(b => b.id === businessId)
    const enhancedBusiness = state.enhancedBusinesses.find(b => b.id === businessId)
    
    if (business && business.outlets > 0) {
      const profit = business.baseProfit * business.outlets * (business.condition / 100)
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits + Math.floor(profit)
        }
      }))
    } else if (enhancedBusiness && enhancedBusiness.outlets > 0) {
      const profit = enhancedBusiness.baseProfit * enhancedBusiness.outlets
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits + Math.floor(profit)
        }
      }))
    }
  },
  
  buyEnhancedBusiness: (businessId: string) => {
    // Same as buyBusinessOutlet for enhanced businesses
    get().buyBusinessOutlet(businessId)
  },
  
  activateAbility: (businessId: string) => {
    const state = get()
    const business = state.enhancedBusinesses.find(b => b.id === businessId)
    
    if (!business || business.owned === 0) return
    
    const now = Date.now()
    const timeSinceActivation = now - business.lastActivated
    
    if (timeSinceActivation < business.cooldown) return // Still on cooldown
    
    // Activate ability based on type
    if (business.abilityType === 'active') {
      if (business.id === 'tech_startup') {
        set(state => ({
          rapidProcessingRemaining: 5,
          enhancedBusinesses: state.enhancedBusinesses.map(b =>
            b.id === businessId ? { ...b, lastActivated: now } : b
          )
        }))
      }
    } else if (business.abilityType === 'sustained') {
      set(state => ({
        activeSustainedAbilityId: businessId,
        enhancedBusinesses: state.enhancedBusinesses.map(b =>
          b.id === businessId ? { ...b, lastActivated: now } : b
        )
      }))
    }
  },
  
  toggleSynergy: (businessId: string) => {
    set(state => {
      const isActive = state.activeEnhancedBusinesses.includes(businessId)
      const business = state.enhancedBusinesses.find(b => b.id === businessId)
      
      if (!business || business.owned === 0) return state
      
      if (isActive) {
        return {
          activeEnhancedBusinesses: state.activeEnhancedBusinesses.filter(id => id !== businessId)
        }
      } else if (state.activeEnhancedBusinesses.length < 3) { // Max 3 active synergies
        return {
          activeEnhancedBusinesses: [...state.activeEnhancedBusinesses, businessId]
        }
      }
      
      return state
    })
  },
  
  convertCreditsToWealth: () => {
    const state = get()
    const creditsToConvert = Math.floor(state.player.credits / 100) * 100
    const wealthGained = Math.floor(creditsToConvert / 100)
    
    if (creditsToConvert > 0) {
      set(state => ({
        player: {
          ...state.player,
          credits: state.player.credits - creditsToConvert,
          wealth: state.player.wealth + wealthGained
        }
      }))
    }
  },
  
  setShowShareModal: (show: boolean) => {
    set({ showShareModal: show })
  }
}))