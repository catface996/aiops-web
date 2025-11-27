import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import request, { setRedirectHandler, get, post } from './request'
import { tokenStorage, clearAuthStorage } from './storage'

// Mock storage
vi.mock('./storage', () => ({
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

describe('Request Interceptors', () => {
  let mock: MockAdapter
  let redirectedPath: string | null = null

  beforeEach(() => {
    mock = new MockAdapter(request)
    vi.clearAllMocks()
    redirectedPath = null
    setRedirectHandler((path) => {
      redirectedPath = path
    })
  })

  afterEach(() => {
    mock.restore()
  })

  // Feature: antd-rbac-frontend, Property 26: Request auto-adds Token
  // 对于任何 API 请求，当用户已登录时，系统应该自动在请求头中添加 Authorization Bearer Token
  describe('Request Interceptor - Property: Request auto-adds Token', () => {
    it('should add Authorization header when token exists', async () => {
      // 使用多个具体的 token 测试，避免属性测试中的异步问题
      const tokens = [
        'jwt-token-12345',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        'test-token-abcdef',
        'Bearer-like-token-xyz',
        'long-token-' + 'a'.repeat(100),
      ]

      for (const token of tokens) {
        vi.mocked(tokenStorage.get).mockReturnValue(token)

        mock.onGet('/test').reply((config) => {
          expect(config.headers?.Authorization).toBe(`Bearer ${token}`)
          return [200, { code: 0, message: 'success', data: null }]
        })

        await get('/test')
        mock.reset()
      }
    })

    it('should not add Authorization header when token does not exist', async () => {
      vi.mocked(tokenStorage.get).mockReturnValue(null)

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { code: 0, message: 'success', data: null }]
      })

      await get('/test')
    })
  })

  // Feature: antd-rbac-frontend, Property 14: 401 error triggers re-login
  // 对于任何返回 401 状态码的 API 响应，系统应该清除 JWT Token 并重定向到登录页面
  describe('Response Interceptor - Property 14: 401 triggers re-login', () => {
    it('should clear auth and redirect on 401 error', async () => {
      mock.onGet('/test').reply(401, { message: 'Unauthorized' })

      await expect(get('/test')).rejects.toThrow()

      expect(clearAuthStorage).toHaveBeenCalled()
      expect(redirectedPath).toBe('/login')
    })
  })

  // 403 error redirects to 403 page
  describe('Response Interceptor - 403 error handling', () => {
    it('should redirect to 403 page on 403 error', async () => {
      mock.onGet('/test').reply(403, { message: 'Forbidden' })

      await expect(get('/test')).rejects.toThrow()

      expect(redirectedPath).toBe('/403')
    })
  })

  // 423 error shows lock message
  describe('Response Interceptor - 423 account lock handling', () => {
    it('should handle 423 account locked error', async () => {
      const lockMessage = '账号已锁定，请在30分钟后重试'
      mock.onGet('/test').reply(423, { message: lockMessage })

      await expect(get('/test')).rejects.toThrow()
      // Lock message should be displayed (handled by antd message mock)
    })
  })

  // Business error handling (code !== 0)
  describe('Response Interceptor - Business error handling', () => {
    it('should reject on business error code', async () => {
      mock.onGet('/test').reply(200, { code: 1001, message: '业务错误', data: null })

      await expect(get('/test')).rejects.toThrow('业务错误')
    })
  })

  // Successful response handling
  describe('Response Interceptor - Success handling', () => {
    it('should return data on successful response', async () => {
      const testData = { id: 1, name: 'test' }
      mock.onGet('/test').reply(200, { code: 0, message: 'success', data: testData })

      const response = await get<{ id: number; name: string }>('/test')
      expect(response.data).toEqual(testData)
    })

    it('should handle POST requests', async () => {
      const requestData = { username: 'test', password: 'password' }
      const responseData = { token: 'jwt-token' }

      mock.onPost('/login', requestData).reply(200, { code: 0, message: 'success', data: responseData })

      const response = await post<{ token: string }>('/login', requestData)
      expect(response.data).toEqual(responseData)
    })
  })
})
