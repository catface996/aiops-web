/**
 * useAuth Hook 测试
 * 需求: 4.2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from './useAuth'
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

// 测试组件
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout, register, checkAuth } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="username">{user?.username ?? 'null'}</div>
      <div data-testid="has-login">{typeof login === 'function' ? 'true' : 'false'}</div>
      <div data-testid="has-logout">{typeof logout === 'function' ? 'true' : 'false'}</div>
      <div data-testid="has-register">{typeof register === 'function' ? 'true' : 'false'}</div>
      <div data-testid="has-checkAuth">{typeof checkAuth === 'function' ? 'true' : 'false'}</div>
    </div>
  )
}

describe('useAuth Hook', () => {
  const mockUser: User = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'ROLE_USER',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(tokenStorage.get).mockReturnValue(null)
    vi.mocked(userStorage.get).mockReturnValue(null)
  })

  it('should return all auth context values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    // 检查所有属性和方法都存在
    expect(screen.getByTestId('has-login')).toHaveTextContent('true')
    expect(screen.getByTestId('has-logout')).toHaveTextContent('true')
    expect(screen.getByTestId('has-register')).toHaveTextContent('true')
    expect(screen.getByTestId('has-checkAuth')).toHaveTextContent('true')
  })

  it('should return unauthenticated state when no user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('should return authenticated state when user exists', async () => {
    vi.mocked(tokenStorage.get).mockReturnValue('valid-token')
    vi.mocked(userStorage.get).mockReturnValue(mockUser)
    vi.mocked(validateSession).mockResolvedValue({ valid: true, user: mockUser })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(screen.getByTestId('username')).toHaveTextContent('testuser')
  })

  it('should throw error when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuthContext must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
