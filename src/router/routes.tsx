/**
 * 路由配置
 * 需求: 4.2, 4.3, 15.1, 15.5
 */
import { lazy } from 'react'
import type { RouteConfig } from '@/types'

// 懒加载页面组件（占位，后续任务实现具体页面）
const LoginPage = lazy(() => import('@/pages/Login'))
const RegisterPage = lazy(() => import('@/pages/Register'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const UsersPage = lazy(() => import('@/pages/Users'))
const AuditPage = lazy(() => import('@/pages/Audit'))
const ForbiddenPage = lazy(() => import('@/pages/403'))
const NotFoundPage = lazy(() => import('@/pages/404'))

/**
 * 公开路由配置
 * 不需要登录即可访问
 */
export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: <LoginPage />,
    name: '登录',
    hideInMenu: true,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    name: '注册',
    hideInMenu: true,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
    name: '无权限',
    hideInMenu: true,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
    name: '页面不存在',
    hideInMenu: true,
  },
]

/**
 * 受保护路由配置
 * 需要登录才能访问，部分需要特定角色
 */
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
    requireAuth: true,
    name: '仪表盘',
  },
  {
    path: '/users',
    element: <UsersPage />,
    requireAuth: true,
    requiredRoles: ['ROLE_ADMIN'],
    name: '用户管理',
  },
  {
    path: '/audit',
    element: <AuditPage />,
    requireAuth: true,
    requiredRoles: ['ROLE_ADMIN'],
    name: '审计日志',
  },
]

/**
 * 所有路由配置
 */
export const routes: RouteConfig[] = [
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
    hideInMenu: true,
  },
]

/**
 * 根据角色过滤可访问的路由
 */
export const filterRoutesByRole = (
  routeList: RouteConfig[],
  userRole: string | null
): RouteConfig[] => {
  return routeList.filter((route) => {
    // 如果不需要认证，则可访问
    if (!route.requireAuth) {
      return true
    }
    // 如果需要认证但用户未登录，则不可访问
    if (!userRole) {
      return false
    }
    // 如果没有指定角色要求，则已登录用户可访问
    if (!route.requiredRoles || route.requiredRoles.length === 0) {
      return true
    }
    // 检查用户角色是否在允许的角色列表中
    return route.requiredRoles.includes(userRole as 'ROLE_USER' | 'ROLE_ADMIN')
  })
}

/**
 * 生成菜单配置（排除 hideInMenu 的路由）
 */
export const generateMenuItems = (
  routeList: RouteConfig[],
  userRole: string | null
) => {
  const accessibleRoutes = filterRoutesByRole(routeList, userRole)
  return accessibleRoutes
    .filter((route) => !route.hideInMenu && route.name)
    .map((route) => ({
      key: route.path,
      label: route.name!,
      icon: route.icon,
      path: route.path,
    }))
}
