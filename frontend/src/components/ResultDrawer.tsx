import { Button } from '@/components/ui/button'
import { Sparkles, X } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ResultDrawerProps {
  show: boolean
  onClose: () => void
  result: string
  loading: boolean
  streaming: boolean
}

export function ResultDrawer({ show, onClose, result, loading, streaming }: ResultDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // 控制入场动画
  useEffect(() => {
    if (show) {
      // 延迟一帧，让浏览器先渲染初始状态
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
    }
  }, [show])

  // 自动滚动到底部 - 在内容更新时自动滚动
  useEffect(() => {
    if (result && containerRef.current) {
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [result])

  if (!show) return null

  const drawerContent = (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* 抽屉容器 - 固定在底部 */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 h-[80vh] rounded-t-2xl md:rounded-t-3xl border-t bg-background shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b p-4 md:p-6 bg-card">
          <div className="flex items-center gap-2 md:gap-3">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h3 className="text-lg md:text-xl font-semibold">占卜结果</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted h-8 w-8 md:h-10 md:w-10"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
        {/* 内容区域 */}
        <div
          ref={containerRef}
          className="overflow-y-auto p-4 md:p-6 h-[calc(80vh-5rem)]"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-primary/20 border-t-primary"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base md:text-lg font-medium">正在占卜中...</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  请稍候，AI 正在为您解读
                </p>
              </div>
            </div>
          ) : result ? (
            <div className={streaming ? 'streaming-content' : 'animate-in fade-in duration-300'}>
              <div
                className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90"
                dangerouslySetInnerHTML={{ __html: result }}
              />
              {streaming && (
                <span className="inline-flex w-1.5 h-5 ml-1 bg-primary cursor-blink align-middle rounded-sm shadow-lg"></span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  // 使用 Portal 将抽屉渲染到 body,避免父容器样式干扰
  return createPortal(drawerContent, document.body)
}
