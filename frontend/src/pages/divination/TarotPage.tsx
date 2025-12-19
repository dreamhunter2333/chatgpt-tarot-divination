import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DivinationCardHeader } from '@/components/DivinationCardHeader'
import { ResultDrawer } from '@/components/ResultDrawer'
import { useDivination } from '@/hooks/useDivination'
import { useLocalStorage } from '@/hooks'
import { getDivinationOption } from '@/config/constants'
import { Sparkles, Eye, Loader2 } from 'lucide-react'

const CONFIG = getDivinationOption('tarot')!

export default function TarotPage() {
  const [prompt, setPrompt] = useLocalStorage('prompt', '')
  const { result, loading, resultLoading, streaming, showDrawer, setShowDrawer, onSubmit } =
    useDivination('tarot')

  const handleSubmit = () => {
    onSubmit({
      prompt: prompt || '我的财务状况如何',
    })
  }

  return (
    <DivinationCardHeader
      title={CONFIG.title}
      description={CONFIG.description}
      icon={CONFIG.icon}
      divinationType="tarot"
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="我的财务状况如何"
              maxLength={40}
              rows={3}
              className="resize-none w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              请输入您想要占卜的问题（最多40字）
            </p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 justify-center pt-4 md:pt-6">
          <Button
            onClick={() => setShowDrawer(!showDrawer)}
            variant="outline"
            className="gap-2 flex-1 md:flex-initial md:min-w-[140px]"
            disabled={!result}
          >
            <Eye className="h-4 w-4" />
            查看结果
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2 flex-1 md:flex-initial md:min-w-[140px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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

      <ResultDrawer
        show={showDrawer}
        onClose={() => setShowDrawer(false)}
        result={result}
        loading={resultLoading}
        streaming={streaming}
      />
    </DivinationCardHeader>
  )
}
