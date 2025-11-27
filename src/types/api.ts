import type { User, UserRole } from './user'

/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
  code: number // 0 表示成功，其他为错误码
  message: string
  data: T | null
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  code: number
  message: string
  errors?: Record<string, string> // 字段级错误
}

// ==================== 认证相关 ====================

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword?: string // 前端验证用，后端可能不需要
}

/**
 * 注册响应
 */
export interface RegisterResponse {
  userId: number
  username: string
  email: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  identifier?: string // 用户名或邮箱（二选一）
  username?: string // 用户名（二选一）
  password: string
  rememberMe?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  user: User
}

/**
 * 登出响应
 */
export type LogoutResponse = null

// ==================== 会话相关 ====================

/**
 * 验证会话响应
 */
export interface ValidateSessionResponse {
  valid: boolean
  user?: User
}

/**
 * 强制登出其他设备响应
 */
export interface ForceLogoutOthersResponse {
  loggedOutCount: number
}

// ==================== 管理员相关 ====================

/**
 * 用户列表项（管理员视图）
 */
export interface AdminUserItem {
  userId: number
  username: string
  email: string
  role: UserRole
  isLocked: boolean
  lockUntil?: string
  createdAt: string
  lastLoginAt?: string
}

/**
 * 用户列表响应
 */
export interface AdminUserListResponse {
  users: AdminUserItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 解锁账号响应
 */
export interface UnlockAccountResponse {
  success: boolean
  message: string
}

// ==================== 审计日志相关 ====================

/**
 * 审计日志操作类型
 */
export const AuditActionType = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  ACCOUNT_LOCK: 'ACCOUNT_LOCK',
  ACCOUNT_UNLOCK: 'ACCOUNT_UNLOCK',
} as const

export type AuditActionType = (typeof AuditActionType)[keyof typeof AuditActionType]

/**
 * 审计日志结果
 */
export const AuditResult = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
} as const

export type AuditResult = (typeof AuditResult)[keyof typeof AuditResult]

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
  id: number
  timestamp: string
  username: string
  actionType: AuditActionType
  ipAddress: string
  result: AuditResult
  details?: string
}

/**
 * 审计日志列表响应
 */
export interface AuditLogListResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
}

/**
 * 审计日志查询参数
 */
export interface AuditLogQuery {
  username?: string
  actionType?: AuditActionType
  startTime?: string
  endTime?: string
  page?: number
  pageSize?: number
}
