/**
 * 注册页面属性测试
 * 需求: 1.2, 1.3
 * 属性 1: 有效注册数据提交成功
 * 属性 2: 密码不匹配阻止提交
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
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
  clearAuthStorage: vi.fn(),
}))

// 生成有效密码的 Arbitrary (8-64字符，包含大小写字母、数字、特殊字符)
const validPassword = fc
  .tuple(
    fc.string({ minLength: 2, maxLength: 5 }).filter((s) => /^[A-Z]+$/.test(s)), // 大写字母
    fc.string({ minLength: 2, maxLength: 5 }).filter((s) => /^[a-z]+$/.test(s)), // 小写字母
    fc.string({ minLength: 2, maxLength: 5 }).filter((s) => /^[0-9]+$/.test(s)), // 数字
    fc.constantFrom('!', '@', '#', '$', '%') // 特殊字符
  )
  .map(([upper, lower, digits, special]) => `${upper}${lower}${digits}${special}`)
  .filter((p) => p.length >= 8 && p.length <= 20)

// 生成不匹配的密码对
const mismatchedPasswords = fc
  .tuple(validPassword, validPassword)
  .filter(([p1, p2]) => p1 !== p2)

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

describe('RegisterPage Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * 属性 1: 有效注册数据提交成功
   * 需求 1.2: 对于任何有效的注册数据，系统应该成功调用注册 API
   */
  describe('Property 1: Valid registration data submission', () => {
    it('should successfully submit valid registration data with various passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          validPassword,
          async (password) => {
            // 重置 mock
            mockRegister.mockReset()
            mockNavigate.mockReset()
            mockRegister.mockResolvedValueOnce(undefined)

            // 使用固定的用户名和邮箱以加快测试速度
            const username = 'testuser123'
            const email = 'test@example.com'

            const user = userEvent.setup()
            const { unmount } = renderRegisterPage()

            try {
              // 填写表单
              await user.type(screen.getByTestId('username-input'), username)
              await user.type(screen.getByTestId('email-input'), email)
              await user.type(screen.getByTestId('password-input'), password)
              await user.type(screen.getByTestId('confirm-password-input'), password)

              // 提交表单
              await user.click(screen.getByTestId('register-submit'))

              // 验证 register 被调用
              await waitFor(
                () => {
                  expect(mockRegister).toHaveBeenCalledWith({
                    username,
                    email,
                    password,
                  })
                },
                { timeout: 3000 }
              )

              // 验证导航到登录页
              await waitFor(
                () => {
                  expect(mockNavigate).toHaveBeenCalledWith('/login')
                },
                { timeout: 3000 }
              )

              return true
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: 3 }
      )
    }, 60000)

    it('should call register API with correct data structure (no confirmPassword field)', async () => {
      mockRegister.mockResolvedValueOnce(undefined)
      const user = userEvent.setup()
      renderRegisterPage()

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'Password123!')

      await user.click(screen.getByTestId('register-submit'))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
        const callArgs = mockRegister.mock.calls[0][0]
        // 验证数据结构
        expect(callArgs).toHaveProperty('username')
        expect(callArgs).toHaveProperty('email')
        expect(callArgs).toHaveProperty('password')
        // 验证没有 confirmPassword 字段
        expect(callArgs).not.toHaveProperty('confirmPassword')
      })
    })
  })

  /**
   * 属性 2: 密码不匹配阻止提交
   * 需求 1.3: 对于任何密码不匹配的情况，系统应该阻止表单提交
   */
  describe('Property 2: Password mismatch prevents submission', () => {
    it('should prevent submission when passwords do not match', async () => {
      await fc.assert(
        fc.asyncProperty(
          mismatchedPasswords,
          async ([password, confirmPassword]) => {
            mockRegister.mockReset()

            const user = userEvent.setup()
            const { unmount } = renderRegisterPage()

            try {
              // 填写有效的用户名和邮箱
              await user.type(screen.getByTestId('username-input'), 'testuser')
              await user.type(screen.getByTestId('email-input'), 'test@example.com')
              await user.type(screen.getByTestId('password-input'), password)
              await user.type(screen.getByTestId('confirm-password-input'), confirmPassword)

              // 尝试提交表单
              await user.click(screen.getByTestId('register-submit'))

              // 等待验证完成
              await waitFor(
                () => {
                  expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
                },
                { timeout: 2000 }
              )

              // 验证 register 没有被调用
              expect(mockRegister).not.toHaveBeenCalled()

              return true
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: 3 }
      )
    }, 60000)

    it('should show error message immediately when passwords do not match', async () => {
      const user = userEvent.setup()
      renderRegisterPage()

      // 填写密码字段
      await user.type(screen.getByTestId('password-input'), 'Password123!')
      await user.type(screen.getByTestId('confirm-password-input'), 'DifferentPass456!')
      await user.tab() // 触发验证

      // 验证显示错误消息
      await waitFor(() => {
        expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
      })
    })
  })
})
