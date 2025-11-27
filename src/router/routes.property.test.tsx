/**
 * 路由配置属性测试
 * 需求: 4.2
 * 属性 10: 路由根据角色过滤
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { filterRoutesByRole, generateMenuItems, protectedRoutes } from './routes'
import type { RouteConfig, UserRole } from '@/types'

// 生成有效角色的 Arbitrary
const validRole = fc.constantFrom<UserRole>('ROLE_USER', 'ROLE_ADMIN')

// 生成随机角色列表的 Arbitrary
const roleList = fc.array(validRole, { minLength: 0, maxLength: 2 }).map((roles) => [...new Set(roles)])

// 生成路由配置的 Arbitrary
const routeConfig = fc.record({
  path: fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 })
    .map((arr) => '/' + arr.join('')),
  requireAuth: fc.boolean(),
  requiredRoles: fc.option(roleList, { nil: undefined }),
  name: fc.option(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    { nil: undefined }
  ),
  hideInMenu: fc.option(fc.boolean(), { nil: undefined }),
})

// 生成路由配置列表的 Arbitrary
const routeConfigList = fc.array(routeConfig, { minLength: 1, maxLength: 10 })

describe('Route Configuration Property Tests', () => {
  // Feature: antd-rbac-frontend, Property 10: Routes filtered by role
  // 对于任何用户角色，系统应该只返回该角色有权访问的路由
  describe('Property 10: Routes filtered by role', () => {
    it('should only return routes accessible by the given role', () => {
      fc.assert(
        fc.property(routeConfigList, validRole, (routes, userRole) => {
          const filtered = filterRoutesByRole(routes, userRole)

          // 验证每个过滤后的路由都是用户可以访问的
          for (const route of filtered) {
            // 如果路由不需要认证，应该可以访问
            if (!route.requireAuth) {
              expect(filtered).toContain(route)
              continue
            }

            // 如果需要认证且没有角色限制，已登录用户应该可以访问
            if (!route.requiredRoles || route.requiredRoles.length === 0) {
              expect(filtered).toContain(route)
              continue
            }

            // 如果有角色限制，用户角色必须在允许列表中
            expect(route.requiredRoles).toContain(userRole)
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should exclude routes that require roles the user does not have', () => {
      fc.assert(
        fc.property(routeConfigList, validRole, (routes, userRole) => {
          const filtered = filterRoutesByRole(routes, userRole)

          // 验证被排除的路由确实是用户无权访问的
          const excluded = routes.filter((r) => !filtered.includes(r))

          for (const route of excluded) {
            // 被排除的路由必须满足以下条件之一：
            // 1. 需要认证且有角色限制，但用户角色不在允许列表中
            if (route.requireAuth && route.requiredRoles && route.requiredRoles.length > 0) {
              expect(route.requiredRoles).not.toContain(userRole)
            }
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should return empty array for unauthenticated users when all routes require auth', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1, maxLength: 10 }).map((s) => '/' + s),
              requireAuth: fc.constant(true),
              requiredRoles: roleList,
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (routes) => {
            const filtered = filterRoutesByRole(routes, null)

            // 未登录用户不能访问任何需要认证的路由
            expect(filtered).toHaveLength(0)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should return all public routes for any user', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1, maxLength: 10 }).map((s) => '/' + s),
              requireAuth: fc.constant(false),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.option(validRole, { nil: null }),
          (routes, userRole) => {
            const filtered = filterRoutesByRole(routes, userRole)

            // 公开路由对所有用户可见
            expect(filtered).toHaveLength(routes.length)

            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should be idempotent - filtering twice should give same result', () => {
      fc.assert(
        fc.property(routeConfigList, fc.option(validRole, { nil: null }), (routes, userRole) => {
          const filtered1 = filterRoutesByRole(routes, userRole)
          const filtered2 = filterRoutesByRole(filtered1, userRole)

          // 过滤是幂等的
          expect(filtered2).toEqual(filtered1)

          return true
        }),
        { numRuns: 50 }
      )
    })
  })

  // 附加属性测试：角色权限层级
  describe('Property: Role hierarchy in route access', () => {
    it('should grant ROLE_ADMIN access to all routes that ROLE_USER can access', () => {
      // 使用实际的受保护路由配置
      const userRoutes = filterRoutesByRole(protectedRoutes, 'ROLE_USER')
      const adminRoutes = filterRoutesByRole(protectedRoutes, 'ROLE_ADMIN')

      // 管理员应该能访问所有普通用户能访问的路由
      for (const route of userRoutes) {
        expect(adminRoutes).toContainEqual(route)
      }

      // 管理员可能有额外的路由（如 /users, /audit）
      expect(adminRoutes.length).toBeGreaterThanOrEqual(userRoutes.length)
    })
  })

  // 附加属性测试：菜单生成一致性
  describe('Property: Menu generation consistency', () => {
    it('should generate menu items only for visible routes', () => {
      fc.assert(
        fc.property(routeConfigList, fc.option(validRole, { nil: null }), (routes, userRole) => {
          const menuItems = generateMenuItems(routes, userRole)

          // 菜单项应该只包含可访问且未隐藏的路由
          for (const item of menuItems) {
            const route = routes.find((r) => r.path === item.key)
            expect(route).toBeDefined()
            expect(route?.hideInMenu).not.toBe(true)
            expect(route?.name).toBeDefined()
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should not include hidden routes in menu', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1, maxLength: 10 }).map((s) => '/' + s),
              requireAuth: fc.constant(false),
              hideInMenu: fc.constant(true),
              name: fc.string({ minLength: 1, maxLength: 10 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.option(validRole, { nil: null }),
          (routes, userRole) => {
            const menuItems = generateMenuItems(routes, userRole)

            // 隐藏路由不应该出现在菜单中
            expect(menuItems).toHaveLength(0)

            return true
          }
        ),
        { numRuns: 30 }
      )
    })

    it('should preserve route order in menu items', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 1, maxLength: 10 }).map((s) => '/' + s),
              requireAuth: fc.constant(false),
              hideInMenu: fc.constant(false),
              name: fc.string({ minLength: 1, maxLength: 10 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (routes) => {
            const menuItems = generateMenuItems(routes, 'ROLE_ADMIN')

            // 菜单项顺序应该与路由顺序一致
            const routePaths = routes.map((r) => r.path)
            const menuPaths = menuItems.map((m) => m.key)

            for (let i = 0; i < menuPaths.length; i++) {
              const routeIndex = routePaths.indexOf(menuPaths[i])
              if (i > 0) {
                const prevRouteIndex = routePaths.indexOf(menuPaths[i - 1])
                expect(routeIndex).toBeGreaterThan(prevRouteIndex)
              }
            }

            return true
          }
        ),
        { numRuns: 30 }
      )
    })
  })
})
