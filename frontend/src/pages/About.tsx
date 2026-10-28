import { Card, CardContent } from '@/components/ui/card'
import { ABOUT } from '@/config/constants'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default function AboutPage() {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <Card className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/20 transition-all relative">
        <CardContent className="pt-6 md:pt-8 px-4 md:px-6 pb-4 md:pb-6">
          <div
            className="prose prose-xs md:prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: md.render(ABOUT) }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
