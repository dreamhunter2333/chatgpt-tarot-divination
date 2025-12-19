import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DIVINATION_OPTIONS } from '@/config/constants'
import { Sparkles, Info } from 'lucide-react'

export default function MarketPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {DIVINATION_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.key}
              className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/30 transition-all cursor-pointer group hover:scale-105"
              onClick={() => navigate(`/divination/${option.key}`)}
            >
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg md:text-xl">{option.label}</CardTitle>
                </div>
                <CardDescription className="text-sm md:text-base">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="flex items-center text-xs md:text-sm text-primary group-hover:translate-x-1 transition-transform">
                  <span>开始占卜</span>
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* 关于卡片 */}
        <Card
          className="backdrop-blur-lg bg-card/50 shadow-xl border-primary/10 hover:border-primary/30 transition-all cursor-pointer group hover:scale-105"
          onClick={() => navigate('/about')}
        >
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
              <div className="p-2 md:p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Info className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">关于占卜</CardTitle>
            </div>
            <CardDescription className="text-sm md:text-base">
              了解各种占卜方式的起源与含义
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="flex items-center text-xs md:text-sm text-primary group-hover:translate-x-1 transition-transform">
              <span>查看详情</span>
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
