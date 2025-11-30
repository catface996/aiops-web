/**
 * 权限守卫组件
 * 需求: REQ-FR-035, REQ-FR-036, REQ-FR-045, REQ-FR-046, REQ-FR-059
 */
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { ResourceDTO } from '@/types'
import { UserRole } from '@/types'

export type PermissionLevel = 'owner' | 'viewer' | 'admin'

export interface PermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode
  /** 资源对象 */
  resource: ResourceDTO
  /** 所需权限级别 */
  requiredPermission: PermissionLevel
  /** 无权限时显示的回退内容 */
  fallback?: React.ReactNode
}

/**
 * 检查用户是否为资源Owner
 */
export function isResourceOwner(resource: ResourceDTO, userId: number): boolean {
  return resource.createdBy === userId
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(role: string | undefined): boolean {
  return role === UserRole.ROLE_ADMIN
}

/**
 * PermissionGuard 组件
 * 根据权限显示/隐藏子组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  requiredPermission,
  fallback = null,
}) => {
  const { user } = useAuth()

  const hasPermission = (): boolean => {
    if (!user) return false

    // 管理员拥有所有权限
    if (isAdmin(user.role)) return true

    switch (requiredPermission) {
      case 'owner':
        // 只有Owner才有权限
        return isResourceOwner(resource, user.userId)
      case 'admin':
        // 只有管理员才有权限
        return isAdmin(user.role)
      case 'viewer':
        // 所有已登录用户都有查看权限
        return true
      default:
        return false
    }
  }

  if (hasPermission()) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * useResourcePermission Hook
 * 检查当前用户对资源的权限
 */
export function useResourcePermission(resource: ResourceDTO | null): {
  isOwner: boolean
  isAdmin: boolean
  canEdit: boolean
  canDelete: boolean
  canChangeStatus: boolean
  canViewSensitive: boolean
} {
  const { user } = useAuth()

  if (!user || !resource) {
    return {
      isOwner: false,
      isAdmin: false,
      canEdit: false,
      canDelete: false,
      canChangeStatus: false,
      canViewSensitive: false,
    }
  }

  const userIsOwner = isResourceOwner(resource, user.userId)
  const userIsAdmin = isAdmin(user.role)

  return {
    isOwner: userIsOwner,
    isAdmin: userIsAdmin,
    canEdit: userIsOwner || userIsAdmin,
    canDelete: userIsOwner || userIsAdmin,
    canChangeStatus: userIsOwner || userIsAdmin,
    canViewSensitive: userIsOwner || userIsAdmin,
  }
}

export default PermissionGuard
