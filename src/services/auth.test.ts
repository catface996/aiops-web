/**
 * 认证服务测试
 * 需求: 1.2, 2.2, 2.3, 3.1
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import request from '@/utils/request'
import { register, login, logout } from './auth'
import type { RegisterRequest, LoginRequest } from '@/types'

// Mock storage
vi.mock('@/utils/storage', () => ({
  tokenStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  clearAuthStorage: vi.fn(),
}))

// Mock antd message
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Auth Service', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(request)
    vi.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  // 需求 1.2: 调用后端注册 API
  describe('register', () => {
    it('should call register API with correct data', async () => {
      const registerData: RegisterRequest = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      }
      const responseData = { userId: 1, username: 'testuser' }

      mock.onPost('/auth/register', registerData).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await register(registerData)
      expect(result).toEqual(responseData)
    })

    it('should handle registration error', async () => {
      const registerData: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
      }

      mock.onPost('/auth/register').reply(200, {
        code: 1001,
        message: '用户名已存在',
        data: null,
      })

      await expect(register(registerData)).rejects.toThrow('用户名已存在')
    })
  })

  // 需求 2.2, 2.3: 调用后端登录 API、接收 JWT Token
  describe('login', () => {
    it('should call login API and return token', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'Test1234!',
        rememberMe: false,
      }
      const responseData = {
        token: 'jwt-token-12345',
        user: {
          userId: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ROLE_USER',
        },
      }

      mock.onPost('/auth/login', loginData).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await login(loginData)
      expect(result).toEqual(responseData)
      expect(result.token).toBe('jwt-token-12345')
    })

    it('should handle login with rememberMe', async () => {
      const loginData: LoginRequest = {
        username: 'testuser',
        password: 'Test1234!',
        rememberMe: true,
      }
      const responseData = {
        token: 'jwt-token-remember',
        user: {
          userId: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ROLE_USER',
        },
      }

      mock.onPost('/auth/login', loginData).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await login(loginData)
      expect(result.token).toBe('jwt-token-remember')
    })

    it('should handle invalid credentials', async () => {
      const loginData: LoginRequest = {
        username: 'wronguser',
        password: 'wrongpass',
        rememberMe: false,
      }

      mock.onPost('/auth/login').reply(200, {
        code: 1002,
        message: '用户名或密码错误',
        data: null,
      })

      await expect(login(loginData)).rejects.toThrow('用户名或密码错误')
    })
  })

  // 需求 3.1: 调用后端退出 API 使 Session 失效
  describe('logout', () => {
    it('should call logout API', async () => {
      mock.onPost('/auth/logout').reply(200, {
        code: 0,
        message: 'success',
        data: null,
      })

      await expect(logout()).resolves.not.toThrow()
    })
  })
})
