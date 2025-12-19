import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ABOUT } from '@/config/constants'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/20 transition-all relative">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="absolute left-2 top-2 md:left-4 md:top-4 gap-1 text-primary hover:text-primary/80 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs md:text-sm">返回</span>
        </Button>
        <CardContent className="pt-12 md:pt-14 px-4 md:px-6 pb-4 md:pb-6">
          <div
            className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: md.render(ABOUT) }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
