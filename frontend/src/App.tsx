import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useGlobalState } from '@/store'
import MarketPage from '@/pages/Market'
import AboutPage from '@/pages/About'
import SettingsPage from '@/pages/Settings'
import LoginPage from '@/pages/Login'
import HistoryPage from '@/pages/History'
import TarotPage from '@/pages/divination/TarotPage'
import BirthdayPage from '@/pages/divination/BirthdayPage'
import NewNamePage from '@/pages/divination/NewNamePage'
import NamePage from '@/pages/divination/NamePage'
import DreamPage from '@/pages/divination/DreamPage'
import PlumFlowerPage from '@/pages/divination/PlumFlowerPage'
import FatePage from '@/pages/divination/FatePage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const {
    jwt,
    setSettings,
    settings
  } = useGlobalState()

  const [loading, setLoading] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/settings`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt || 'xxx'}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...data, fetched: true, error: null })
      } else {
        setSettings({
          fetched: true,
          error: `Failed to fetch settings: ${response.status} ${response.statusText}`,
        })
      }
    } catch (error: any) {
      console.error(error)
      setSettings({
        fetched: true,
        error: `Failed to fetch settings: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              星辰指引中...
            </p>
          </div>
        </div>
      )}

      <MainLayout>
        {settings.fetched && !settings.error ? (
          <Routes>
            <Route path="/" element={<MarketPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/divination/tarot" element={<TarotPage />} />
            <Route path="/divination/birthday" element={<BirthdayPage />} />
            <Route path="/divination/new_name" element={<NewNamePage />} />
            <Route path="/divination/name" element={<NamePage />} />
            <Route path="/divination/dream" element={<DreamPage />} />
            <Route path="/divination/plum_flower" element={<PlumFlowerPage />} />
            <Route path="/divination/fate" element={<FatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/:login_type" element={<LoginPage />} />
            <Route path="/history/:type" element={<HistoryPage />} />
          </Routes>
        ) : settings.error ? (
          <Alert variant="destructive" className="glass">
            <AlertDescription>{settings.error}</AlertDescription>
          </Alert>
        ) : null}
      </MainLayout>
      <Toaster />
    </>
  )
}

export default App
