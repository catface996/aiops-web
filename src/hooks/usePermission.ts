/**
 * usePermission Hook
 * 提供权限检查功能
 * 需求: 4.2, 4.3
 */
import { useMemo, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import type { UserRole, RouteConfig } from '@/types'

/**
 * 权限检查结果接口
 */
interface PermissionResult {
  /**
   * 检查用户是否具有指定角色
   * @param role 要检查的角色
   * @returns 是否具有该角色
   */
  hasRole: (role: UserRole) => boolean

  /**
   * 检查用户是否具有任意一个指定角色
   * @param roles 要检查的角色列表
   * @returns 是否具有其中任意一个角色
   */
  hasAnyRole: (roles: UserRole[]) => boolean

  /**
   * 检查用户是否可以访问指定路由
   * @param route 路由配置
   * @returns 是否可以访问
   */
  canAccessRoute: (route: RouteConfig) => boolean

  /**
   * 当前用户角色
   */
  role: UserRole | null

  /**
   * 是否是管理员
   */
  isAdmin: boolean
}

/**
 * usePermission Hook
 * 提供基于角色的权限检查功能
 *
 * @returns {PermissionResult} 权限检查方法和状态
 *
 * @example
 * ```tsx
 * const { hasRole, hasAnyRole, canAccessRoute, isAdmin } = usePermission()
 *
 * // 检查是否是管理员
 * if (isAdmin) {
 *   // 显示管理员功能
 * }
 *
 * // 检查是否具有特定角色
 * if (hasRole('ROLE_ADMIN')) {
 *   // 显示管理员内容
 * }
 *
 * // 检查是否具有任意角色
 * if (hasAnyRole(['ROLE_USER', 'ROLE_ADMIN'])) {
 *   // 显示用户内容
 * }
 *
 * // 检查路由访问权限
 * const route = { path: '/admin', requiredRoles: ['ROLE_ADMIN'] }
 * if (canAccessRoute(route)) {
 *   // 允许访问
 * }
 * ```
 */
export const usePermission = (): PermissionResult => {
  const { user } = useAuthContext()

  /**
   * 当前用户角色
   */
  const role = useMemo(() => user?.role ?? null, [user])

  /**
   * 是否是管理员
   */
  const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role])

  /**
   * 检查用户是否具有指定角色
   * 需求 4.2: 根据用户角色过滤可访问的路由
   */
  const hasRole = useCallback(
    (targetRole: UserRole): boolean => {
      if (!role) return false
      return role === targetRole
    },
    [role]
  )

  /**
   * 检查用户是否具有任意一个指定角色
   */
  const hasAnyRole = useCallback(
    (targetRoles: UserRole[]): boolean => {
      if (!role) return false
      return targetRoles.includes(role)
    },
    [role]
  )

  /**
   * 检查用户是否可以访问指定路由
   * 需求 4.3: 未授权用户尝试访问受保护资源时被拒绝
   */
  const canAccessRoute = useCallback(
    (route: RouteConfig): boolean => {
      // 如果路由没有角色限制，允许访问
      if (!route.requiredRoles || route.requiredRoles.length === 0) {
        return true
      }

      // 如果用户未登录，拒绝访问
      if (!role) {
        return false
      }

      // 检查用户角色是否在允许的角色列表中
      return route.requiredRoles.includes(role)
    },
    [role]
  )

  return {
    hasRole,
    hasAnyRole,
    canAccessRoute,
    role,
    isAdmin,
  }
}

export default usePermission
