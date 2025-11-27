/**
 * 认证上下文
 * 需求: 2.2, 2.6, 3.1, 3.2, 4.1
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { login as loginApi, logout as logoutApi, register as registerApi } from '@/services/auth'
import { validateSession } from '@/services/session'
import { tokenStorage, userStorage, clearAuthStorage } from '@/utils/storage'

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * 认证上下文接口
 */
interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  checkAuth: () => Promise<boolean>
}

/**
 * 创建认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 认证提供者组件
 * 需求 2.6: 从 LocalStorage 恢复用户状态
 * 需求 4.1: 提供用户认证状态
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * 需求 2.6: 组件挂载时从 LocalStorage 恢复用户状态
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenStorage.get()
      const storedUser = userStorage.get()

      if (storedToken && storedUser) {
        try {
          // 验证 Token 有效性
          const result = await validateSession()
          if (result.valid && result.user) {
            setUser(result.user)
          } else {
            // Token 无效，清除存储
            clearAuthStorage()
          }
        } catch {
          // 验证失败，清除存储
          clearAuthStorage()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  /**
   * 登录方法
   * 需求 2.2: 调用后端登录 API
   * 需求 2.6: 将 Token 和用户信息存储到 LocalStorage
   */
  const login = useCallback(async (data: LoginRequest) => {
    const response = await loginApi(data)

    // 存储 Token 和用户信息
    tokenStorage.set(response.token)
    userStorage.set(response.user)

    setUser(response.user)
  }, [])

  /**
   * 登出方法
   * 需求 3.1: 调用后端退出 API 使 Session 失效
   * 需求 3.2: 清除客户端 LocalStorage 中的 Token
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // 忽略 API 错误，继续清除本地状态
    }
    // 无论 API 是否成功，都清除本地状态
    clearAuthStorage()
    setUser(null)
  }, [])

  /**
   * 注册方法
   * 需求 1.2: 调用后端注册 API
   */
  const register = useCallback(async (data: RegisterRequest) => {
    await registerApi(data)
  }, [])

  /**
   * 检查认证状态
   * 需求 6.1: 验证 Token 有效性
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = tokenStorage.get()
    if (!token) {
      return false
    }

    try {
      const result = await validateSession()
      if (result.valid && result.user) {
        setUser(result.user)
        userStorage.set(result.user)
        return true
      } else {
        clearAuthStorage()
        setUser(null)
        return false
      }
    } catch {
      clearAuthStorage()
      setUser(null)
      return false
    }
  }, [])

  /**
   * 计算是否已认证
   */
  const isAuthenticated = useMemo(() => !!user, [user])

  /**
   * 上下文值
   */
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      checkAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, register, checkAuth]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

/**
 * 使用认证上下文的 Hook
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
