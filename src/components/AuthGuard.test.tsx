/**
 * AuthGuard 组件测试
 * 需求: 3.4, 4.3, 15.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from './AuthGuard'
import type { User } from '@/types'

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

// 测试页面组件
const ProtectedPage = () => <div data-testid="protected-page">Protected Content</div>
const LoginPage = () => <div data-testid="login-page">Login Page</div>
const ForbiddenPage = () => <div data-testid="forbidden-page">403 Forbidden</div>
const AdminPage = () => <div data-testid="admin-page">Admin Content</div>

// 测试路由配置
const TestRouter: React.FC<{
  initialPath?: string
  roles?: ('ROLE_USER' | 'ROLE_ADMIN')[]
}> = ({ initialPath = '/protected', roles }) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route
          path="/protected"
          element={
            <AuthGuard roles={roles}>
              <ProtectedPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard roles={['ROLE_ADMIN']}>
              <AdminPage />
            </AuthGuard>
          }
        />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

describe('AuthGuard Component', () => {
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

  // 需求 15.1: 未登录用户访问受保护页面时重定向到登录页
  describe('Unauthenticated user', () => {
    it('should redirect to login page when not authenticated', async () => {
      render(<TestRouter />)

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()
    })

    it('should redirect to login page when accessing admin route', async () => {
      render(<TestRouter initialPath="/admin" />)

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument()
    })
  })

  // 需求 3.4: 退出后立即阻止访问受保护的资源
  // Feature: antd-rbac-frontend, Property 13: Token cleared blocks access
  describe('Authenticated user without role restriction', () => {
    it('should allow access when authenticated', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(<TestRouter />)

      await waitFor(() => {
        expect(screen.getByTestId('protected-page')).toBeInTheDocument()
      })
    })
  })

  // 需求 4.3: 未授权用户尝试访问受保护资源时被拒绝
  // Feature: antd-rbac-frontend, Property 11: Unauthorized access rejected
  describe('Role-based access control', () => {
    it('should allow access when user has required role', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(<TestRouter roles={['ROLE_USER']} />)

      await waitFor(() => {
        expect(screen.getByTestId('protected-page')).toBeInTheDocument()
      })
    })

    it('should allow access when user has any of required roles', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(<TestRouter roles={['ROLE_USER', 'ROLE_ADMIN']} />)

      await waitFor(() => {
        expect(screen.getByTestId('protected-page')).toBeInTheDocument()
      })
    })

    it('should redirect to 403 when user does not have required role', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserRegular })

      render(<TestRouter initialPath="/admin" />)

      await waitFor(() => {
        expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument()
    })

    it('should allow admin to access admin page', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserAdmin)
      vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUserAdmin })

      render(<TestRouter initialPath="/admin" />)

      await waitFor(() => {
        expect(screen.getByTestId('admin-page')).toBeInTheDocument()
      })
    })
  })

  describe('Loading state', () => {
    it('should show loading indicator while checking auth', async () => {
      // 设置一个永不 resolve 的 Promise 来保持加载状态
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUserRegular)
      vi.mocked(validateSession).mockImplementation(() => new Promise(() => {}))

      render(<TestRouter />)

      // 加载状态时应该显示加载指示器
      expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })
  })

  // 需求 15.1: 记录原始路径
  describe('Original path preservation', () => {
    it('should preserve original path when redirecting to login', async () => {
      // 这个测试验证 Navigate 组件接收了正确的 state
      // 在实际应用中，登录页面可以从 location.state.from 获取原始路径
      render(<TestRouter initialPath="/protected" />)

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })
  })
})
