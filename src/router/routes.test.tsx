/**
 * 路由配置测试
 * 需求: 4.2, 4.3, 15.1, 15.5
 */
import { describe, it, expect } from 'vitest'
import {
  publicRoutes,
  protectedRoutes,
  routes,
  filterRoutesByRole,
  generateMenuItems,
} from './routes'

describe('Route Configuration', () => {
  describe('publicRoutes', () => {
    it('should contain login route', () => {
      const loginRoute = publicRoutes.find((r) => r.path === '/login')
      expect(loginRoute).toBeDefined()
      expect(loginRoute?.requireAuth).toBeFalsy()
    })

    it('should contain register route', () => {
      const registerRoute = publicRoutes.find((r) => r.path === '/register')
      expect(registerRoute).toBeDefined()
      expect(registerRoute?.requireAuth).toBeFalsy()
    })

    it('should contain 403 route', () => {
      const forbiddenRoute = publicRoutes.find((r) => r.path === '/403')
      expect(forbiddenRoute).toBeDefined()
      expect(forbiddenRoute?.hideInMenu).toBe(true)
    })

    it('should contain 404 route', () => {
      const notFoundRoute = publicRoutes.find((r) => r.path === '/404')
      expect(notFoundRoute).toBeDefined()
      expect(notFoundRoute?.hideInMenu).toBe(true)
    })

    it('should hide all public routes in menu', () => {
      publicRoutes.forEach((route) => {
        expect(route.hideInMenu).toBe(true)
      })
    })
  })

  describe('protectedRoutes', () => {
    it('should contain dashboard route', () => {
      const dashboardRoute = protectedRoutes.find((r) => r.path === '/dashboard')
      expect(dashboardRoute).toBeDefined()
      expect(dashboardRoute?.requireAuth).toBe(true)
      expect(dashboardRoute?.requiredRoles).toBeUndefined()
    })

    it('should contain users route with ROLE_ADMIN requirement', () => {
      const usersRoute = protectedRoutes.find((r) => r.path === '/users')
      expect(usersRoute).toBeDefined()
      expect(usersRoute?.requireAuth).toBe(true)
      expect(usersRoute?.requiredRoles).toContain('ROLE_ADMIN')
    })

    it('should contain audit route with ROLE_ADMIN requirement', () => {
      const auditRoute = protectedRoutes.find((r) => r.path === '/audit')
      expect(auditRoute).toBeDefined()
      expect(auditRoute?.requireAuth).toBe(true)
      expect(auditRoute?.requiredRoles).toContain('ROLE_ADMIN')
    })

    it('should require auth for all protected routes', () => {
      protectedRoutes.forEach((route) => {
        expect(route.requireAuth).toBe(true)
      })
    })
  })

  describe('routes', () => {
    it('should contain all public and protected routes', () => {
      const allPaths = routes.map((r) => r.path)
      expect(allPaths).toContain('/login')
      expect(allPaths).toContain('/register')
      expect(allPaths).toContain('/dashboard')
      expect(allPaths).toContain('/users')
      expect(allPaths).toContain('/audit')
      expect(allPaths).toContain('/403')
      expect(allPaths).toContain('/404')
    })

    it('should contain catch-all 404 route', () => {
      const catchAllRoute = routes.find((r) => r.path === '*')
      expect(catchAllRoute).toBeDefined()
    })
  })

  describe('filterRoutesByRole', () => {
    it('should return public routes for unauthenticated users', () => {
      const filtered = filterRoutesByRole(routes, null)
      const paths = filtered.map((r) => r.path)

      expect(paths).toContain('/login')
      expect(paths).toContain('/register')
      expect(paths).toContain('/403')
      expect(paths).toContain('/404')
      expect(paths).not.toContain('/dashboard')
      expect(paths).not.toContain('/users')
      expect(paths).not.toContain('/audit')
    })

    it('should return dashboard for ROLE_USER', () => {
      const filtered = filterRoutesByRole(protectedRoutes, 'ROLE_USER')
      const paths = filtered.map((r) => r.path)

      expect(paths).toContain('/dashboard')
      expect(paths).not.toContain('/users')
      expect(paths).not.toContain('/audit')
    })

    it('should return all protected routes for ROLE_ADMIN', () => {
      const filtered = filterRoutesByRole(protectedRoutes, 'ROLE_ADMIN')
      const paths = filtered.map((r) => r.path)

      expect(paths).toContain('/dashboard')
      expect(paths).toContain('/users')
      expect(paths).toContain('/audit')
    })

    it('should include routes without role requirements for authenticated users', () => {
      const routesWithoutRoles = protectedRoutes.filter(
        (r) => !r.requiredRoles || r.requiredRoles.length === 0
      )
      const filteredUser = filterRoutesByRole(routesWithoutRoles, 'ROLE_USER')
      const filteredAdmin = filterRoutesByRole(routesWithoutRoles, 'ROLE_ADMIN')

      expect(filteredUser.length).toBe(routesWithoutRoles.length)
      expect(filteredAdmin.length).toBe(routesWithoutRoles.length)
    })
  })

  describe('generateMenuItems', () => {
    it('should exclude hidden routes from menu', () => {
      const menuItems = generateMenuItems(publicRoutes, null)
      expect(menuItems.length).toBe(0) // All public routes are hidden
    })

    it('should generate menu items for ROLE_USER', () => {
      const menuItems = generateMenuItems(protectedRoutes, 'ROLE_USER')
      const keys = menuItems.map((item) => item.key)

      expect(keys).toContain('/dashboard')
      expect(keys).not.toContain('/users')
      expect(keys).not.toContain('/audit')
    })

    it('should generate menu items for ROLE_ADMIN', () => {
      const menuItems = generateMenuItems(protectedRoutes, 'ROLE_ADMIN')
      const keys = menuItems.map((item) => item.key)

      expect(keys).toContain('/dashboard')
      expect(keys).toContain('/users')
      expect(keys).toContain('/audit')
    })

    it('should include label and path in menu items', () => {
      const menuItems = generateMenuItems(protectedRoutes, 'ROLE_ADMIN')

      menuItems.forEach((item) => {
        expect(item.label).toBeDefined()
        expect(item.path).toBeDefined()
        expect(item.key).toBe(item.path)
      })
    })
  })
})
