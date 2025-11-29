/**
 * AuthGuard 属性测试
 * 任务 14-16: AuthGuard 属性测试 - 路由保护重定向、重定向恢复、认证状态检查
 * 需求: 7.1, 7.2, 7.3, 7.5
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import type { User, UserRole } from '@/types'

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/hooks/usePermission', () => ({
  usePermission: vi.fn(() => ({
    hasAnyRole: vi.fn((roles: string[]) => roles.includes('ROLE_USER') || roles.includes('ROLE_ADMIN')),
    hasRole: vi.fn((role: string) => role === 'ROLE_USER' || role === 'ROLE_ADMIN'),
    canAccessRoute: vi.fn(() => true),
    role: 'ROLE_USER' as UserRole,
    isAdmin: false,
  })),
}))

// 辅助组件：显示当前位置
function LocationDisplay() {
  const location = useLocation()
  return (
    <div>
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </div>
  )
}

// 受保护的内容组件
function ProtectedContent() {
  return <div data-testid="protected-content">Protected Content</div>
}

// 登录页面组件
function LoginPage() {
  return (
    <div data-testid="login-page">
      <LocationDisplay />
    </div>
  )
}

// 403 页面组件
function ForbiddenPage() {
  return <div data-testid="forbidden-page">403 Forbidden</div>
}

// 测试渲染辅助函数
function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/protected'] }: { initialEntries?: string[] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/protected" element={ui} />
        <Route path="/admin" element={ui} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AuthGuard 属性测试', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  /**
   * 任务 14: 属性测试 - 路由保护重定向
   * 属性16: 对于任何未认证用户访问受保护路由的尝试，用户应该被重定向到登录页面，
   * 并且原始路径应该保存在 URL 的 redirect 参数中
   * 验证: 需求 7.1, 7.2
   */
  describe('属性16: 路由保护重定向', () => {
    it('未认证用户访问受保护路由应重定向到登录页', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 模拟未认证状态
      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      // 应该重定向到登录页
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('重定向应保存原始路径在 state.from 中', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 模拟未认证状态
      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
        { initialEntries: ['/protected'] }
      )

      // 检查 state 中包含原始路径
      const stateElement = screen.getByTestId('state')
      const state = JSON.parse(stateElement.textContent || '{}')
      expect(state.from).toBe('/protected')
    })

    it('属性测试: 任何受保护路径都应保存在重定向状态中', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 生成测试路径
      const testPaths = fc.sample(
        fc.string({ minLength: 1, maxLength: 20 }).map((s) => `/${s.replace(/[^a-z0-9]/gi, '') || 'test'}`),
        20
      )

      for (const path of testPaths) {
        mockedUseAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          checkAuth: vi.fn(),
        })

        const { unmount } = render(
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="*"
                element={
                  <AuthGuard>
                    <ProtectedContent />
                  </AuthGuard>
                }
              />
            </Routes>
          </MemoryRouter>
        )

        // 应该重定向到登录页
        const loginPage = screen.queryByTestId('login-page')
        expect(loginPage).toBeInTheDocument()

        // 检查 state
        const stateElement = screen.getByTestId('state')
        const state = JSON.parse(stateElement.textContent || '{}')
        expect(state.from).toBe(path)

        unmount()
      }
    })
  })

  /**
   * 任务 15: 属性测试 - 重定向恢复
   * 属性17: 对于任何成功的登录操作，如果 URL 中包含 redirect 参数，
   * 用户应该被重定向到该参数指定的路径
   * 验证: 需求 7.3
   *
   * 注：重定向恢复逻辑在 LoginPage 组件中实现，这里测试 state 传递
   */
  describe('属性17: 重定向恢复', () => {
    it('认证状态变化后应能访问受保护内容', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 模拟已认证状态
      const mockUser: User = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }

      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      // 应该显示受保护内容
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })

    it('state.from 应正确传递给登录页面', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      const targetPath = '/dashboard/settings'

      render(
        <MemoryRouter initialEntries={[targetPath]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="*"
              element={
                <AuthGuard>
                  <ProtectedContent />
                </AuthGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      )

      const stateElement = screen.getByTestId('state')
      const state = JSON.parse(stateElement.textContent || '{}')
      expect(state.from).toBe(targetPath)
    })
  })

  /**
   * 任务 16: 属性测试 - 认证状态检查
   * 属性18: 对于任何路由保护检查，AuthGuard 应该验证 LocalStorage 中存在 access_token
   * 验证: 需求 7.5
   */
  describe('属性18: 认证状态检查', () => {
    it('isAuthenticated 为 true 时应允许访问', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      const mockUser: User = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }

      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('isAuthenticated 为 false 时应拒绝访问', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })

    it('加载中时应显示加载指示器', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      // 不应显示受保护内容或登录页
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })
  })

  /**
   * 单元测试 - AuthGuard 角色检查
   */
  describe('AuthGuard 角色检查', () => {
    it('用户有要求的角色时应允许访问', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const { usePermission } = await import('@/hooks/usePermission')
      const mockedUseAuth = vi.mocked(useAuth)
      const mockedUsePermission = vi.mocked(usePermission)

      const mockUser: User = {
        userId: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ROLE_ADMIN',
        createdAt: new Date().toISOString(),
      }

      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      mockedUsePermission.mockReturnValue({
        hasAnyRole: vi.fn((roles: UserRole[]) => roles.includes('ROLE_ADMIN')),
        hasRole: vi.fn((role: UserRole) => role === 'ROLE_ADMIN'),
        canAccessRoute: vi.fn(() => true),
        role: 'ROLE_ADMIN' as UserRole,
        isAdmin: true,
      })

      renderWithRouter(
        <AuthGuard roles={['ROLE_ADMIN']}>
          <ProtectedContent />
        </AuthGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('用户没有要求的角色时应重定向到 403', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const { usePermission } = await import('@/hooks/usePermission')
      const mockedUseAuth = vi.mocked(useAuth)
      const mockedUsePermission = vi.mocked(usePermission)

      const mockUser: User = {
        userId: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }

      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      mockedUsePermission.mockReturnValue({
        hasAnyRole: vi.fn(() => false),
        hasRole: vi.fn(() => false),
        canAccessRoute: vi.fn(() => false),
        role: 'ROLE_USER' as UserRole,
        isAdmin: false,
      })

      renderWithRouter(
        <AuthGuard roles={['ROLE_ADMIN']}>
          <ProtectedContent />
        </AuthGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
    })

    it('不指定角色时只检查认证状态', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      const mockUser: User = {
        userId: 1,
        username: 'user',
        email: 'user@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }

      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>
      )

      // 不指定角色时，任何已认证用户都可以访问
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })
})
