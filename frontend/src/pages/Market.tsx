import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DIVINATION_OPTIONS } from '@/config/constants'
import { Sparkles, Info } from 'lucide-react'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function MarketPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 md:space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {DIVINATION_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <motion.div
              key={option.key}
              variants={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="group relative cursor-pointer border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden transition-colors hover:border-primary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
                onClick={() => navigate(`/divination/${option.key}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="p-4 md:p-6 relative z-10">
                  <div className="flex items-center gap-3 md:gap-4 mb-2">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-serif tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-secondary transition-all">
                      {option.label}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm md:text-base line-clamp-2">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 relative z-10">
                  <div className="flex items-center text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="font-medium">开始占卜</span>
                    <Sparkles className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* 关于卡片 */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card
            className="group relative cursor-pointer border-secondary/20 bg-card/40 backdrop-blur-sm overflow-hidden transition-colors hover:border-secondary/50 hover:shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.3)]"
            onClick={() => navigate('/about')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="p-4 md:p-6 relative z-10">
              <div className="flex items-center gap-3 md:gap-4 mb-2">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary-foreground group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300">
                  <Info className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg md:text-xl font-serif tracking-wide">关于占卜</CardTitle>
              </div>
              <CardDescription className="text-sm md:text-base">
                了解各种占卜方式的起源与含义
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 relative z-10">
              <div className="flex items-center text-xs md:text-sm text-muted-foreground group-hover:text-secondary-foreground transition-colors">
                <span className="font-medium">查看详情</span>
                <Sparkles className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
