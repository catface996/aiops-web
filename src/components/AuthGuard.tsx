/**
 * 路由守卫组件
 * 需求: 3.4, 4.3, 15.1
 */
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import type { UserRole } from '@/types'

/**
 * AuthGuard 组件属性
 */
interface AuthGuardProps {
  /**
   * 子组件
   */
  children: React.ReactNode

  /**
   * 允许访问的角色列表
   * 如果未指定，则只检查是否登录
   */
  roles?: UserRole[]
}

/**
 * 路由守卫组件
 * 用于保护需要认证或特定角色才能访问的路由
 *
 * 需求 3.4: 退出后立即阻止访问受保护的资源
 * 需求 4.3: 未授权用户尝试访问受保护资源时被拒绝
 * 需求 15.1: 未登录用户访问受保护页面时重定向到登录页并记录原始路径
 *
 * @example
 * ```tsx
 * // 只检查是否登录
 * <AuthGuard>
 *   <Dashboard />
 * </AuthGuard>
 *
 * // 检查特定角色
 * <AuthGuard roles={['ROLE_ADMIN']}>
 *   <AdminPanel />
 * </AuthGuard>
 * ```
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, roles }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasAnyRole } = usePermission()
  const location = useLocation()

  // 正在加载认证状态时显示加载指示器
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  // 需求 15.1: 未登录用户访问受保护页面时重定向到登录页
  // 需求 3.4: 退出后立即阻止访问受保护的资源
  if (!isAuthenticated) {
    // 记录原始路径，登录后可以重定向回来
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 需求 4.3: 如果指定了角色要求，检查用户是否有权限
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      // 无权限时重定向到 403 页面
      return <Navigate to="/403" replace />
    }
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>
}

export default AuthGuard
