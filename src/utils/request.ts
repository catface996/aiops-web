/**
 * HTTP 请求客户端配置
 * 需求: 9.1, 9.2, 9.3, 9.4, 9.5, 6.1
 */
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { tokenStorage, clearAuthStorage } from './storage'
import type { ApiResponse, ErrorResponse } from '@/types'

/**
 * 已处理的错误类
 * 用于标记拦截器已经显示了 toast 的错误，业务代码无需再次显示
 */
export class HandledError extends Error {
  public readonly handled = true
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HandledError'
    this.status = status
  }
}

/**
 * 检查错误是否已被处理（拦截器已显示 toast）
 */
export function isHandledError(error: unknown): error is HandledError {
  return error instanceof HandledError
}

// API 基础路径
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 创建 Axios 实例
// 需求 REQ-NFR-014-A: 30秒超时
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 重试配置
 * 需求 REQ-NFR-014-B: 自动重试机制（非4xx错误重试2次）
 */
const MAX_RETRIES = 2
const RETRY_DELAY_BASE = 1000 // 1秒基础延迟

/**
 * 判断错误是否应该重试
 * 4xx 错误（客户端错误）不重试，其他错误重试
 */
function shouldRetry(error: AxiosError): boolean {
  if (!error.response) {
    // 网络错误，应该重试
    return true
  }
  
  const status = error.response.status
  // 4xx 客户端错误不重试，5xx 服务器错误重试
  return status >= 500
}

/**
 * 计算重试延迟（指数退避）
 * 第1次重试: 1秒
 * 第2次重试: 2秒
 */
function getRetryDelay(retryCount: number): number {
  return RETRY_DELAY_BASE * Math.pow(2, retryCount - 1)
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 用于在测试中控制重定向行为
let redirectHandler: (path: string) => void = (path: string) => {
  window.location.href = path
}

export function setRedirectHandler(handler: (path: string) => void): void {
  redirectHandler = handler
}

/**
 * 请求拦截器
 * 需求 9.1: 自动在请求头中添加 Authorization Bearer Token
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 开发环境下打印请求日志
    if (import.meta.env.DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 需求 9.2, 9.3, 9.4, 9.5, 6.1, 11.1
 * 需求 REQ-NFR-014: 网络错误处理
 * 需求 REQ-NFR-014-A: 网络超时处理
 * 需求 REQ-NFR-014-B: 请求重试机制
 * 需求 REQ-NFR-015: 表单验证错误
 * 需求 REQ-NFR-016: 权限错误处理
 * 需求 REQ-NFR-017: 404错误处理
 * 需求 REQ-NFR-019: 并发冲突处理
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { data, status } = response

    // 开发环境下打印响应日志
    if (import.meta.env.DEV) {
      console.log(`[Response] ${response.config.url}`, data)
    }

    // 204 No Content 表示成功但无返回数据（如 DELETE 请求）
    if (status === 204) {
      return response
    }

    // 检查业务状态码
    if (data && data.code !== 0) {
      // 业务错误
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return response
  },
  async (error: AxiosError<ErrorResponse>) => {
    const { config, response } = error

    // 需求 REQ-NFR-014-B: 重试机制
    // 检查是否应该重试
    if (config && shouldRetry(error)) {
      const retryCount = (config as any).__retryCount || 0
      
      if (retryCount < MAX_RETRIES) {
        // 增加重试计数
        (config as any).__retryCount = retryCount + 1
        
        // 计算延迟时间
        const delayTime = getRetryDelay(retryCount + 1)
        
        // 开发环境下打印重试日志
        if (import.meta.env.DEV) {
          console.log(`[Retry] Attempt ${retryCount + 1}/${MAX_RETRIES} after ${delayTime}ms for ${config.url}`)
        }
        
        // 等待后重试
        await delay(delayTime)
        return request(config)
      }
    }

    // 需求 REQ-NFR-014-A: 超时错误处理
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message.error('请求超时，请检查网络连接后重试')
      return Promise.reject(new HandledError('请求超时', 0))
    }

    if (!response) {
      // 需求 REQ-NFR-014: 网络错误
      message.error('网络连接失败，请检查网络设置')
      return Promise.reject(new HandledError('网络连接失败', 0))
    }

    const { status, data } = response

    switch (status) {
      case 400:
        // 需求 REQ-NFR-015: 请求参数无效
        message.error(data?.message || '请求参数无效')
        return Promise.reject(new HandledError(data?.message || '请求参数无效', 400))

      case 401:
        // 需求 9.2, 6.1: 401 错误清除 Token 并重定向到登录页
        clearAuthStorage()
        message.error('会话已过期，请重新登录')
        redirectHandler('/login')
        return Promise.reject(new HandledError('会话已过期', 401))

      case 403: {
        // 需求 REQ-NFR-016: 403 错误处理
        // 对于操作类请求（POST/PUT/DELETE），使用 toast 提示而不是跳转
        // 对于页面访问类请求（GET），跳转到 403 页面
        const method = error.config?.method?.toUpperCase()
        const permissionMsg = data?.message || '您没有权限执行此操作'
        if (method === 'GET') {
          message.error('您没有权限访问此资源')
          redirectHandler('/403')
        } else {
          message.error(permissionMsg)
        }
        return Promise.reject(new HandledError(permissionMsg, 403))
      }

      case 404:
        // 需求 REQ-NFR-017: 404错误处理
        message.error(data?.message || '请求的资源不存在')
        return Promise.reject(new HandledError(data?.message || '请求的资源不存在', 404))

      case 409:
        // 需求 REQ-NFR-019: 并发冲突处理（乐观锁）
        const conflictMsg = data?.message || '数据已被其他用户修改，请刷新后重试'
        message.error(conflictMsg)
        return Promise.reject(new HandledError(conflictMsg, 409))

      case 423:
        // 需求 11.1: 账号锁定错误
        const lockMessage = data?.message || '账号已锁定，请稍后重试'
        message.error(lockMessage)
        return Promise.reject(new HandledError(lockMessage, 423))

      case 500:
        // 需求 9.4: 500 错误显示服务器错误消息
        message.error(data?.message || '服务器错误，请稍后重试')
        return Promise.reject(new HandledError(data?.message || '服务器错误', 500))

      default:
        // 其他错误
        message.error(data?.message || '请求失败，请稍后重试')
        return Promise.reject(new HandledError(data?.message || '请求失败', status))
    }
  }
)

export default request

// 导出便捷方法
export const get = <T>(url: string, params?: Record<string, unknown>) =>
  request.get<ApiResponse<T>>(url, { params }).then((res) => res.data)

export const post = <T>(url: string, data?: unknown) =>
  request.post<ApiResponse<T>>(url, data).then((res) => res.data)

export const put = <T>(url: string, data?: unknown) =>
  request.put<ApiResponse<T>>(url, data).then((res) => res.data)

export const del = <T>(url: string) => request.delete<ApiResponse<T>>(url).then((res) => res.data)
