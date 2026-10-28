import { ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Info, LogIn, LogOut, Menu, Moon, Settings, Sparkles, Sun } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DIVINATION_OPTIONS } from '@/config/constants'
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
    const { isDark, toggleDark, settings, setJwt, customOpenAISettings } = useGlobalState()

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

    const quota = settings.user_name ? settings.user_rate_limit : settings.rate_limit
    const status = !settings.fetched ? null
        : customOpenAISettings.enable ? { label: '自定义 API', tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25' }
        : settings.enable_rate_limit ? { label: `${settings.user_name ? '已登录' : '游客'} · ${formatRateLimit(quota)}`, tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25' }
        : null
    const navClass = (active: boolean) => active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'

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
                            className="backdrop-blur-md bg-card/75 border border-border/60 rounded-2xl shadow-sm px-2 py-2 md:px-3 mb-6 sticky top-2 z-50"
                        >
                            <div className="flex items-center gap-1">
                                <Link to="/" className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 mr-2 group" title="主页">
                                    <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 transition-colors">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                                        AI 占卜
                                    </span>
                                </Link>

                                {/* Desktop navigation */}
                                <nav className="hidden md:flex items-center gap-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className={`gap-1 ${navClass(pathname.startsWith('/divination') || pathname.startsWith('/history'))}`}>
                                                占卜
                                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-44">
                                            {DIVINATION_OPTIONS.map(({ key, label, icon: Icon }) => (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onSelect={() => navigate(`/divination/${key}`)}
                                                    className={pathname === `/divination/${key}` ? 'bg-accent' : ''}
                                                >
                                                    <Icon className="text-primary" />
                                                    {label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/about')} className={navClass(pathname === '/about')}>
                                        关于
                                    </Button>
                                </nav>

                                <div className="ml-auto flex items-center gap-1">
                                    {status && (
                                        <Link
                                            to="/settings"
                                            title="点击自定义 API 配置"
                                            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 mr-1 text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80 ${status.tone}`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {status.label}
                                        </Link>
                                    )}

                                    <Button variant="ghost" size="icon" onClick={toggleDark} title="切换主题" className="text-muted-foreground hover:text-foreground">
                                        {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="设置" className={navClass(pathname === '/settings')}>
                                        <Settings className="h-[18px] w-[18px]" />
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
                                        <a href="https://github.com/dreamhunter2333/chatgpt-tarot-divination" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                                            <GithubIcon className="h-[18px] w-[18px]" />
                                        </a>
                                    </Button>

                                    {settings.enable_login && (
                                        settings.user_name ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2.5 ml-1 rounded-full border border-border/60">
                                                        {settings.login_type === 'github' ? (
                                                            <img src={`https://github.com/${settings.user_name}.png?size=48`} alt="" className="h-6 w-6 rounded-full" />
                                                        ) : (
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                                                                {settings.user_name.slice(0, 1).toUpperCase()}
                                                            </span>
                                                        )}
                                                        <span className="hidden sm:inline max-w-[8rem] truncate">{settings.user_name}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>已通过 {settings.login_type === 'github' ? 'GitHub' : settings.login_type} 登录</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={logOut} className="text-destructive focus:text-destructive">
                                                        <LogOut />
                                                        登出
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="gap-1.5 ml-1 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary">
                                                <LogIn className="h-4 w-4" />
                                                <span className="hidden sm:inline">登录</span>
                                            </Button>
                                        )
                                    )}

                                    {/* Mobile navigation */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground" aria-label="菜单">
                                                <Menu className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52">
                                            {status && (
                                                <>
                                                    <DropdownMenuItem onSelect={() => navigate('/settings')} className={`mb-1 justify-center rounded-full border text-xs font-medium ${status.tone}`}>
                                                        {status.label}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>
                                            )}
                                            <DropdownMenuLabel>占卜</DropdownMenuLabel>
                                            {DIVINATION_OPTIONS.map(({ key, label, icon: Icon }) => (
                                                <DropdownMenuItem
                                                    key={key}
                                                    onSelect={() => navigate(`/divination/${key}`)}
                                                    className={pathname === `/divination/${key}` ? 'bg-accent' : ''}
                                                >
                                                    <Icon className="text-primary" />
                                                    {label}
                                                </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => navigate('/about')}>
                                                <Info />
                                                关于
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <a href="https://github.com/dreamhunter2333/chatgpt-tarot-divination" target="_blank" rel="noopener noreferrer">
                                                    <GithubIcon className="h-4 w-4" />
                                                    GitHub
                                                </a>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
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
