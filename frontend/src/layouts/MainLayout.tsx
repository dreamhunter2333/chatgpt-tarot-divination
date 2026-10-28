import { ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, Moon, Settings, Sparkles, Sun } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { Button } from '@/components/ui/button'
import { useGlobalState } from '@/store'
import { useIsMobile } from '@/hooks'

// the api reports limits as "60req/3600seconds"
function formatRateLimit(rateLimit?: string) {
    const match = rateLimit?.match(/^(\d+)req\/(\d+)seconds$/)
    if (!match) return rateLimit
    const [, count, seconds] = match.map(Number)
    const [size, unit] = seconds % 3600 === 0 ? [seconds / 3600, '小时'] : seconds % 60 === 0 ? [seconds / 60, '分钟'] : [seconds, '秒']
    return `每${size === 1 ? '' : ` ${size} `}${unit} ${count} 次`
}

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const navigate = useNavigate()
    const { pathname } = useLocation()
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
        if (!showAd || !settings.fetched) return
        try {
            // AdSense needs one push per rendered unit, and never twice for the same one
            document.querySelectorAll('ins.adsbygoogle:not([data-ad-pushed])').forEach((unit) => {
                unit.setAttribute('data-ad-pushed', '')
                ;(window.adsbygoogle = window.adsbygoogle || []).push({})
            })
        } catch (e) {
            console.error('AdSense error:', e)
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
                            className="backdrop-blur-md bg-card/70 border border-border/60 rounded-2xl shadow-sm px-3 py-2.5 md:px-4 md:py-3 mb-6 sticky top-2 z-50"
                        >
                            <div className="flex items-center justify-between">
                                {/* Logo Area */}
                                <Link to="/" className="flex items-center gap-2.5 group" title="主页">
                                    <div className="p-2 rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 transition-colors">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="leading-tight">
                                        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                                            AI 占卜
                                        </h1>
                                        <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                                            探索未知 · 洞察未来
                                        </p>
                                    </div>
                                </Link>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    {settings.enable_login && (
                                        settings.user_name ? (
                                            <Button variant="ghost" size="sm" onClick={logOut} className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                <LogOut className="h-4 w-4" />
                                                <span className="hidden sm:inline">登出</span>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => navigate('/login')} className={`gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary ${pathname.startsWith('/login') ? 'bg-primary/10' : ''}`}>
                                                <LogIn className="h-4 w-4" />
                                                <span className="hidden sm:inline">登录</span>
                                            </Button>
                                        )
                                    )}

                                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="设置" className={pathname === '/settings' ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground'}>
                                        <Settings className="h-5 w-5" />
                                    </Button>

                                    <Button variant="ghost" size="icon" onClick={toggleDark} title="切换主题" className="text-muted-foreground hover:text-foreground">
                                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                    </Button>

                                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                                        <a href="https://github.com/dreamhunter2333/chatgpt-tarot-divination" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                            <GithubIcon className="h-5 w-5" />
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
                                            <div className="mt-2.5 pt-2.5 border-t border-border/50">
                                                <div className="flex items-center justify-between text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        游客限流模式（{formatRateLimit(settings.rate_limit)}）
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
        </div>
    )
}
