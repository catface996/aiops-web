/**
 * 资源格式化工具函数
 * 需求: REQ-FR-017, REQ-FR-054
 */
import {
  ResourceStatus,
  ResourceStatusDisplay,
  ResourceStatusColor,
} from '@/types'

/**
 * 格式化日期时间
 * @param dateStr ISO 8601 格式的日期字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return '-'
  }
}

/**
 * 格式化日期
 * @param dateStr ISO 8601 格式的日期字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch {
    return '-'
  }
}

/**
 * 格式化相对时间
 * @param dateStr ISO 8601 格式的日期字符串
 * @returns 相对时间字符串（如"刚刚"、"5分钟前"）
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`

    return formatDateTime(dateStr)
  } catch {
    return '-'
  }
}

/**
 * 格式化资源状态显示文本
 * @param status 资源状态
 * @returns 状态显示文本
 */
export function formatResourceStatus(status: ResourceStatus | string): string {
  const validStatus = status as ResourceStatus
  return ResourceStatusDisplay[validStatus] || status
}

/**
 * 获取资源状态颜色
 * @param status 资源状态
 * @returns Ant Design Badge 颜色
 */
export function getResourceStatusColor(status: ResourceStatus | string): string {
  const validStatus = status as ResourceStatus
  return ResourceStatusColor[validStatus] || 'default'
}

/**
 * 高亮搜索关键词
 * 需求: REQ-FR-017 - 搜索结果高亮
 * @param text 原始文本
 * @param keyword 搜索关键词
 * @returns 包含高亮标记的HTML字符串
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword || !text) return text

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * 解析资源属性JSON字符串
 * @param attributes JSON字符串
 * @returns 解析后的对象
 */
export function parseResourceAttributes(
  attributes: string | null | undefined
): Record<string, unknown> {
  if (!attributes) return {}

  try {
    return JSON.parse(attributes) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * 序列化资源属性为JSON字符串
 * @param attributes 属性对象
 * @returns JSON字符串
 */
export function stringifyResourceAttributes(
  attributes: Record<string, unknown> | null | undefined
): string {
  if (!attributes || Object.keys(attributes).length === 0) return '{}'

  try {
    return JSON.stringify(attributes)
  } catch {
    return '{}'
  }
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i]
}
