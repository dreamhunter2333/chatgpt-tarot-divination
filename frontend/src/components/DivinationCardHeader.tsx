import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LucideIcon, History } from 'lucide-react'

interface DivinationCardHeaderProps {
  /** 页面标题 */
  title: string
  /** 页面描述/副标题 */
  description: string
  /** 卡片内容区域 */
  children: ReactNode
  /** 返回按钮点击回调，默认返回到市场首页 */
  onBack?: () => void
  /** 标题图标 */
  icon?: LucideIcon
  /** 占卜类型，用于历史记录导航（可选，如果不提供则不显示历史按钮） */
  divinationType?: string
}

/**
 * 占卜页面通用卡片头部组件
 *
 * 包含：
 * - 左上角返回按钮
 * - 居中的标题（带渐变色）
 * - 可选的标题图标
 * - 居中的描述文字
 * - 内容区域（children）
 *
 * @example
 * ```tsx
 * <DivinationCardHeader
 *   title="塔罗牌占卜"
 *   description="通过塔罗牌探索内心，洞察未来可能性"
 *   icon={Sparkles}
 * >
 *   <div>占卜表单内容</div>
 * </DivinationCardHeader>
 * ```
 */
export function DivinationCardHeader({
  title,
  description,
  children,
  onBack,
  icon: Icon,
  divinationType,
}: DivinationCardHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/20 transition-all relative min-h-[500px]">
        {/* 返回按钮 */}
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="absolute left-2 top-2 md:left-4 md:top-4 gap-1 text-primary hover:text-primary/80 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs md:text-sm">返回</span>
        </Button>

        {/* 历史记录按钮 - 仅在提供了 divinationType 时显示 */}
        {divinationType && (
          <Button
            onClick={() => navigate(`/history/${divinationType}`)}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 md:right-4 md:top-4 gap-1 text-primary hover:text-primary/80 z-10"
          >
            <History className="h-4 w-4" />
            <span className="text-xs md:text-sm">历史</span>
          </Button>
        )}

        {/* 标题区域 */}
        <CardHeader className="p-4 md:p-6 pb-3 md:pb-4 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {Icon && (
              <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            )}
            <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-sm md:text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>

        {/* 内容区域 */}
        <CardContent className="pt-0 space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6 flex items-center justify-center min-h-[350px]">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
