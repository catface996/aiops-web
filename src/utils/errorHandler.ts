/**
 * 统一错误处理工具
 * 任务 30: 实现错误处理机制
 * 需求: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10
 */
import { message } from 'antd'

/**
 * 错误代码映射表
 * 将 API 错误代码映射为用户友好的错误消息
 */
export const ERROR_MESSAGES: Record<number, string> = {
  // 认证相关错误
  1001: '用户名或密码错误',
  1002: '账号已被锁定',
  1003: '会话已过期，请重新登录',
  1004: '无效的令牌',
  1005: '令牌已过期',
  1006: '用户未激活',

  // 权限相关错误
  2001: '您没有权限执行此操作',
  2002: '访问被拒绝',
  2003: '需要管理员权限',

  // 会话相关错误
  3001: '会话不存在',
  3002: '无法终止当前会话',
  3003: '会话已过期',

  // 用户相关错误
  4001: '用户不存在',
  4002: '用户名已被使用',
  4003: '邮箱已被注册',
  4004: '密码不符合要求',

  // 通用错误
  5001: '请求参数无效',
  5002: '资源不存在',
  5003: '操作失败，请稍后重试',
  5004: '服务器内部错误',
  5005: '服务暂时不可用',
}

/**
 * HTTP 状态码错误消息
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数无效',
  401: '会话已过期，请重新登录',
  403: '您没有权限访问此资源',
  404: '请求的资源不存在',
  409: '资源已存在',
  422: '请求数据验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

/**
 * 消息显示时长配置（毫秒）
 */
export const MESSAGE_DURATION = {
  success: 3, // 成功消息 3 秒
  error: 5, // 错误消息 5 秒
  warning: 4, // 警告消息 4 秒
  info: 3, // 信息消息 3 秒
} as const

/**
 * 获取错误消息
 * @param code 错误代码
 * @param defaultMessage 默认消息
 * @returns 用户友好的错误消息
 */
export function getErrorMessage(code?: number, defaultMessage?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code]
  }
  return defaultMessage || '操作失败，请稍后重试'
}

/**
 * 获取 HTTP 错误消息
 * @param status HTTP 状态码
 * @param defaultMessage 默认消息
 * @returns 用户友好的错误消息
 */
export function getHttpErrorMessage(status: number, defaultMessage?: string): string {
  return HTTP_ERROR_MESSAGES[status] || defaultMessage || '请求失败'
}

/**
 * 显示成功消息
 * @param content 消息内容
 * @param duration 显示时长（秒），默认 3 秒
 */
export function showSuccess(content: string, duration?: number): void {
  message.success({
    content,
    duration: duration ?? MESSAGE_DURATION.success,
  })
}

/**
 * 显示错误消息
 * @param content 消息内容
 * @param duration 显示时长（秒），默认 5 秒
 */
export function showError(content: string, duration?: number): void {
  message.error({
    content,
    duration: duration ?? MESSAGE_DURATION.error,
  })
}

/**
 * 显示警告消息
 * @param content 消息内容
 * @param duration 显示时长（秒），默认 4 秒
 */
export function showWarning(content: string, duration?: number): void {
  message.warning({
    content,
    duration: duration ?? MESSAGE_DURATION.warning,
  })
}

/**
 * 显示信息消息
 * @param content 消息内容
 * @param duration 显示时长（秒），默认 3 秒
 */
export function showInfo(content: string, duration?: number): void {
  message.info({
    content,
    duration: duration ?? MESSAGE_DURATION.info,
  })
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  code?: number
  message?: string
  httpStatus?: number
}

/**
 * 处理 API 错误
 * @param error 错误信息
 * @param fallbackMessage 回退消息
 */
export function handleApiError(error: ErrorInfo, fallbackMessage?: string): void {
  let errorMessage: string

  if (error.code && ERROR_MESSAGES[error.code]) {
    errorMessage = ERROR_MESSAGES[error.code]
  } else if (error.httpStatus && HTTP_ERROR_MESSAGES[error.httpStatus]) {
    errorMessage = HTTP_ERROR_MESSAGES[error.httpStatus]
  } else if (error.message) {
    errorMessage = error.message
  } else {
    errorMessage = fallbackMessage || '操作失败，请稍后重试'
  }

  showError(errorMessage)

  // 记录错误日志（开发环境）
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      displayMessage: errorMessage,
    })
  }
}

/**
 * 处理网络错误
 */
export function handleNetworkError(): void {
  showError('网络连接失败，请检查网络设置')
}

/**
 * 处理未知错误
 * @param error 错误对象
 */
export function handleUnknownError(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error('[Unknown Error]', error)
  }
  showError('发生未知错误，请稍后重试')
}
