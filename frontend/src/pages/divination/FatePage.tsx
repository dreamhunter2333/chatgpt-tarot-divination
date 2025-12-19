import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DivinationCardHeader } from '@/components/DivinationCardHeader'
import { ResultDrawer } from '@/components/ResultDrawer'
import { useDivination } from '@/hooks/useDivination'
import { useLocalStorage } from '@/hooks'
import { getDivinationOption } from '@/config/constants'
import { Sparkles, Eye, Loader2 } from 'lucide-react'

const CONFIG = getDivinationOption('fate')!

export default function FatePage() {
  const [fate, setFate] = useLocalStorage('fate_body', {
    name1: '',
    name2: '',
  })
  const { result, loading, resultLoading, streaming, showDrawer, setShowDrawer, onSubmit } =
    useDivination('fate')

  const handleSubmit = () => {
    onSubmit({
      prompt: `${fate.name1} ${fate.name2}`,
      fate: fate,
    })
  }

  return (
    <DivinationCardHeader
      title={CONFIG.title}
      description={CONFIG.description}
      icon={CONFIG.icon}
      divinationType="fate"
    >
      <div className="max-w-2xl mx-auto">
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
              className="mt-2"
            />
          </div>
          <div>
            <Label>姓名2</Label>
            <Input
              value={fate.name2}
              onChange={(e) => setFate({ ...fate, name2: e.target.value })}
              maxLength={40}
              className="mt-2"
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
