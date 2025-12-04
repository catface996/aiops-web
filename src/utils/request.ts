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
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  (error: AxiosError<ErrorResponse>) => {
    const { response } = error

    if (!response) {
      // 网络错误
      // 需求 9.5: 网络请求失败显示错误消息
      message.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 401:
        // 需求 9.2, 6.1: 401 错误清除 Token 并重定向到登录页
        clearAuthStorage()
        message.error('会话已过期，请重新登录')
        redirectHandler('/login')
        break

      case 403: {
        // 需求 9.3: 403 错误处理
        // 对于操作类请求（POST/PUT/DELETE），使用 toast 提示而不是跳转
        // 对于页面访问类请求（GET），跳转到 403 页面
        const method = error.config?.method?.toUpperCase()
        const permissionMsg = data?.message || '您没有权限执行此操作'
        if (method === 'GET') {
          message.error('您没有权限访问此资源')
          redirectHandler('/403')
        } else {
          message.error(permissionMsg)
          // 返回 HandledError，标记错误已处理，业务代码无需再显示 toast
          return Promise.reject(new HandledError(permissionMsg, 403))
        }
        break
      }

      case 423:
        // 需求 11.1: 账号锁定错误
        const lockMessage = data?.message || '账号已锁定，请稍后重试'
        message.error(lockMessage)
        break

      case 409:
        // 资源冲突（如用户名或邮箱已存在）
        message.error(data?.message || '资源已存在')
        break

      case 400:
        // 请求参数无效
        message.error(data?.message || '请求参数无效')
        break

      case 500:
      default:
        // 需求 9.4: 500 错误显示服务器错误消息
        message.error('服务器错误，请稍后重试')
        break
    }

    return Promise.reject(error)
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
