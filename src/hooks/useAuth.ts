/**
 * useAuth Hook
 * 封装 AuthContext，提供便捷的认证状态和方法访问
 * 需求: 4.2
 */
import { useAuthContext } from '@/contexts/AuthContext'

/**
 * useAuth Hook
 * 提供认证相关的状态和方法
 *
 * @returns {Object} 认证状态和方法
 * - user: 当前登录用户信息
 * - isAuthenticated: 是否已认证
 * - isLoading: 是否正在加载
 * - login: 登录方法
 * - logout: 登出方法
 * - register: 注册方法
 * - checkAuth: 检查认证状态方法
 */
export const useAuth = () => {
  return useAuthContext()
}

export default useAuth
