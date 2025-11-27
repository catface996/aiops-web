/**
 * usePermission Hook 测试
 * 需求: 4.2, 4.3
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { usePermission } from './usePermission'
import type { User, RouteConfig } from '@/types'

// Mock services
vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}))

vi.mock('@/services/session', () => ({
  validateSession: vi.fn(),
}))

vi.mock('@/utils/storage', () => ({
  tokenStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  userStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  clearAuthStorage: vi.fn(),
}))

import { validateSession } from '@/services/session'
import { tokenStorage, userStorage } from '@/utils/storage'

// 测试组件
const TestComponent: React.FC<{
  testRole?: string
  testRoles?: string[]
  testRoute?: RouteConfig
}> = ({ testRole, testRoles, testRoute }) => {
  const { hasRole, hasAnyRole, canAccessRoute, role, isAdmin } = usePermission()

  return (
    <div>
      <div data-testid="role">{role ?? 'null'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
      {testRole && (
        <div data-testid="hasRole">{hasRole(testRole as 'ROLE_USER' | 'ROLE_ADMIN') ? 'true' : 'false'}</div>
      )}
      {testRoles && (
        <div data-testid="hasAnyRole">
          {hasAnyRole(testRoles as ('ROLE_USER' | 'ROLE_ADMIN')[]) ? 'true' : 'false'}
        </div>
      )}
      {testRoute && <div data-testid="canAccessRoute">{canAccessRoute(testRoute) ? 'true' : 'false'}</div>}
    </div>
  )
}

describe('usePermission Hook', () => {
  const mockUserRegular: User = {
    userId: 1,
    username: 'regularuser',
    email: 'user@example.com',
    role: 'ROLE_USER',
  }

  const mockUserAdmin: User = {
    userId: 2,
    username: 'adminuser',
    email: 'admin@example.com',
    role: 'ROLE_ADMIN',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tokenStorage.get).mockReturnValue(null)
    vi.mocked(userStorage.get).mockReturnValue(null)
  })

  describe('role and isAdmin', () => {
    it('should return null role when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('role')).toHaveTextContent('null')
      })

      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false')
    })

    it('should return correct role for regular user', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('role')).toHaveTextContent('ROLE_USER')
      })

      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false')
    })

    it('should return correct role for admin user', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserAdmin)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserAdmin })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('role')).toHaveTextContent('ROLE_ADMIN')
      })

      expect(screen.getByTestId('isAdmin')).toHaveTextContent('true')
    })
  })

  // 需求 4.2: 根据用户角色过滤可访问的路由
  describe('hasRole', () => {
    it('should return false when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent testRole="ROLE_USER" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasRole')).toHaveTextContent('false')
      })
    })

    it('should return true when user has the specified role', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRole="ROLE_USER" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasRole')).toHaveTextContent('true')
      })
    })

    it('should return false when user does not have the specified role', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRole="ROLE_ADMIN" />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasRole')).toHaveTextContent('false')
      })
    })
  })

  describe('hasAnyRole', () => {
    it('should return false when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent testRoles={['ROLE_USER', 'ROLE_ADMIN']} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasAnyRole')).toHaveTextContent('false')
      })
    })

    it('should return true when user has any of the specified roles', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRoles={['ROLE_USER', 'ROLE_ADMIN']} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasAnyRole')).toHaveTextContent('true')
      })
    })

    it('should return false when user does not have any of the specified roles', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRoles={['ROLE_ADMIN']} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('hasAnyRole')).toHaveTextContent('false')
      })
    })
  })

  // 需求 4.3: 未授权用户尝试访问受保护资源时被拒绝
  describe('canAccessRoute', () => {
    const publicRoute: RouteConfig = {
      path: '/public',
      element: null,
    }

    const userRoute: RouteConfig = {
      path: '/dashboard',
      element: null,
      requiredRoles: ['ROLE_USER', 'ROLE_ADMIN'],
    }

    const adminRoute: RouteConfig = {
      path: '/admin',
      element: null,
      requiredRoles: ['ROLE_ADMIN'],
    }

    it('should allow access to public routes when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent testRoute={publicRoute} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('canAccessRoute')).toHaveTextContent('true')
      })
    })

    it('should deny access to protected routes when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent testRoute={userRoute} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('canAccessRoute')).toHaveTextContent('false')
      })
    })

    it('should allow access to user routes for regular user', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRoute={userRoute} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('canAccessRoute')).toHaveTextContent('true')
      })
    })

    it('should deny access to admin routes for regular user', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(
        <AuthProvider>
          <TestComponent testRoute={adminRoute} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('canAccessRoute')).toHaveTextContent('false')
      })
    })

    it('should allow access to admin routes for admin user', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserAdmin)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserAdmin })

      render(
        <AuthProvider>
          <TestComponent testRoute={adminRoute} />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('canAccessRoute')).toHaveTextContent('true')
      })
    })
  })
})
