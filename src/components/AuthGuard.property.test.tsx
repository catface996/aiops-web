/**
 * AuthGuard 属性测试
 * 需求: 3.4, 15.1, 4.3, 12.5, 13.5
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as fc from 'fast-check'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from './AuthGuard'
import type { UserRole } from '@/types'

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

// 生成有效用户名的 Arbitrary
const validUsername = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('')), {
    minLength: 3,
    maxLength: 20,
  })
  .map((arr) => arr.join(''))

// 生成有效邮箱的 Arbitrary
const validEmail = fc.emailAddress().filter((e) => e.length <= 100)

// 生成有效角色的 Arbitrary
const validRole = fc.constantFrom<UserRole>('ROLE_USER', 'ROLE_ADMIN')

// 生成有效用户的 Arbitrary
const validUser = fc.record({
  userId: fc.integer({ min: 1, max: 1000000 }),
  username: validUsername,
  email: validEmail,
  role: validRole,
})

// 生成有效 Token 的 Arbitrary
const validToken = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.'.split('')), {
    minLength: 20,
    maxLength: 200,
  })
  .map((arr) => arr.join(''))

// 测试页面组件
const ProtectedPage = () => <div data-testid="protected-page">Protected Content</div>
const LoginPage = () => <div data-testid="login-page">Login Page</div>
const ForbiddenPage = () => <div data-testid="forbidden-page">403 Forbidden</div>

// 测试路由配置
const TestRouter: React.FC<{
  initialPath?: string
  roles?: UserRole[]
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
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

describe('AuthGuard Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tokenStorage.get).mockReturnValue(null)
    vi.mocked(userStorage.get).mockReturnValue(null)
  })

  // Feature: antd-rbac-frontend, Property 13: Token cleared blocks access
  // 对于任何已清除 Token 的情况，系统应该阻止访问受保护的资源
  describe('Property 13: Token cleared blocks access', () => {
    it('should block access when token is cleared (null)', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, async (_user) => {
          vi.clearAllMocks()
          // Token 被清除（为 null）
          vi.mocked(tokenStorage.get).mockReturnValue(null)
          vi.mocked(userStorage.get).mockReturnValue(null)

          const { unmount } = render(<TestRouter />)

          await waitFor(() => {
            // 应该重定向到登录页
            expect(screen.getByTestId('login-page')).toBeInTheDocument()
          })

          // 不应该显示受保护的内容
          expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()

          unmount()
        }),
        { numRuns: 20 }
      )
    })

    it('should block access when token exists but session is invalid', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          // Token 存在但会话无效
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: false })

          const { unmount } = render(<TestRouter />)

          await waitFor(() => {
            // 应该重定向到登录页
            expect(screen.getByTestId('login-page')).toBeInTheDocument()
          })

          // 不应该显示受保护的内容
          expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()

          unmount()
        }),
        { numRuns: 20 }
      )
    })
  })

  // Feature: antd-rbac-frontend, Property 11: Unauthorized access rejected
  // 对于任何没有所需角色的用户，系统应该拒绝访问并重定向到 403 页面
  describe('Property 11: Unauthorized access rejected', () => {
    it('should reject access when user does not have required role', async () => {
      await fc.assert(
        fc.asyncProperty(validUser.filter((u) => u.role === 'ROLE_USER'), validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: true, user })

          // 需要 ROLE_ADMIN 角色，但用户是 ROLE_USER
          const { unmount } = render(<TestRouter roles={['ROLE_ADMIN']} />)

          await waitFor(() => {
            // 应该重定向到 403 页面
            expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
          })

          // 不应该显示受保护的内容
          expect(screen.queryByTestId('protected-page')).not.toBeInTheDocument()

          unmount()
        }),
        { numRuns: 20 }
      )
    })

    it('should allow access when user has required role', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: true, user })

          // 用户角色在允许的角色列表中
          const { unmount } = render(<TestRouter roles={[user.role]} />)

          await waitFor(() => {
            // 应该显示受保护的内容
            expect(screen.getByTestId('protected-page')).toBeInTheDocument()
          })

          // 不应该显示登录页或 403 页面
          expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
          expect(screen.queryByTestId('forbidden-page')).not.toBeInTheDocument()

          unmount()
        }),
        { numRuns: 20 }
      )
    })

    it('should allow access when user has any of multiple allowed roles', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: true, user })

          // 允许两种角色
          const { unmount } = render(<TestRouter roles={['ROLE_USER', 'ROLE_ADMIN']} />)

          await waitFor(() => {
            // 应该显示受保护的内容
            expect(screen.getByTestId('protected-page')).toBeInTheDocument()
          })

          unmount()
        }),
        { numRuns: 20 }
      )
    })
  })

  // 附加属性测试：认证状态一致性
  describe('Property: Authentication state consistency', () => {
    it('should consistently allow authenticated users without role restriction', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: true, user })

          // 无角色限制
          const { unmount } = render(<TestRouter />)

          await waitFor(() => {
            // 应该显示受保护的内容
            expect(screen.getByTestId('protected-page')).toBeInTheDocument()
          })

          unmount()
        }),
        { numRuns: 30 }
      )
    })
  })
})
