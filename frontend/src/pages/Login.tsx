import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGlobalState } from '@/store'
import { LogIn } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { formatRateLimit, isHigherRateLimit } from '@/utils/rateLimit'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const OAUTH_STATE_KEY = 'oauth_state'

export default function LoginPage() {
  const { login_type } = useParams()
  const [searchParams] = useSearchParams()
  const { setJwt, settings } = useGlobalState()
  // only promise more quota when the server actually grants it
  const loginRaisesQuota = !!settings.enable_rate_limit && isHigherRateLimit(settings.user_rate_limit, settings.rate_limit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGithubCallback = async (code: string, state: string | null) => {
    if (!state || state !== sessionStorage.getItem(OAUTH_STATE_KEY)) {
      setError('登录失败: state 校验失败，请重新登录')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/oauth`, {
        method: 'POST',
        body: JSON.stringify({
          login_type: 'github',
          code: code,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`${response.status} ${text}`)
      }

      const token = await response.json()
      sessionStorage.removeItem(OAUTH_STATE_KEY)
      setJwt(token)
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      setError(`登录失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (login_type === 'github') {
      const code = searchParams.get('code')
      if (code) {
        handleGithubCallback(code, searchParams.get('state'))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login_type, searchParams])

  const onGithubLogin = async () => {
    try {
      setLoading(true)
      setError('')
      // randomUUID needs a secure context, self hosted instances are often plain http
      const state = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
      sessionStorage.setItem(OAUTH_STATE_KEY, state)
      const query = new URLSearchParams({
        login_type: 'github',
        redirect_url: `${window.location.origin}/login/github`,
        state,
      })
      const response = await fetch(
        `${API_BASE}/api/v1/login?${query}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`${response.status} ${text}`)
      }

      const redirectUrl = await response.json()
      window.location.href = redirectUrl
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center px-0 py-4 md:py-12 animate-in fade-in duration-500">
      <Card className="w-full max-w-md backdrop-blur-lg bg-card/60 shadow-xl border-primary/10">
        <CardHeader className="space-y-2 text-center p-6 pb-2">
          <div className="mx-auto mb-2 p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl md:text-2xl">登录 AI 占卜</CardTitle>
          <CardDescription className="text-sm">
            {loginRaisesQuota ? '登录后可享受更高的使用额度' : '使用 GitHub 账号登录'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {loginRaisesQuota && (
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">游客</div>
                <div className="mt-1 text-sm font-semibold">{formatRateLimit(settings.rate_limit)}</div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="text-xs text-primary">登录后</div>
                <div className="mt-1 text-sm font-semibold text-primary">{formatRateLimit(settings.user_rate_limit)}</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <GithubIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">正在登录...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && (
            <>
              <Button
                onClick={onGithubLogin}
                disabled={loading}
                className="w-full h-12 gap-3 text-base"
                size="lg"
              >
                <GithubIcon className="h-5 w-5" />
                使用 GitHub 登录
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                仅用于识别你的 GitHub 账号，不会发布任何内容
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
