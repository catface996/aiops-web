/**
 * 登录页面属性测试
 * 任务 19: 登录页面属性测试 - 记住我参数传递
 * 需求: 1.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './index'
import type { LoginRequest } from '@/types'

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// 存储捕获的登录数据
let capturedLoginData: LoginRequest | null = null

function getCapturedLoginData(): LoginRequest | null {
  return capturedLoginData
}

// 渲染辅助函数
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('登录页面属性测试', () => {
  beforeEach(() => {
    capturedLoginData = null
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  /**
   * 任务 19: 属性测试 - 记住我参数传递
   * 属性3: 对于任何登录表单提交，rememberMe 参数应正确传递给登录方法
   * 验证: 需求 1.4
   */
  describe('属性3: 记住我参数传递', () => {
    it('勾选记住我时，rememberMe 应为 true', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      capturedLoginData = null
      const mockLoginFn = vi.fn().mockImplementation((data: LoginRequest) => {
        capturedLoginData = data
        return Promise.resolve()
      })

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const identifierInput = screen.getByTestId('identifier-input')
      const passwordInput = screen.getByTestId('password-input')
      const rememberCheckbox = screen.getByTestId('remember-checkbox')
      const submitButton = screen.getByTestId('login-submit')

      // 填写表单
      await userEvent.type(identifierInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')

      // 勾选记住我
      await userEvent.click(rememberCheckbox)

      // 提交表单
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginFn).toHaveBeenCalled()
      })

      expect(getCapturedLoginData()?.rememberMe).toBe(true)
    })

    it('不勾选记住我时，rememberMe 应为 false', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      capturedLoginData = null
      const mockLoginFn = vi.fn().mockImplementation((data: LoginRequest) => {
        capturedLoginData = data
        return Promise.resolve()
      })

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const identifierInput = screen.getByTestId('identifier-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('login-submit')

      // 填写表单（不勾选记住我）
      await userEvent.type(identifierInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')

      // 提交表单
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLoginFn).toHaveBeenCalled()
      })

      expect(getCapturedLoginData()?.rememberMe).toBe(false)
    })

    it('属性测试: 任何用户名和密码组合下，rememberMe 参数应正确传递', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 生成测试用例
      const testCases = fc.sample(
        fc.record({
          identifier: fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^a-zA-Z0-9]/g, '') || 'user'),
          password: fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/[^a-zA-Z0-9]/g, '') || 'pass'),
          rememberMe: fc.boolean(),
        }),
        20
      )

      for (const testCase of testCases) {
        capturedLoginData = null
        const mockLoginFn = vi.fn().mockImplementation((data: LoginRequest) => {
          capturedLoginData = data
          return Promise.resolve()
        })

        mockedUseAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          login: mockLoginFn,
          logout: vi.fn(),
          register: vi.fn(),
          checkAuth: vi.fn(),
        })

        const { unmount } = renderWithRouter(<LoginPage />)

        const identifierInput = screen.getByTestId('identifier-input')
        const passwordInput = screen.getByTestId('password-input')
        const rememberCheckbox = screen.getByTestId('remember-checkbox')
        const submitButton = screen.getByTestId('login-submit')

        // 清空输入框并填写
        await userEvent.clear(identifierInput)
        await userEvent.type(identifierInput, testCase.identifier)
        await userEvent.clear(passwordInput)
        await userEvent.type(passwordInput, testCase.password)

        // 根据测试用例设置 rememberMe 状态
        // Checkbox 默认是未勾选的，如果需要勾选则点击
        if (testCase.rememberMe) {
          await userEvent.click(rememberCheckbox)
        }

        // 提交表单
        await userEvent.click(submitButton)

        await waitFor(() => {
          expect(mockLoginFn).toHaveBeenCalled()
        })

        // 验证 rememberMe 参数正确传递
        const data = getCapturedLoginData()
        expect(data?.rememberMe).toBe(testCase.rememberMe)
        // 验证用户名和密码也正确传递
        expect(data?.identifier).toBe(testCase.identifier)
        expect(data?.password).toBe(testCase.password)

        unmount()
      }
    })
  })

  /**
   * 单元测试 - 登录页面基本功能
   */
  describe('登录页面单元测试', () => {
    it('应正确渲染登录表单', async () => {
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

      renderWithRouter(<LoginPage />)

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.getByTestId('identifier-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('remember-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('login-submit')).toBeInTheDocument()
      expect(screen.getByTestId('register-link')).toBeInTheDocument()
    })

    it('空表单提交时应显示验证错误', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      const mockLoginFn = vi.fn()

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const submitButton = screen.getByTestId('login-submit')
      await userEvent.click(submitButton)

      // 等待验证消息出现
      await waitFor(() => {
        expect(screen.getByText('请输入用户名或邮箱')).toBeInTheDocument()
      })

      // login 不应该被调用
      expect(mockLoginFn).not.toHaveBeenCalled()
    })

    it('登录失败时应显示错误消息', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      const mockLoginFn = vi.fn().mockRejectedValue(new Error('401 用户名或密码错误'))

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const identifierInput = screen.getByTestId('identifier-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('login-submit')

      await userEvent.type(identifierInput, 'testuser')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument()
      })

      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument()
    })

    it('账号锁定时应显示锁定警告', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      const mockLoginFn = vi.fn().mockRejectedValue(new Error('423 账号已被锁定'))

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const identifierInput = screen.getByTestId('identifier-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('login-submit')

      await userEvent.type(identifierInput, 'lockeduser')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument()
      })

      expect(screen.getByText('账号已被锁定，请稍后再试或联系管理员')).toBeInTheDocument()
    })

    it('loading 状态下提交按钮应禁用', async () => {
      const { useAuth } = await import('@/hooks/useAuth')
      const mockedUseAuth = vi.mocked(useAuth)

      // 创建一个永不 resolve 的 Promise 来模拟 loading 状态
      const mockLoginFn = vi.fn().mockImplementation(() => new Promise(() => {}))

      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLoginFn,
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderWithRouter(<LoginPage />)

      const identifierInput = screen.getByTestId('identifier-input')
      const passwordInput = screen.getByTestId('password-input')
      const submitButton = screen.getByTestId('login-submit')

      await userEvent.type(identifierInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      // 按钮应该进入 loading 状态
      await waitFor(() => {
        expect(submitButton).toHaveClass('ant-btn-loading')
      })
    })

    it('注册链接应指向正确的路径', async () => {
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

      renderWithRouter(<LoginPage />)

      const registerLink = screen.getByTestId('register-link')
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })
})
