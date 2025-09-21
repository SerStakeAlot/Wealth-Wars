import { create } from 'zustand'

export interface PixelSettingsState {
  reducedMotion: boolean
  enableShortcuts: boolean
  showAdvanced: boolean
  setReducedMotion: (v: boolean) => void
  setEnableShortcuts: (v: boolean) => void
  setShowAdvanced: (v: boolean) => void
  hydrate: () => void
  hydrated: boolean
}

export const usePixelSettings = create<PixelSettingsState>((set, get) => ({
  reducedMotion: false,
  enableShortcuts: true,
  showAdvanced: false,
  hydrated: false,
  setReducedMotion: (v: boolean) => {
    set({ reducedMotion: v })
    try { localStorage.setItem('ww_ps_reducedMotion', v ? '1':'0') } catch {}
  },
  setEnableShortcuts: (v: boolean) => {
    set({ enableShortcuts: v })
    try { localStorage.setItem('ww_ps_enableShortcuts', v ? '1':'0') } catch {}
  },
  setShowAdvanced: (v: boolean) => {
    set({ showAdvanced: v })
    try { localStorage.setItem('ww_ps_showAdvanced', v ? '1':'0') } catch {}
  },
  hydrate: () => {
    if (get().hydrated) return
    try {
      const rm = localStorage.getItem('ww_ps_reducedMotion') === '1'
      const sc = localStorage.getItem('ww_ps_enableShortcuts') !== '0'
      const adv = localStorage.getItem('ww_ps_showAdvanced') === '1'
      set({ reducedMotion: rm, enableShortcuts: sc, showAdvanced: adv, hydrated: true })
    } catch { set({ hydrated: true }) }
  }
}))
