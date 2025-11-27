/**
 * AuthContext 属性测试
 * 需求: 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 4.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
import { AuthProvider, useAuthContext } from './AuthContext'
import type { User, LoginRequest, UserRole } from '@/types'

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

import { login as loginApi, logout as logoutApi } from '@/services/auth'
import { validateSession } from '@/services/session'
import { tokenStorage, userStorage, clearAuthStorage } from '@/utils/storage'

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

// 测试组件
const TestComponent: React.FC<{
  onAuthChange?: (isAuthenticated: boolean, user: User | null) => void
}> = ({ onAuthChange }) => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext()

  // 通知认证状态变化
  if (onAuthChange && !isLoading) {
    onAuthChange(isAuthenticated, user)
  }

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user-id">{user?.userId ?? 'null'}</div>
      <div data-testid="username">{user?.username ?? 'null'}</div>
      <div data-testid="user-role">{user?.role ?? 'null'}</div>
      <button
        data-testid="login-btn"
        onClick={async () => {
          const data: LoginRequest = { username: 'test', password: 'Test1234!', rememberMe: false }
          await login(data)
        }}
      >
        Login
      </button>
      <button
        data-testid="logout-btn"
        onClick={async () => {
          await logout()
        }}
      >
        Logout
      </button>
    </div>
  )
}

describe('AuthContext Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tokenStorage.get).mockReturnValue(null)
    vi.mocked(userStorage.get).mockReturnValue(null)
  })

  // Feature: antd-rbac-frontend, Property 6: Valid credentials login success
  // 对于任何有效的登录凭证，系统应该成功登录并存储用户信息
  describe('Property 6: Valid credentials login success', () => {
    it('should successfully login with valid credentials and store user info', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(null)
          vi.mocked(userStorage.get).mockReturnValue(null)
          vi.mocked(loginApi).mockResolvedValue({ token, user })

          const userSetup = userEvent.setup()

          const { unmount } = render(
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          )

          await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
          })

          // 登录前应该未认证
          expect(screen.getByTestId('authenticated')).toHaveTextContent('false')

          await act(async () => {
            await userSetup.click(screen.getByTestId('login-btn'))
          })

          // 登录后应该已认证
          expect(screen.getByTestId('authenticated')).toHaveTextContent('true')

          // Token 应该被存储
          expect(tokenStorage.set).toHaveBeenCalledWith(token)

          // 用户信息应该被存储
          expect(userStorage.set).toHaveBeenCalledWith(user)

          // 用户信息应该正确显示
          expect(screen.getByTestId('username')).toHaveTextContent(user.username)

          unmount()
        }),
        { numRuns: 20 } // 减少运行次数以加快测试速度
      )
    })
  })

  // Feature: antd-rbac-frontend, Property 12: Logout clears session
  // 对于任何已登录的用户，退出操作应该清除所有会话数据
  describe('Property 12: Logout clears session', () => {
    it('should clear all session data when user logs out', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          // 模拟已登录状态
          vi.mocked(tokenStorage.get).mockReturnValue(token)
          vi.mocked(userStorage.get).mockReturnValue(user)
          vi.mocked(validateSession).mockResolvedValue({ valid: true, user })
          vi.mocked(logoutApi).mockResolvedValue(undefined)

          const userSetup = userEvent.setup()

          const { unmount } = render(
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          )

          await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
          })

          // 登录状态应该正确
          expect(screen.getByTestId('username')).toHaveTextContent(user.username)

          await act(async () => {
            await userSetup.click(screen.getByTestId('logout-btn'))
          })

          // 退出后应该未认证
          expect(screen.getByTestId('authenticated')).toHaveTextContent('false')

          // 应该调用清除存储
          expect(clearAuthStorage).toHaveBeenCalled()

          // 用户信息应该清除
          expect(screen.getByTestId('username')).toHaveTextContent('null')

          unmount()
        }),
        { numRuns: 20 }
      )
    })
  })

  // Feature: antd-rbac-frontend, Property 9: Role information correctly stored
  // 对于任何有效的用户角色，登录后角色信息应该被正确存储和显示
  describe('Property 9: Role information correctly stored', () => {
    it('should correctly store and display user role after login', async () => {
      await fc.assert(
        fc.asyncProperty(validUser, validToken, async (user, token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(null)
          vi.mocked(userStorage.get).mockReturnValue(null)
          vi.mocked(loginApi).mockResolvedValue({ token, user })

          const userSetup = userEvent.setup()

          const { unmount } = render(
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          )

          await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
          })

          await act(async () => {
            await userSetup.click(screen.getByTestId('login-btn'))
          })

          // 角色信息应该正确存储
          expect(screen.getByTestId('user-role')).toHaveTextContent(user.role)

          // 验证存储的用户信息包含正确的角色
          expect(userStorage.set).toHaveBeenCalledWith(
            expect.objectContaining({
              role: user.role,
            })
          )

          unmount()
        }),
        { numRuns: 20 }
      )
    })

    it('should preserve role information for both ROLE_USER and ROLE_ADMIN', async () => {
      const roles: UserRole[] = ['ROLE_USER', 'ROLE_ADMIN']

      for (const role of roles) {
        vi.clearAllMocks()
        vi.mocked(tokenStorage.get).mockReturnValue(null)
        vi.mocked(userStorage.get).mockReturnValue(null)

        const user: User = {
          userId: 1,
          username: 'testuser',
          email: 'test@example.com',
          role,
        }
        vi.mocked(loginApi).mockResolvedValue({ token: 'test-token', user })

        const userSetup = userEvent.setup()

        const { unmount } = render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )

        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
        })

        await act(async () => {
          await userSetup.click(screen.getByTestId('login-btn'))
        })

        expect(screen.getByTestId('user-role')).toHaveTextContent(role)

        unmount()
      }
    })
  })

  // 附加属性测试：Token 存储一致性
  describe('Property: Token storage consistency', () => {
    it('should store token consistently across login operations', async () => {
      await fc.assert(
        fc.asyncProperty(validToken, async (token) => {
          vi.clearAllMocks()
          vi.mocked(tokenStorage.get).mockReturnValue(null)
          vi.mocked(userStorage.get).mockReturnValue(null)

          const user: User = {
            userId: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'ROLE_USER',
          }
          vi.mocked(loginApi).mockResolvedValue({ token, user })

          const userSetup = userEvent.setup()

          const { unmount } = render(
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          )

          await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
          })

          await act(async () => {
            await userSetup.click(screen.getByTestId('login-btn'))
          })

          // 验证 token 被正确存储（完全匹配）
          expect(tokenStorage.set).toHaveBeenCalledTimes(1)
          expect(tokenStorage.set).toHaveBeenCalledWith(token)

          unmount()
        }),
        { numRuns: 50 }
      )
    })
  })
})
