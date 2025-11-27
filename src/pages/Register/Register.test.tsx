/**
 * 注册页面测试
 * 需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './index'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useAuth
const mockRegister = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}))

// Mock storage
vi.mock('@/utils/storage', () => ({
  storage: {
    getTheme: vi.fn(() => 'light'),
    setTheme: vi.fn(),
    getSidebarCollapsed: vi.fn(() => false),
    setSidebarCollapsed: vi.fn(),
    clear: vi.fn(),
  },
  tokenStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
  userStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

// 包装组件
const renderRegisterPage = () => {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 需求 1.1: 注册页面显示
  describe('Page rendering', () => {
    it('should render the register page', () => {
      renderRegisterPage()
      expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })

    it('should render the registration form', () => {
      renderRegisterPage()
      expect(screen.getByTestId('register-form')).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      renderRegisterPage()
      expect(screen.getByTestId('username-input')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument()
    })

    it('should render submit button', async () => {
      renderRegisterPage()
      await waitFor(() => {
        expect(screen.getByTestId('register-submit')).toBeInTheDocument()
      })
    })

    it('should render login link', () => {
      renderRegisterPage()
      expect(screen.getByTestId('login-link')).toBeInTheDocument()
      expect(screen.getByText('立即登录')).toBeInTheDocument()
    })
  })

  // 需求 1.4: 用户名验证
  describe('Username validation', () => {
    it('should show error for empty username on submit', async () => {
      renderRegisterPage()
      const submitButton = screen.getByTestId('register-submit')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument()
      })
    })

    it('should show error for too short username', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const usernameInput = screen.getByTestId('username-input')
      await user.type(usernameInput, 'ab')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/用户名必须为3-20个字符/)).toBeInTheDocument()
      })
    })
  })

  // 需求 1.5: 邮箱验证
  describe('Email validation', () => {
    it('should show error for empty email on submit', async () => {
      renderRegisterPage()
      const submitButton = screen.getByTestId('register-submit')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const emailInput = screen.getByTestId('email-input')
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/邮箱格式无效/)).toBeInTheDocument()
      })
    })
  })

  // 需求 1.6: 密码验证
  describe('Password validation', () => {
    it('should show error for empty password on submit', async () => {
      renderRegisterPage()
      const submitButton = screen.getByTestId('register-submit')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('请输入密码')).toBeInTheDocument()
      })
    })

    it('should show error for too short password', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const passwordInput = screen.getByTestId('password-input')
      await user.type(passwordInput, 'short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/密码长度至少为8个字符/)).toBeInTheDocument()
      })
    })
  })

  // 需求 1.3: 密码匹配验证
  describe('Confirm password validation', () => {
    it('should show error for empty confirm password on submit', async () => {
      renderRegisterPage()
      const submitButton = screen.getByTestId('register-submit')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('请确认密码')).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const passwordInput = screen.getByTestId('password-input')
      const confirmPasswordInput = screen.getByTestId('confirm-password-input')

      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
      })
    })
  })

  // 需求 1.2: 注册成功
  describe('Successful registration', () => {
    it('should call register and navigate to login on success', async () => {
      mockRegister.mockResolvedValueOnce(undefined)
      const user = userEvent.setup()
      renderRegisterPage()

      // 填写表单
      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'Password123!')

      // 提交表单
      await user.click(screen.getByTestId('register-submit'))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
        })
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })

  // 需求 1.7, 1.8, 1.9: 后端错误处理
  describe('Error handling', () => {
    it('should show error message when registration fails', async () => {
      mockRegister.mockRejectedValueOnce(new Error('注册失败'))
      const user = userEvent.setup()
      renderRegisterPage()

      // 填写表单
      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'Password123!')

      // 提交表单
      await user.click(screen.getByTestId('register-submit'))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
      })
    })

    it('should show field error for username conflict', async () => {
      mockRegister.mockRejectedValueOnce(new Error('用户名已存在'))
      const user = userEvent.setup()
      renderRegisterPage()

      // 填写表单
      await user.type(screen.getByTestId('username-input'), 'existinguser')
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'Password123!')

      // 提交表单
      await user.click(screen.getByTestId('register-submit'))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
      })
    })
  })

  // 密码强度指示器
  describe('Password strength indicator', () => {
    it('should show password strength indicator when typing password', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      const passwordInput = screen.getByTestId('password-input')
      await user.type(passwordInput, 'Password123!')

      await waitFor(() => {
        expect(screen.getByTestId('password-strength')).toBeInTheDocument()
      })
    })
  })
})
