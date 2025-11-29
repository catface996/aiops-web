/**
 * AuthContext 属性测试
 * 任务 12: AuthContext 属性测试 - 页面刷新后状态恢复
 * 需求: 9.1, 9.2
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from './AuthContext'
import { tokenStorage, userStorage } from '@/utils/storage'
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

// 定义 Context 类型
type CapturedContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: { identifier: string; password: string; rememberMe: boolean }) => Promise<void>
  logout: () => Promise<void>
} | null

// 存储捕获的 context
let capturedContext: CapturedContextType = null

// 获取当前 context 的辅助函数
function getContext(): CapturedContextType {
  return capturedContext
}

// 测试组件用于获取 context 值
function TestConsumer() {
  const context = useAuthContext()
  capturedContext = context
  return (
    <div>
      <span data-testid="authenticated">{context.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="loading">{context.isLoading ? 'yes' : 'no'}</span>
      <span data-testid="username">{context.user?.username || 'none'}</span>
    </div>
  )
}

/**
 * 生成有效日期字符串的 arbitrary
 */
const validDateStringArbitrary = fc
  .integer({ min: 946684800000, max: 1924905600000 })
  .map((ts) => new Date(ts).toISOString())

/**
 * 生成随机 User 对象的 fast-check arbitrary
 */
const userArbitrary = fc.record({
  userId: fc.integer({ min: 1 }),
  username: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('ROLE_USER', 'ROLE_ADMIN') as fc.Arbitrary<'ROLE_USER' | 'ROLE_ADMIN'>,
  createdAt: validDateStringArbitrary,
  lastLoginAt: fc.option(validDateStringArbitrary, { nil: undefined }),
}) as fc.Arbitrary<User>

describe('AuthContext 属性测试', () => {
  beforeEach(() => {
    localStorage.clear()
    capturedContext = null
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    capturedContext = null
    vi.restoreAllMocks()
  })

  /**
   * 任务 12: 属性测试 - 页面刷新后状态恢复
   * 属性21: 对于任何页面刷新操作，如果 LocalStorage 中存在有效的 access_token 和 user_info，
   * 应用应该恢复用户的认证状态
   * 验证: 需求 9.1, 9.2
   */
  describe('属性21: 页面刷新后状态恢复', () => {
    it('存在有效 token 和 user 时，应恢复认证状态 (属性测试)', async () => {
      const { validateSession } = await import('@/services/session')
      const mockedValidateSession = vi.mocked(validateSession)

      // 运行 20 次随机测试
      const testCases = fc.sample(
        fc.tuple(fc.string({ minLength: 10, maxLength: 100 }), userArbitrary),
        20
      )

      for (const [token, user] of testCases) {
        // 清理之前的状态
        localStorage.clear()
        capturedContext = null

        // 设置存储
        tokenStorage.set(token)
        userStorage.set(user)

        // Mock validateSession 返回有效结果
        mockedValidateSession.mockResolvedValueOnce({
          valid: true,
          user: user,
        })

        // 渲染组件
        const { unmount } = render(
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        )

        // 等待加载完成
        await waitFor(() => {
          expect(screen.getByTestId('loading').textContent).toBe('no')
        }, { timeout: 2000 })

        // 验证认证状态恢复
        const ctx = getContext()
        expect(ctx?.isAuthenticated).toBe(true)
        expect(ctx?.user?.username).toBe(user.username)

        // 清理
        unmount()
      }
    })

    it('token 存在但验证失败时，应清除状态', async () => {
      const { validateSession } = await import('@/services/session')
      const mockedValidateSession = vi.mocked(validateSession)

      // 设置存储
      tokenStorage.set('invalid-token')
      userStorage.set({
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      })

      // Mock validateSession 返回无效结果
      mockedValidateSession.mockResolvedValueOnce({
        valid: false,
        user: undefined,
      })

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 验证状态被清除
      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(capturedContext?.user).toBeNull()
      expect(tokenStorage.get()).toBeNull()
    })

    it('无 token 时，应保持未认证状态', async () => {
      // 确保没有 token
      localStorage.clear()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(capturedContext?.user).toBeNull()
    })

    it('验证过程中发生错误时，应清除状态', async () => {
      const { validateSession } = await import('@/services/session')
      const mockedValidateSession = vi.mocked(validateSession)

      // 设置存储
      tokenStorage.set('test-token')
      userStorage.set({
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      })

      // Mock validateSession 抛出错误
      mockedValidateSession.mockRejectedValueOnce(new Error('Network error'))

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 验证状态被清除
      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(capturedContext?.user).toBeNull()
    })
  })

  /**
   * 单元测试 - AuthContext 基本功能
   */
  describe('AuthContext 单元测试', () => {
    it('加载完成后无 token 时应为未认证状态', async () => {
      // 确保没有 token
      localStorage.clear()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // 等待加载完成
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 验证未认证状态
      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(capturedContext?.user).toBeNull()
    })

    it('login 方法应正确更新状态', async () => {
      const { login: loginApi } = await import('@/services/auth')
      const mockedLogin = vi.mocked(loginApi)

      const mockResponse = {
        token: 'new-token',
        userInfo: {
          accountId: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ROLE_USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        sessionId: 'session-1',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: 'Chrome',
        message: 'Login successful',
      }

      mockedLogin.mockResolvedValueOnce(mockResponse)

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 执行登录
      await act(async () => {
        await capturedContext?.login({
          identifier: 'test',
          password: 'password',
          rememberMe: false,
        })
      })

      // 验证状态更新
      expect(capturedContext?.isAuthenticated).toBe(true)
      expect(capturedContext?.user?.username).toBe('testuser')
      expect(tokenStorage.get()).toBe('new-token')
    })

    it('logout 方法应清除状态', async () => {
      const { logout: logoutApi } = await import('@/services/auth')
      const { validateSession } = await import('@/services/session')
      const mockedLogout = vi.mocked(logoutApi)
      const mockedValidateSession = vi.mocked(validateSession)

      // 设置初始认证状态
      tokenStorage.set('test-token')
      const user: User = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }
      userStorage.set(user)

      mockedValidateSession.mockResolvedValueOnce({
        valid: true,
        user: user,
      })

      mockedLogout.mockResolvedValueOnce()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 确认已登录
      expect(capturedContext?.isAuthenticated).toBe(true)

      // 执行登出
      await act(async () => {
        await capturedContext?.logout()
      })

      // 验证状态被清除
      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(capturedContext?.user).toBeNull()
      expect(tokenStorage.get()).toBeNull()
    })

    it('logout 失败时仍应清除本地状态', async () => {
      const { logout: logoutApi } = await import('@/services/auth')
      const { validateSession } = await import('@/services/session')
      const mockedLogout = vi.mocked(logoutApi)
      const mockedValidateSession = vi.mocked(validateSession)

      // 设置初始认证状态
      tokenStorage.set('test-token')
      const user: User = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      }
      userStorage.set(user)

      mockedValidateSession.mockResolvedValueOnce({
        valid: true,
        user: user,
      })

      // Mock logout 失败
      mockedLogout.mockRejectedValueOnce(new Error('Network error'))

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('no')
      })

      // 执行登出
      await act(async () => {
        await capturedContext?.logout()
      })

      // 验证状态被清除（即使 API 失败）
      expect(capturedContext?.isAuthenticated).toBe(false)
      expect(tokenStorage.get()).toBeNull()
    })
  })

  /**
   * 边界测试
   */
  describe('边界测试', () => {
    it('useAuthContext 在 Provider 外使用应抛出错误', () => {
      // 捕获 console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer />)
      }).toThrow('useAuthContext must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})
