/**
 * AuthContext 单元测试
 * 需求: 2.2, 2.6, 3.1, 3.2, 4.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuthContext } from './AuthContext'
import type { User, LoginRequest, RegisterRequest } from '@/types'

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

import { login as loginApi, logout as logoutApi, register as registerApi } from '@/services/auth'
import { validateSession } from '@/services/session'
import { tokenStorage, userStorage, clearAuthStorage } from '@/utils/storage'

// 测试组件
const TestComponent: React.FC<{
  onLogin?: (data: LoginRequest) => void
  onLogout?: () => void
  onRegister?: (data: RegisterRequest) => void
  onCheckAuth?: () => void
}> = ({ onLogin, onLogout, onRegister, onCheckAuth }) => {
  const { user, isAuthenticated, isLoading, login, logout, register, checkAuth } = useAuthContext()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.username : 'null'}</div>
      <button
        data-testid="login-btn"
        onClick={async () => {
          const data: LoginRequest = { username: 'test', password: 'Test1234!', rememberMe: false }
          await login(data)
          onLogin?.(data)
        }}
      >
        Login
      </button>
      <button
        data-testid="logout-btn"
        onClick={async () => {
          await logout()
          onLogout?.()
        }}
      >
        Logout
      </button>
      <button
        data-testid="register-btn"
        onClick={async () => {
          const data: RegisterRequest = {
            username: 'newuser',
            email: 'new@example.com',
            password: 'Test1234!',
            confirmPassword: 'Test1234!',
          }
          await register(data)
          onRegister?.(data)
        }}
      >
        Register
      </button>
      <button
        data-testid="check-auth-btn"
        onClick={async () => {
          await checkAuth()
          onCheckAuth?.()
        }}
      >
        Check Auth
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser: User = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'ROLE_USER',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // 默认没有存储的 token 和 user
    vi.mocked(tokenStorage.get).mockReturnValue(null)
    vi.mocked(userStorage.get).mockReturnValue(null)
  })

  describe('初始化', () => {
    it('should initialize with no user when no token stored', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })

    // 需求 2.6: 从 LocalStorage 恢复用户状态
    it('should restore user from LocalStorage when token is valid', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUser)
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: mockUser,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('testuser')
    })

    it('should clear storage when token is invalid', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue('invalid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUser)
      vi.mocked(validateSession).mockResolvedValue({
        valid: false,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      expect(clearAuthStorage).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  // 需求 2.2: 调用后端登录 API
  // Feature: antd-rbac-frontend, Property 6: Valid credentials login success
  describe('login', () => {
    it('should login and store token/user', async () => {
      const user = userEvent.setup()

      vi.mocked(loginApi).mockResolvedValue({
        token: 'new-token',
        user: mockUser,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      await act(async () => {
        await user.click(screen.getByTestId('login-btn'))
      })

      expect(loginApi).toHaveBeenCalledWith({
        username: 'test',
        password: 'Test1234!',
        rememberMe: false,
      })
      expect(tokenStorage.set).toHaveBeenCalledWith('new-token')
      expect(userStorage.set).toHaveBeenCalledWith(mockUser)
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('testuser')
    })
  })

  // 需求 3.1, 3.2: 调用后端退出 API，清除 Token
  // Feature: antd-rbac-frontend, Property 12: Logout clears session
  describe('logout', () => {
    it('should logout and clear storage', async () => {
      const user = userEvent.setup()

      // 首先模拟已登录状态
      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUser)
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: mockUser,
      })
      vi.mocked(logoutApi).mockResolvedValue(undefined)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      })

      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'))
      })

      expect(logoutApi).toHaveBeenCalled()
      expect(clearAuthStorage).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })

    it('should clear storage even if logout API fails', async () => {
      const user = userEvent.setup()

      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(userStorage.get).mockReturnValue(mockUser)
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: mockUser,
      })
      vi.mocked(logoutApi).mockRejectedValue(new Error('Network error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      })

      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'))
      })

      // 即使 API 失败，也应该清除本地存储
      expect(clearAuthStorage).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('register', () => {
    it('should call register API', async () => {
      const user = userEvent.setup()

      vi.mocked(registerApi).mockResolvedValue({
        userId: 2,
        username: 'newuser',
        email: 'new@example.com',
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      await act(async () => {
        await user.click(screen.getByTestId('register-btn'))
      })

      expect(registerApi).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      })
    })
  })

  describe('checkAuth', () => {
    it('should return true and update user when session is valid', async () => {
      const user = userEvent.setup()

      vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: mockUser,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      await act(async () => {
        await user.click(screen.getByTestId('check-auth-btn'))
      })

      expect(validateSession).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    it('should return false and clear storage when session is invalid', async () => {
      const user = userEvent.setup()

      vi.mocked(tokenStorage.get).mockReturnValue('invalid-token')
      vi.mocked(validateSession).mockResolvedValue({
        valid: false,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      await act(async () => {
        await user.click(screen.getByTestId('check-auth-btn'))
      })

      expect(clearAuthStorage).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })

    it('should return false when no token exists', async () => {
      const user = userEvent.setup()

      vi.mocked(tokenStorage.get).mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      })

      await act(async () => {
        await user.click(screen.getByTestId('check-auth-btn'))
      })

      expect(validateSession).not.toHaveBeenCalled()
    })
  })

  describe('useAuthContext error handling', () => {
    it('should throw error when used outside AuthProvider', () => {
      // 捕获 console.error 以避免测试输出中的噪音
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuthContext must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})
