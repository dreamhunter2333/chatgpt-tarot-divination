import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DivinationCardHeader } from '@/components/DivinationCardHeader'
import { ResultDrawer } from '@/components/ResultDrawer'
import { useDivination } from '@/hooks/useDivination'
import { useLocalStorage } from '@/hooks'
import { getDivinationOption } from '@/config/constants'
import { Sparkles, Eye, Loader2 } from 'lucide-react'

const CONFIG = getDivinationOption('plum_flower')!

export default function PlumFlowerPage() {
  const [plumFlower, setPlumFlower] = useLocalStorage('plum_flower', {
    num1: 0,
    num2: 0,
  })
  const { result, loading, resultLoading, streaming, showDrawer, setShowDrawer, onSubmit } =
    useDivination('plum_flower')

  const handleSubmit = () => {
    onSubmit({
      prompt: `${plumFlower.num1} ${plumFlower.num2}`,
      plum_flower: plumFlower,
    })
  }

  return (
    <DivinationCardHeader
      title={CONFIG.title}
      description={CONFIG.description}
      icon={CONFIG.icon}
      divinationType="plum_flower"
    >
      <div className="max-w-2xl mx-auto">
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
              className="mt-2"
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
              className="mt-2"
            />
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
