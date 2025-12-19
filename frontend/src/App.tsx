import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toaster } from '@/components/ui/sonner'
import { useGlobalState } from '@/store'
import { useIsMobile } from '@/hooks'
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
import { Github, Moon, Sun, Settings, Home, LogOut, LogIn, Sparkles } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const {
    isDark,
    toggleDark,
    jwt,
    setJwt,
    settings,
    setSettings,
  } = useGlobalState()

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

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

  useEffect(() => {
    if (!isMobile && settings.ad_client) {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  }, [isMobile, settings.ad_client])

  const logOut = () => {
    setJwt('')
    window.location.reload()
  }

  const showAd = !isMobile && settings.ad_client

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {showAd && (
            <div className="hidden md:block md:col-span-1">
              <div className="sticky top-4 h-screen">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={settings.ad_client}
                  data-ad-slot={settings.ad_slot}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            </div>
          )}

          <div className={showAd ? 'md:col-span-4' : 'md:col-span-6'}>
            <div className="py-3 md:py-6">
              {/* 现代化头部 */}
              <div className="backdrop-blur-lg bg-card/50 rounded-2xl shadow-lg border p-3 md:p-6 mb-4 md:mb-6 transition-all hover:shadow-xl">
                {isMobile ? (
                  // 移动端布局 - 单行显示
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* 左侧标题 */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
                        </div>
                        <h1 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          AI 占卜
                        </h1>
                      </div>

                      {/* 右侧按钮组 */}
                      <div className="flex items-center gap-1">
                        <Button onClick={() => navigate('/')} variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Home className="h-3.5 w-3.5" />
                        </Button>
                        {settings.enable_login && (
                          <>
                            {settings.user_name ? (
                              <Button onClick={logOut} variant="outline" size="sm" className="h-7 px-2 gap-1">
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="text-xs">登出</span>
                              </Button>
                            ) : (
                              <Button onClick={() => navigate('/login')} size="sm" className="h-7 px-2 gap-1">
                                <LogIn className="h-3.5 w-3.5" />
                                <span className="text-xs">登录</span>
                              </Button>
                            )}
                          </>
                        )}
                        <Button onClick={() => navigate('/settings')} variant="outline" size="sm" className="h-7 w-7 p-0">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button onClick={toggleDark} variant="outline" size="sm" className="h-7 w-7 p-0">
                          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-7 w-7 p-0"
                        >
                          <a
                            href="https://github.com/dreamhunter2333/chatgpt-tarot-divination"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 桌面端布局
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          AI 占卜
                        </h1>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        探索未知，洞察未来 · 本项目仅供娱乐
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-2">
                        <Home className="h-4 w-4" />
                        主页
                      </Button>
                      {settings.enable_login && (
                        <>
                          {settings.user_name ? (
                            <Button onClick={logOut} variant="outline" size="sm" className="gap-2">
                              <LogOut className="h-4 w-4" />
                              登出
                            </Button>
                          ) : (
                            <Button onClick={() => navigate('/login')} size="sm" className="gap-2">
                              <LogIn className="h-4 w-4" />
                              登录
                            </Button>
                          )}
                        </>
                      )}
                      <Button onClick={() => navigate('/settings')} variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        设置
                      </Button>
                      <Button onClick={toggleDark} variant="outline" size="sm" className="gap-2">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {isDark ? '亮色' : '暗色'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href="https://github.com/dreamhunter2333/chatgpt-tarot-divination"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          Star
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* 用户信息和限流提示 */}
                {settings.fetched && (
                  <>
                    {settings.user_name ? (
                      <Alert variant="success" className="mt-2 md:mt-3 border-green-500/20 bg-green-500/5 shadow-sm animate-in fade-in duration-300 py-2">
                        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            你好, {settings.login_type} 用户 <span className="font-semibold">{settings.user_name}</span>, 可在设置中自定义 API KEY 使用自定义模型
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/settings')}
                            className="shrink-0 gap-1 h-7"
                          >
                            <Settings className="h-3 w-3" />
                            设置
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : settings.enable_rate_limit ? (
                      <Alert className="mt-2 md:mt-3 border-yellow-500/20 bg-yellow-500/10 shadow-sm animate-in fade-in duration-300 py-2">
                        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            当前未登录，处于限流模式 ({settings.rate_limit})，可在设置中自定义 API KEY 以解除限流
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/settings')}
                            className="shrink-0 gap-1 h-7"
                          >
                            <Settings className="h-3 w-3" />
                            设置
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </>
                )}
              </div>

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
                <Alert variant="destructive">
                  <AlertDescription>{settings.error}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </div>

          {showAd && (
            <div className="hidden md:block md:col-span-1">
              <div className="sticky top-4 h-screen">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={settings.ad_client}
                  data-ad-slot={settings.ad_slot}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App
