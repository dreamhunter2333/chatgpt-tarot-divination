import { useState, useEffect, useRef } from 'react'
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source'
import MarkdownIt from 'markdown-it'
import { Solar } from 'lunar-javascript'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGlobalState } from '@/store'
import { useLocalStorage, useIsMobile } from '@/hooks'
import { DIVINATION_OPTIONS, ABOUT } from '@/config/constants'
import { ChevronLeft, ChevronRight, Sparkles, Loader2, X, Eye } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const IS_TAURI = import.meta.env.VITE_IS_TAURI || ''
const md = new MarkdownIt()

export default function HomePage() {
  const { jwt, customOpenAISettings } = useGlobalState()
  const isMobile = useIsMobile()
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  const [prompt, setPrompt] = useLocalStorage('prompt', '')
  const [result, setResult] = useLocalStorage('result', '')
  const [promptType, setPromptType] = useLocalStorage('prompt_type', 'tarot')
  const [birthday, setBirthday] = useLocalStorage('birthday', '2000-08-17T00:00')
  const [lunarBirthday, setLunarBirthday] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultLoading, setResultLoading] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [streaming, setStreaming] = useState(false)

  // 起名相关
  const [sex, setSex] = useState('')
  const [surname, setSurname] = useState('')
  const [newNamePrompt, setNewNamePrompt] = useState('')

  // 梅花易数
  const [plumFlower, setPlumFlower] = useLocalStorage('plum_flower', {
    num1: 0,
    num2: 0,
  })

  // 姻缘
  const [fate, setFate] = useLocalStorage('fate_body', {
    name1: '',
    name2: '',
  })

  const computeLunarBirthday = (birthdayStr: string) => {
    try {
      const date = new Date(birthdayStr)
      const solar = Solar.fromYmdHms(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
      setLunarBirthday(solar.getLunar().toFullString())
    } catch (error) {
      console.error(error)
      setLunarBirthday('转换失败')
    }
  }

  useEffect(() => {
    computeLunarBirthday(birthday)
  }, [birthday])

  // 自动滚动到底部 - 使用防抖避免频繁滚动
  useEffect(() => {
    if (streaming && resultContainerRef.current) {
      const timeoutId = setTimeout(() => {
        if (resultContainerRef.current) {
          resultContainerRef.current.scrollTop = resultContainerRef.current.scrollHeight
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [result, streaming])

  // 自动滚动 tab 到可见区域
  useEffect(() => {
    if (isMobile && tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.querySelector('[data-state="active"]')
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [promptType, isMobile])

  const onSubmit = async () => {
    try {
      setLoading(true)
      setResultLoading(true)
      setStreaming(false)
      setResult('')
      setShowDrawer(true)

      let tmpResultBuffer = ''
      let firstChunk = true

      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwt || 'xxx'}`,
        'Content-Type': 'application/json',
      }

      if (customOpenAISettings.enable) {
        headers['x-api-key'] = customOpenAISettings.apiKey
        headers['x-api-url'] = customOpenAISettings.baseUrl
        headers['x-api-model'] = customOpenAISettings.model
      } else if (IS_TAURI) {
        setResult('请在设置中配置 API BASE URL 和 API KEY')
        setResultLoading(false)
        return
      }

      await fetchEventSource(`${API_BASE}/api/divination`, {
        method: 'POST',
        body: JSON.stringify({
          prompt: prompt || '我的财务状况如何',
          prompt_type: promptType,
          birthday: birthday,
          new_name: {
            surname,
            sex,
            birthday,
            new_name_prompt: newNamePrompt,
          },
          plum_flower: promptType === 'plum_flower' ? plumFlower : null,
          fate: promptType === 'fate' ? fate : null,
        }),
        headers,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            setStreaming(true)
            return
          } else if (response.status >= 400) {
            throw new Error(`${response.status} ${await response.text()}`)
          }
        },
        onmessage(msg) {
          if (msg.event === 'FatalError') {
            throw new Error(msg.data)
          }
          if (!msg.data) {
            return
          }
          try {
            const newContent = JSON.parse(msg.data)
            tmpResultBuffer += newContent
            setResult(md.render(tmpResultBuffer))

            // 收到第一个词立即结束加载状态
            if (firstChunk) {
              firstChunk = false
              setResultLoading(false)
              setLoading(false)
            }
          } catch (error) {
            console.error(error)
          }
        },
        onclose() {
          setStreaming(false)
        },
        onerror(err) {
          setResult(`占卜失败: ${err.message}`)
          setStreaming(false)
          throw new Error(`占卜失败: ${err.message}`)
        },
      })
    } catch (error: any) {
      console.error(error)
      setResult(error.message || '占卜失败')
      setStreaming(false)
    } finally {
      setLoading(false)
      setResultLoading(false)
      setStreaming(false)
    }
  }

  const currentIndex = DIVINATION_OPTIONS.findIndex((opt) => opt.key === promptType)

  const changeTab = (delta: number) => {
    let newIndex = currentIndex + delta
    if (newIndex < 0) {
      newIndex = DIVINATION_OPTIONS.length - 1
    } else if (newIndex >= DIVINATION_OPTIONS.length) {
      newIndex = 0
    }
    setPromptType(DIVINATION_OPTIONS[newIndex].key)
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <Tabs value={promptType} onValueChange={(value) => setPromptType(value as any)}>
        <div className="mb-3 md:mb-4">
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => changeTab(-1)}
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <div ref={tabsContainerRef} className="overflow-x-auto scrollbar-hide">
                  <TabsList className="inline-flex w-auto h-auto p-1 bg-muted/50 backdrop-blur-sm gap-1">
                    {DIVINATION_OPTIONS.map((option) => (
                      <TabsTrigger
                        key={option.key}
                        value={option.key}
                        className="text-xs px-3 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-md"
                      >
                        {option.label}
                      </TabsTrigger>
                    ))}
                    <TabsTrigger
                      value="about"
                      className="text-xs px-3 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                    >
                      关于
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <Button
                onClick={() => changeTab(1)}
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <TabsList className="inline-flex w-auto h-auto p-1 bg-muted/50 backdrop-blur-sm gap-1">
                {DIVINATION_OPTIONS.map((option) => (
                  <TabsTrigger
                    key={option.key}
                    value={option.key}
                    className="text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-md"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="about"
                  className="text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                >
                  关于
                </TabsTrigger>
              </TabsList>
            </div>
          )}
        </div>

        {DIVINATION_OPTIONS.map((option) => (
          <TabsContent key={option.key} value={option.key} className="mt-3 md:mt-4">
            <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/20 transition-all">
              <CardContent className="pt-4 md:pt-6 space-y-4 md:space-y-6 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                  {option.key === 'tarot' && (
                    <div>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="我的财务状况如何"
                        maxLength={40}
                        rows={3}
                      />
                    </div>
                  )}

                  {option.key === 'birthday' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="block mb-2">生日</Label>
                        <Input
                          type="datetime-local"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          className="w-auto inline-block"
                        />
                      </div>
                      <div>
                        <Label>农历</Label>
                        <p className="text-sm mt-2 text-foreground/80">{lunarBirthday}</p>
                      </div>
                    </div>
                  )}

                  {option.key === 'new_name' && (
                  <div className="space-y-4">
                    <div>
                      <Label>姓氏</Label>
                      <Input
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="请输入姓氏"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label>性别</Label>
                      <Select value={sex} onValueChange={setSex}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男">男</SelectItem>
                          <SelectItem value="女">女</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block mb-2">生日</Label>
                      <Input
                        type="datetime-local"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-auto inline-block"
                      />
                    </div>
                    <div>
                      <Label>附加</Label>
                      <Input
                        value={newNamePrompt}
                        onChange={(e) => setNewNamePrompt(e.target.value)}
                        maxLength={20}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">农历: {lunarBirthday}</p>
                  </div>
                )}

                  {option.key === 'name' && (
                  <div>
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="请输入姓名"
                      maxLength={10}
                    />
                  </div>
                )}

                  {option.key === 'dream' && (
                  <div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="请输入你的梦境"
                      maxLength={40}
                      rows={3}
                    />
                  </div>
                )}

                  {option.key === 'plum_flower' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">请随机输入两个 0-1000 的数字</h4>
                    <div>
                      <Label>数字一</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        value={plumFlower.num1}
                        onChange={(e) =>
                          setPlumFlower({ ...plumFlower, num1: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label>数字二</Label>
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        value={plumFlower.num2}
                        onChange={(e) =>
                          setPlumFlower({ ...plumFlower, num2: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                )}

                  {option.key === 'fate' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">缘分是天定的，幸福是自己的。</h4>
                    <p className="text-sm text-muted-foreground">
                      想知道你和 ta 有没有缘分呢，编辑"姓名1" "姓名2"，然后点击"一键预测"。
                    </p>
                    <p className="text-sm text-muted-foreground">
                      如郭靖 黄蓉，然后点击一键预测。 就能查看你和 ta 的缘分了。
                    </p>
                    <div>
                      <Label>姓名1</Label>
                      <Input
                        value={fate.name1}
                        onChange={(e) => setFate({ ...fate, name1: e.target.value })}
                        maxLength={40}
                      />
                    </div>
                    <div>
                      <Label>姓名2</Label>
                      <Input
                        value={fate.name2}
                        onChange={(e) => setFate({ ...fate, name2: e.target.value })}
                        maxLength={40}
                      />
                    </div>
                    <div className="text-center text-sm">
                      <a
                        href="https://github.com/alongLFB/alonglfb.github.io/blob/master/images/wechatpay.png"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        请作者喝杯咖啡
                      </a>{' '}
                      - 🤗 Along Li
                    </div>
                  </div>
                )}

                  <div className="flex gap-2 md:gap-3 justify-center pt-4 md:pt-6">
                    <Button
                      onClick={() => setShowDrawer(!showDrawer)}
                      variant="outline"
                      className="gap-2 flex-1 md:flex-initial md:min-w-[140px]"
                      size={isMobile ? "default" : "default"}
                    >
                      <Eye className="h-4 w-4" />
                      {loading ? '查看' : '结果'}
                    </Button>
                    <Button
                      onClick={onSubmit}
                      disabled={loading}
                      className="gap-2 flex-1 md:flex-initial md:min-w-[140px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      size={isMobile ? "default" : "default"}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          占卜中
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          开始占卜
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="about" className="mt-3 md:mt-4">
          <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10">
            <CardContent className="pt-4 md:pt-6 px-4 md:px-6 prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-li:text-foreground/90 prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: md.render(ABOUT) }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 现代化结果抽屉 - 移动端优化 */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          <div className="fixed inset-x-0 bottom-0 z-50 h-[90vh] md:h-[85vh] rounded-t-2xl md:rounded-t-3xl border-t bg-gradient-to-br from-card via-card to-card/95 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b p-4 md:p-6 bg-card/50 backdrop-blur-lg">
              <div className="flex items-center gap-2 md:gap-3">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold">占卜结果</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDrawer(false)}
                className="rounded-full hover:bg-muted h-8 w-8 md:h-10 md:w-10"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
            <div ref={resultContainerRef} className="overflow-y-auto p-4 md:p-6 h-[calc(90vh-4rem)] md:h-[calc(85vh-5rem)]">
              {resultLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-primary/20 border-t-primary"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-base md:text-lg font-medium">正在占卜中...</p>
                    <p className="text-xs md:text-sm text-muted-foreground">请稍候，AI 正在为您解读</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <div
                    className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                  {streaming && (
                    <span className="inline-block w-0.5 h-5 ml-1 bg-primary cursor-blink align-middle"></span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
