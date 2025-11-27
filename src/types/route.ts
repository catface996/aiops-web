import type { ReactNode } from 'react'
import type { UserRole } from './user'

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string
  element?: ReactNode
  children?: RouteConfig[]
  // 访问控制
  requireAuth?: boolean // 是否需要登录
  requiredRoles?: UserRole[] // 需要的角色（满足其一即可）
  // 菜单配置
  name?: string // 菜单名称
  icon?: ReactNode // 菜单图标
  hideInMenu?: boolean // 是否在菜单中隐藏
  // 重定向
  redirect?: string
}

/**
 * 菜单项接口（用于动态生成菜单）
 */
export interface MenuItem {
  key: string
  label: string
  icon?: ReactNode
  children?: MenuItem[]
  path?: string
}
