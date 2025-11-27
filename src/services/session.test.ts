/**
 * 会话服务测试
 * 需求: 6.1, 11.3
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import request from '@/utils/request'
import { validateSession, forceLogoutOthers } from './session'

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

describe('Session Service', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(request)
    vi.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  // 需求 6.1: 验证 Token 有效性
  describe('validateSession', () => {
    it('should return valid session when token is valid', async () => {
      const responseData = {
        valid: true,
        user: {
          userId: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ROLE_USER',
        },
      }

      mock.onGet('/session/validate').reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await validateSession()
      expect(result).toEqual(responseData)
      expect(result.valid).toBe(true)
    })

    it('should return invalid session when token is expired', async () => {
      const responseData = {
        valid: false,
        user: null,
      }

      mock.onGet('/session/validate').reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await validateSession()
      expect(result.valid).toBe(false)
    })
  })

  // 需求 11.3: 支持强制登出其他设备
  describe('forceLogoutOthers', () => {
    it('should call force logout API', async () => {
      const responseData = {
        loggedOutCount: 2,
      }

      mock.onPost('/session/force-logout-others').reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await forceLogoutOthers()
      expect(result).toEqual(responseData)
      expect(result.loggedOutCount).toBe(2)
    })
  })
})
