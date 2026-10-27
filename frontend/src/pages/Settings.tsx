import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DivinationCardHeader } from '@/components/DivinationCardHeader'
import { useGlobalState, type ApiStyle } from '@/store'
import { Save, Settings as SettingsIcon, ExternalLink, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { customOpenAISettings, setCustomOpenAISettings, settings } = useGlobalState()

  const [tempSettings, setTempSettings] = useState({
    enable: false,
    baseUrl: '',
    apiKey: '',
    model: '',
    apiStyle: 'chat' as ApiStyle,
    temperature: 0.9,
    reasoningEffort: '',
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setTempSettings({
      enable: customOpenAISettings.enable,
      baseUrl: customOpenAISettings.baseUrl || settings.default_api_base || '',
      apiKey: customOpenAISettings.apiKey || '',
      model: customOpenAISettings.model || settings.default_model || '',
      apiStyle: customOpenAISettings.apiStyle || 'chat',
      temperature: customOpenAISettings.temperature ?? 0.9,
      reasoningEffort: customOpenAISettings.reasoningEffort || '',
    })
  }, [customOpenAISettings, settings])

  const goToPurchase = () => {
    if (settings.purchase_url) {
      window.open(settings.purchase_url, '_blank')
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setSaved(false)
    try {
      setCustomOpenAISettings(tempSettings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const hasPurchaseUrl = settings.purchase_url && settings.purchase_url !== ''

  return (
    <DivinationCardHeader
      title="API 设置"
      description="自定义您的 OpenAI API 配置"
      icon={SettingsIcon}
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-end mb-4 md:mb-6">
          <Button
            onClick={saveSettings}
            disabled={loading}
            className="gap-2 w-full md:w-auto"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                已保存
              </>
            ) : loading ? (
              '保存中...'
            ) : (
              <>
                <Save className="h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>

        {saved && (
          <Alert variant="success" className="animate-in slide-in-from-top duration-300 mb-4 md:mb-6">
            <AlertDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              设置已成功保存
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between p-3 md:p-4 rounded-lg border bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="enable-custom" className="text-sm md:text-base font-medium">启用自定义 API</Label>
              <p className="text-xs md:text-sm text-muted-foreground">使用您自己的 API 配置</p>
            </div>
            <Switch
              id="enable-custom"
              checked={tempSettings.enable}
              onCheckedChange={(checked) =>
                setTempSettings({ ...tempSettings, enable: checked })
              }
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="base-url" className="text-sm md:text-base">API 地址</Label>
            <Input
              id="base-url"
              value={tempSettings.baseUrl}
              onChange={(e) =>
                setTempSettings({ ...tempSettings, baseUrl: e.target.value })
              }
              placeholder="https://api.openai.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key" className="text-sm md:text-base">API 密钥</Label>
              {hasPurchaseUrl && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={goToPurchase}
                  className="h-auto p-0 gap-1"
                >
                  获取 API KEY
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Input
              id="api-key"
              type="password"
              value={tempSettings.apiKey}
              onChange={(e) =>
                setTempSettings({ ...tempSettings, apiKey: e.target.value })
              }
              placeholder="sk-..."
              className="h-11 font-mono"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="model" className="text-sm md:text-base">模型</Label>
            <Input
              id="model"
              value={tempSettings.model}
              onChange={(e) =>
                setTempSettings({ ...tempSettings, model: e.target.value })
              }
              placeholder="gpt-4"
              className="h-11"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="api-style" className="text-sm md:text-base">API 接口风格</Label>
            <Select
              value={tempSettings.apiStyle}
              onValueChange={(value: ApiStyle) =>
                setTempSettings({ ...tempSettings, apiStyle: value })
              }
            >
              <SelectTrigger id="api-style" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">chat completions（/v1/chat/completions）</SelectItem>
                <SelectItem value="responses">responses（/v1/responses）</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs md:text-sm text-muted-foreground">
              推理类模型（如 gpt-6-luna）通常只能走 responses 接口
            </p>
          </div>

          {tempSettings.apiStyle === 'chat' ? (
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="temperature" className="text-sm md:text-base">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={tempSettings.temperature}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    temperature: e.target.value === '' ? 0.9 : Number(e.target.value),
                  })
                }
                className="h-11"
              />
              <p className="text-xs md:text-sm text-muted-foreground">
                0 - 2，越高越发散；不填则默认 0.9
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="reasoning-effort" className="text-sm md:text-base">推理强度</Label>
              <Select
                value={tempSettings.reasoningEffort}
                onValueChange={(value) =>
                  setTempSettings({ ...tempSettings, reasoningEffort: value })
                }
              >
                <SelectTrigger id="reasoning-effort" className="h-11">
                  <SelectValue placeholder="跟随模型默认" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">跟随模型默认</SelectItem>
                  <SelectItem value="none">关闭 reasoning（最快）</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs md:text-sm text-muted-foreground">
                responses 接口不接受 temperature，改用推理强度控制输出
              </p>
            </div>
          )}
        </div>
      </div>
    </DivinationCardHeader>
  )
}
