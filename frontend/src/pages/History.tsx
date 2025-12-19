import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Calendar } from 'lucide-react'
import { getHistoryByType, deleteHistoryItem, clearHistory, DivinationHistoryItem } from '@/utils/divinationHistory'
import { ResultDrawer } from '@/components/ResultDrawer'
import { toast } from 'sonner'
import { getDivinationOption } from '@/config/constants'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default function HistoryPage() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const [history, setHistory] = useState<DivinationHistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<DivinationHistoryItem | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)

  // 获取占卜配置
  const divinationConfig = type ? getDivinationOption(type) : null

  useEffect(() => {
    loadHistory()
  }, [type])

  const loadHistory = () => {
    if (type) {
      setHistory(getHistoryByType(type))
    }
  }

  const handleDelete = (id: string) => {
    if (type) {
      deleteHistoryItem(id, type)
      loadHistory()
      toast.success('已删除')
    }
  }

  const handleClearAll = () => {
    if (confirm('确定要清空所有历史记录吗？') && type) {
      // 清空该类型的所有记录
      const allHistory = getHistoryByType(type)
      allHistory.forEach(item => deleteHistoryItem(item.id, type))
      loadHistory()
      toast.success('已清空所有历史记录')
    }
  }

  const handleViewResult = (item: DivinationHistoryItem) => {
    setSelectedItem(item)
    setShowDrawer(true)
  }

  // 将 markdown 渲染成 HTML
  const renderedResult = useMemo(() => {
    if (!selectedItem) return ''
    return md.render(selectedItem.result)
  }, [selectedItem])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10">
        {/* 返回按钮 */}
        <Button
          onClick={() => navigate(`/divination/${type}`)}
          variant="ghost"
          size="sm"
          className="absolute left-2 top-2 md:left-4 md:top-4 gap-1 text-primary hover:text-primary/80 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs md:text-sm">返回</span>
        </Button>

        {/* 标题区域 */}
        <CardHeader className="p-4 md:p-6 pb-3 md:pb-4 text-center">
          <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {divinationConfig?.title || '历史记录'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            最近 {history.length} 条占卜记录
          </p>
        </CardHeader>

        {/* 内容区域 */}
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
          {history.length > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                清空所有
              </Button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>暂无历史记录</p>
              <p className="text-sm mt-2">开始占卜后会自动保存记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => handleViewResult(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.prompt}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 结果抽屉 */}
      {selectedItem && (
        <ResultDrawer
          show={showDrawer}
          onClose={() => setShowDrawer(false)}
          result={renderedResult}
          loading={false}
          streaming={false}
        />
      )}
    </div>
  )
}
