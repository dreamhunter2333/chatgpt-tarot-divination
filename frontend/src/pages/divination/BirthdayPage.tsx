import { useState, useEffect } from 'react'
import { Solar } from 'lunar-javascript'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DivinationCardHeader } from '@/components/DivinationCardHeader'
import { ResultDrawer } from '@/components/ResultDrawer'
import { useDivination } from '@/hooks/useDivination'
import { useLocalStorage } from '@/hooks'
import { getDivinationOption } from '@/config/constants'
import { Sparkles, Eye, Loader2 } from 'lucide-react'

const CONFIG = getDivinationOption('birthday')!

export default function BirthdayPage() {
  const [birthday, setBirthday] = useLocalStorage('birthday', '2000-08-17T00:00')
  const [lunarBirthday, setLunarBirthday] = useState('')
  const { result, loading, resultLoading, streaming, showDrawer, setShowDrawer, onSubmit } =
    useDivination('birthday')

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

  const handleSubmit = () => {
    // 将日期格式从 ISO 格式转换为后端期望的格式
    const date = new Date(birthday)
    const formattedBirthday = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' +
      String(date.getSeconds()).padStart(2, '0')

    onSubmit({
      prompt: formattedBirthday,
      birthday: formattedBirthday,
    })
  }

  return (
    <DivinationCardHeader
      title={CONFIG.title}
      description={CONFIG.description}
      icon={CONFIG.icon}
      divinationType="birthday"
    >
      <div className="max-w-2xl mx-auto">
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
