import { useLocalStorage } from '@/hooks'

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

// Custom hooks for global state management
export function useGlobalState() {
  const [isDark, setIsDark] = useLocalStorage('theme-dark', false)
  const [jwt, setJwt] = useLocalStorage('jwt', '')
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    fetched: false,
    error: null,
  })
  const [customOpenAISettings, setCustomOpenAISettings] =
    useLocalStorage<CustomOpenAISettings>('customOpenAISettingsStorage', {
      enable: false,
      baseUrl: '',
      apiKey: '',
      model: '',
    })

  const toggleDark = () => setIsDark(!isDark)

  return {
    isDark,
    toggleDark,
    jwt,
    setJwt,
    settings,
    setSettings,
    customOpenAISettings,
    setCustomOpenAISettings,
  }
}
