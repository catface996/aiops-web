/**
 * 用户角色
 */
export const UserRole = {
  ROLE_USER: 'ROLE_USER',
  ROLE_ADMIN: 'ROLE_ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

/**
 * 用户信息接口
 */
export interface User {
  userId: number
  username: string
  email: string
  role: UserRole
  createdAt?: string
  lastLoginAt?: string
  isLocked?: boolean
  lockUntil?: string
}

/**
 * 用户登录信息（存储在 LocalStorage 中）
 */
export interface UserInfo {
  user: User
  token: string
}
