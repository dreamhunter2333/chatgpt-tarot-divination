import { useState } from 'react'
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source'
import MarkdownIt from 'markdown-it'
import { useGlobalState } from '@/store'
import { saveHistory } from '@/utils/divinationHistory'
import { getDivinationOption } from '@/config/constants'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const IS_TAURI = import.meta.env.VITE_IS_TAURI || ''
const md = new MarkdownIt()

export function useDivination(promptType: string) {
  const { jwt, customOpenAISettings } = useGlobalState()
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultLoading, setResultLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  const onSubmit = async (params: any) => {
    try {
      setLoading(true)
      setResultLoading(true)
      setStreaming(false)
      setResult('')
      setShowDrawer(true)

      let tmpResultBuffer = ''
      let firstChunk = true

      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwt || 'xxx'}`,
        'Content-Type': 'application/json',
      }

      if (customOpenAISettings.enable) {
        headers['x-api-key'] = customOpenAISettings.apiKey
        headers['x-api-url'] = customOpenAISettings.baseUrl
        headers['x-api-model'] = customOpenAISettings.model
      } else if (IS_TAURI) {
        setResult('请在设置中配置 API BASE URL 和 API KEY')
        setResultLoading(false)
        return
      }

      await fetchEventSource(`${API_BASE}/api/divination`, {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          prompt_type: promptType,
        }),
        headers,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            setStreaming(true)
            return
          } else if (response.status >= 400) {
            throw new Error(`${response.status} ${await response.text()}`)
          }
        },
        onmessage(msg) {
          if (msg.event === 'FatalError') {
            throw new Error(msg.data)
          }
          if (!msg.data) {
            return
          }
          try {
            const newContent = JSON.parse(msg.data)
            tmpResultBuffer += newContent
            setResult(md.render(tmpResultBuffer))

            // 收到第一个词立即结束加载状态
            if (firstChunk) {
              firstChunk = false
              setResultLoading(false)
              setLoading(false)
            }
          } catch (error) {
            console.error(error)
          }
        },
        onclose() {
          setStreaming(false)
          // 保存历史记录（仅当有结果时）
          if (tmpResultBuffer && promptType) {
            const config = getDivinationOption(promptType)
            if (config) {
              saveHistory({
                type: promptType,
                title: config.title,
                prompt: params.prompt || '',
                result: tmpResultBuffer,
              })
            }
          }
        },
        onerror(err) {
          setResult(`占卜失败: ${err.message}`)
          setStreaming(false)
          throw new Error(`占卜失败: ${err.message}`)
        },
      })
    } catch (error: any) {
      console.error(error)
      setResult(error.message || '占卜失败')
      setStreaming(false)
    } finally {
      setLoading(false)
      setResultLoading(false)
      setStreaming(false)
    }
  }

  return {
    result,
    loading,
    resultLoading,
    streaming,
    showDrawer,
    setShowDrawer,
    onSubmit,
  }
}
