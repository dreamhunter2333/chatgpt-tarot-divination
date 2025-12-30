import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CustomOpenAISettings {
  enable: boolean
  baseUrl: string
  apiKey: string
  model: string
}

interface Settings {
  fetched: boolean
  error: string | null
  user_name?: string
  login_type?: string
  enable_login?: boolean
  enable_rate_limit?: boolean
  rate_limit?: string
  ad_client?: string
  ad_slot?: string
  default_api_base?: string
  default_model?: string
  purchase_url?: string
}

interface GlobalState {
  isDark: boolean
  jwt: string
  settings: Settings
  customOpenAISettings: CustomOpenAISettings
  toggleDark: () => void
  setJwt: (jwt: string) => void
  setSettings: (settings: Partial<Settings>) => void
  setCustomOpenAISettings: (settings: Partial<CustomOpenAISettings>) => void
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      isDark: false,
      jwt: '',
      settings: { fetched: false, error: null },
      customOpenAISettings: { enable: false, baseUrl: '', apiKey: '', model: '' },
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
      setJwt: (jwt) => set({ jwt }),
      setSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
      setCustomOpenAISettings: (settings) =>
        set((state) => ({
          customOpenAISettings: { ...state.customOpenAISettings, ...settings },
        })),
    }),
    { name: 'global-state' }
  )
)
