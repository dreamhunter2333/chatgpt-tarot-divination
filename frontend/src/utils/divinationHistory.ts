export interface DivinationHistoryItem {
  id: string
  type: string
  title: string
  prompt: string
  result: string
  timestamp: number
}

const HISTORY_KEY_PREFIX = 'divination_history_'
const MAX_HISTORY_COUNT = 10

/**
 * 生成唯一ID
 * 使用时间戳 + 随机数确保唯一性，避免竞态条件
 */
function generateUniqueId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${random}`
}

/**
 * 获取指定类型的历史记录
 */
export function getHistoryByType(type: string): DivinationHistoryItem[] {
  try {
    const data = localStorage.getItem(`${HISTORY_KEY_PREFIX}${type}`)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to get history:', error)
    return []
  }
}

/**
 * 获取所有类型的历史记录（合并并按时间排序）
 */
export function getHistory(): DivinationHistoryItem[] {
  try {
    const allHistory: DivinationHistoryItem[] = []

    // 遍历 localStorage 获取所有历史记录
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          const items = JSON.parse(data) as DivinationHistoryItem[]
          allHistory.push(...items)
        }
      }
    }

    // 按时间倒序排序
    return allHistory.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to get history:', error)
    return []
  }
}

/**
 * 保存历史记录（按类型分开保存）
 */
export function saveHistory(item: Omit<DivinationHistoryItem, 'id' | 'timestamp'>): void {
  try {
    const history = getHistoryByType(item.type)
    const timestamp = Date.now()

    // 使用统一的时间戳和生成的唯一ID
    const newItem: DivinationHistoryItem = {
      ...item,
      id: generateUniqueId(),
      timestamp,
    }

    // 添加到开头
    history.unshift(newItem)

    // 每个类型保留最近10条
    const limitedHistory = history.slice(0, MAX_HISTORY_COUNT)

    localStorage.setItem(`${HISTORY_KEY_PREFIX}${item.type}`, JSON.stringify(limitedHistory))
  } catch (error) {
    console.error('Failed to save history:', error)
  }
}

/**
 * 删除指定历史记录
 */
export function deleteHistoryItem(id: string, type: string): void {
  try {
    const history = getHistoryByType(type)
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem(`${HISTORY_KEY_PREFIX}${type}`, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete history item:', error)
  }
}

/**
 * 清空所有历史记录
 */
export function clearHistory(): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to clear history:', error)
  }
}
