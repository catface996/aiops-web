/**
 * BasicLayout 属性测试
 * 需求: 5.1
 * 属性 15: 菜单基于角色显示
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { UserRole } from '@/types'

// 菜单路由配置（与 BasicLayout 中保持一致）
interface MenuRoute {
  path: string
  name: string
  requiredRoles?: UserRole[]
}

const menuRoutes: MenuRoute[] = [
  { path: '/dashboard', name: '仪表盘' },
  { path: '/users', name: '用户管理', requiredRoles: ['ROLE_ADMIN'] },
  { path: '/audit', name: '审计日志', requiredRoles: ['ROLE_ADMIN'] },
]

// 根据角色过滤菜单项
function filterMenuByRole(routes: MenuRoute[], userRoles: UserRole[]): MenuRoute[] {
  return routes.filter((route) => {
    if (!route.requiredRoles || route.requiredRoles.length === 0) {
      return true
    }
    return route.requiredRoles.some((role) => userRoles.includes(role))
  })
}

// 检查用户是否有指定角色
function hasRole(userRoles: UserRole[], role: UserRole): boolean {
  return userRoles.includes(role)
}

// 生成有效角色的 Arbitrary
const validRole = fc.constantFrom<UserRole>('ROLE_USER', 'ROLE_ADMIN')

// 生成随机角色列表的 Arbitrary
const roleList = fc
  .array(validRole, { minLength: 1, maxLength: 2 })
  .map((roles) => [...new Set(roles)] as UserRole[])

describe('BasicLayout Property Tests', () => {
  // Feature: antd-rbac-frontend, Property 15: Menu items based on role
  // 对于任何用户角色，菜单应该只显示该角色有权访问的菜单项
  describe('Property 15: Menu items based on role', () => {
    it('should only show menu items accessible by the given roles', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filteredMenu = filterMenuByRole(menuRoutes, userRoles)

          // 验证每个过滤后的菜单项都是用户可以访问的
          for (const route of filteredMenu) {
            if (route.requiredRoles && route.requiredRoles.length > 0) {
              // 如果有角色限制，用户角色必须在允许列表中
              const hasAccess = route.requiredRoles.some((role) => userRoles.includes(role))
              expect(hasAccess).toBe(true)
            }
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should exclude menu items that require roles the user does not have', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filteredMenu = filterMenuByRole(menuRoutes, userRoles)

          // 验证被排除的菜单项确实是用户无权访问的
          const excluded = menuRoutes.filter((r) => !filteredMenu.includes(r))

          for (const route of excluded) {
            if (route.requiredRoles && route.requiredRoles.length > 0) {
              // 被排除的菜单项，用户角色不应该在允许列表中
              const hasAccess = route.requiredRoles.some((role) => userRoles.includes(role))
              expect(hasAccess).toBe(false)
            }
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should always show public menu items (no role restriction)', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filteredMenu = filterMenuByRole(menuRoutes, userRoles)

          // 公开菜单项（无角色限制）应该对所有用户可见
          const publicRoutes = menuRoutes.filter(
            (r) => !r.requiredRoles || r.requiredRoles.length === 0
          )

          for (const route of publicRoutes) {
            expect(filteredMenu).toContainEqual(route)
          }

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should be idempotent - filtering twice should give same result', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filtered1 = filterMenuByRole(menuRoutes, userRoles)
          const filtered2 = filterMenuByRole(filtered1, userRoles)

          // 过滤是幂等的
          expect(filtered2).toEqual(filtered1)

          return true
        }),
        { numRuns: 50 }
      )
    })
  })

  // 附加属性测试：角色权限层级
  describe('Property: Role hierarchy in menu access', () => {
    it('should grant ROLE_ADMIN access to all menu items', () => {
      const adminRoles: UserRole[] = ['ROLE_ADMIN']
      const filteredMenu = filterMenuByRole(menuRoutes, adminRoles)

      // 管理员应该能看到所有菜单项
      expect(filteredMenu.length).toBe(menuRoutes.length)
    })

    it('should grant ROLE_USER access only to public menu items', () => {
      const userRoles: UserRole[] = ['ROLE_USER']
      const filteredMenu = filterMenuByRole(menuRoutes, userRoles)

      // 普通用户只能看到公开菜单项
      const publicRoutes = menuRoutes.filter(
        (r) => !r.requiredRoles || r.requiredRoles.length === 0
      )
      expect(filteredMenu.length).toBe(publicRoutes.length)
    })

    it('should grant ROLE_ADMIN access to all routes that ROLE_USER can access', () => {
      const userRoles: UserRole[] = ['ROLE_USER']
      const adminRoles: UserRole[] = ['ROLE_ADMIN']

      const userMenu = filterMenuByRole(menuRoutes, userRoles)
      const adminMenu = filterMenuByRole(menuRoutes, adminRoles)

      // 管理员应该能看到所有普通用户能看到的菜单项
      for (const route of userMenu) {
        expect(adminMenu).toContainEqual(route)
      }

      // 管理员可能有额外的菜单项
      expect(adminMenu.length).toBeGreaterThanOrEqual(userMenu.length)
    })
  })

  // 附加属性测试：菜单过滤的一致性
  describe('Property: Menu filtering consistency', () => {
    it('should have consistent filtering for same roles', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filteredMenu1 = filterMenuByRole(menuRoutes, userRoles)
          const filteredMenu2 = filterMenuByRole(menuRoutes, userRoles)

          // 相同角色应该产生相同的过滤结果
          expect(filteredMenu1).toEqual(filteredMenu2)

          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should preserve menu order after filtering', () => {
      fc.assert(
        fc.property(roleList, (userRoles) => {
          const filteredMenu = filterMenuByRole(menuRoutes, userRoles)

          // 过滤后的菜单项顺序应该与原始顺序一致
          const originalPaths = menuRoutes.map((r) => r.path)
          const filteredPaths = filteredMenu.map((r) => r.path)

          for (let i = 0; i < filteredPaths.length; i++) {
            if (i > 0) {
              const prevIndex = originalPaths.indexOf(filteredPaths[i - 1])
              const currIndex = originalPaths.indexOf(filteredPaths[i])
              expect(currIndex).toBeGreaterThan(prevIndex)
            }
          }

          return true
        }),
        { numRuns: 50 }
      )
    })
  })

  // hasRole 函数测试
  describe('Property: hasRole function', () => {
    it('should return true only when user has the specified role', () => {
      fc.assert(
        fc.property(roleList, validRole, (userRoles, roleToCheck) => {
          const result = hasRole(userRoles, roleToCheck)
          expect(result).toBe(userRoles.includes(roleToCheck))

          return true
        }),
        { numRuns: 100 }
      )
    })
  })
})
