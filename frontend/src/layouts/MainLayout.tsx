import { ReactNode, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, LogIn, LogOut, Moon, Settings, Sparkles, Sun, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGlobalState } from '@/store'
import { Toaster } from '@/components/ui/sonner'
import { useIsMobile } from '@/hooks'

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    const { isDark, toggleDark, settings, setJwt } = useGlobalState()

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    const showAd = !isMobile && settings.ad_client && settings.ad_slot

    useEffect(() => {
        if (showAd && settings.fetched) {
            try {
                // @ts-ignore
                ; (window.adsbygoogle = window.adsbygoogle || []).push({})
                    // @ts-ignore
                    ; (window.adsbygoogle = window.adsbygoogle || []).push({})
            } catch (e) {
                console.error('AdSense error:', e)
            }
        }
    }, [showAd, settings.fetched])

    const logOut = () => {
        setJwt('')
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 text-foreground overflow-x-hidden selection:bg-primary/30">
            {/* Mystical Background Decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] animate-pulse delay-1000" />
            </div>

            <div className="w-full px-4 md:px-8 py-4 md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

                    {/* Left Ad Column */}
                    {showAd && (
                        <div className="hidden md:block md:col-span-1">
                            <ins
                                className="adsbygoogle sticky top-4"
                                style={{ display: 'block', minHeight: '600px' }}
                                data-ad-client={settings.ad_client}
                                data-ad-slot={settings.ad_slot}
                                data-ad-format="auto"
                                data-full-width-responsive="true"
                            ></ins>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className={`flex flex-col min-h-[calc(100vh-3rem)] ${showAd ? 'md:col-span-4' : 'md:col-span-6 md:px-12 lg:px-24'}`}>

                        {/* Header / Navigation */}
                        <motion.header
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="backdrop-blur-md bg-card/40 border border-white/10 rounded-2xl shadow-lg p-4 mb-6 sticky top-2 z-50"
                        >
                            <div className="flex items-center justify-between">
                                {/* Logo Area */}
                                <Link to="/" className="flex items-center gap-2 group">
                                    <div className="relative p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                                        <div className="absolute inset-0 blur-lg bg-primary/30 animate-pulse" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent font-serif tracking-tight">
                                            AI 占卜
                                        </h1>
                                        <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                                            探索未知 · 洞察未来
                                        </p>
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-1 md:gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} title="主页">
                                        <Home className="h-5 w-5" />
                                    </Button>

                                    {settings.enable_login && (
                                        settings.user_name ? (
                                            <Button variant="ghost" size="sm" onClick={logOut} className="gap-2">
                                                <LogOut className="h-4 w-4" />
                                                <span className="hidden sm:inline">登出</span>
                                            </Button>
                                        ) : (
                                            <Button variant="default" size="sm" onClick={() => navigate('/login')} className="gap-2 bg-primary/80 hover:bg-primary">
                                                <LogIn className="h-4 w-4" />
                                                <span className="hidden sm:inline">登录</span>
                                            </Button>
                                        )
                                    )}

                                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="设置">
                                        <Settings className="h-5 w-5" />
                                    </Button>

                                    <Button variant="ghost" size="icon" onClick={toggleDark} title="切换主题">
                                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                    </Button>

                                    <Button variant="ghost" size="icon" asChild>
                                        <a href="https://github.com/dreamhunter2333/chatgpt-tarot-divination" target="_blank" rel="noopener noreferrer">
                                            <Github className="h-5 w-5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Status Alert for Rate Limit / Login */}
                            <AnimatePresence>
                                {settings.fetched && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        {!settings.user_name && settings.enable_rate_limit && (
                                            <div className="mt-2 pt-2 border-t border-border/50">
                                                <div className="flex items-center justify-between text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        游客限流模式 ({settings.rate_limit})
                                                    </span>
                                                    <Link to="/settings" className="hover:underline opacity-80 hover:opacity-100">
                                                        自定义配置 &rarr;
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.header>

                        {/* Page Content */}
                        <main className="flex-1 relative">
                            <AnimatePresence mode="wait">
                                {/* 
                    Ideally we would wrap children in a motion.div here keyed by location.pathname, 
                    but since children is passed as prop, the animation needs to be handled 
                    either in App.tsx or we accept that only inner content animates.
                    For now, we just render children.
                 */}
                                {children}
                            </AnimatePresence>
                        </main>

                        <footer className="mt-8 py-6 text-center text-sm text-muted-foreground border-t border-border/40">
                            <p>© {new Date().getFullYear()} AI Tarot Divination. Keep an open mind.</p>
                        </footer>
                    </div>

                    {/* Right Ad Column */}
                    {showAd && (
                        <div className="hidden md:block md:col-span-1">
                            <ins
                                className="adsbygoogle sticky top-4"
                                style={{ display: 'block', minHeight: '600px' }}
                                data-ad-client={settings.ad_client}
                                data-ad-slot={settings.ad_slot}
                                data-ad-format="auto"
                                data-full-width-responsive="true"
                            ></ins>
                        </div>
                    )}
                </div>
            </div>
            <Toaster />
        </div>
    )
}
