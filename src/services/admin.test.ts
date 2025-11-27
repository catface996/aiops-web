/**
 * 管理员服务测试
 * 需求: 12.1, 12.2, 13.1, 13.2
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import request from '@/utils/request'
import { getUserList, unlockAccount, getAuditLogs } from './admin'
import type { AuditLogQuery } from '@/types'

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

describe('Admin Service', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(request)
    vi.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  // 需求 12.1: 显示所有用户的列表
  describe('getUserList', () => {
    it('should fetch user list with default pagination', async () => {
      const responseData = {
        users: [
          { userId: 1, username: 'user1', email: 'user1@example.com', role: 'ROLE_USER', isLocked: false },
          { userId: 2, username: 'admin', email: 'admin@example.com', role: 'ROLE_ADMIN', isLocked: false },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      }

      mock.onGet('/admin/users', { params: { page: 1, pageSize: 10 } }).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await getUserList()
      expect(result).toEqual(responseData)
      expect(result.users).toHaveLength(2)
    })

    it('should fetch user list with custom pagination', async () => {
      const responseData = {
        users: [],
        total: 100,
        page: 5,
        pageSize: 20,
      }

      mock.onGet('/admin/users', { params: { page: 5, pageSize: 20 } }).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await getUserList(5, 20)
      expect(result.page).toBe(5)
      expect(result.pageSize).toBe(20)
    })
  })

  // 需求 12.2: 调用后端解锁 API
  describe('unlockAccount', () => {
    it('should unlock a locked account', async () => {
      const accountId = 123
      const responseData = {
        success: true,
        accountId: 123,
      }

      mock.onPost(`/admin/accounts/${accountId}/unlock`).reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await unlockAccount(accountId)
      expect(result).toEqual(responseData)
      expect(result.success).toBe(true)
    })

    it('should handle unlock non-existent account', async () => {
      const accountId = 999

      mock.onPost(`/admin/accounts/${accountId}/unlock`).reply(200, {
        code: 1003,
        message: '账号不存在',
        data: null,
      })

      await expect(unlockAccount(accountId)).rejects.toThrow('账号不存在')
    })
  })

  // 需求 13.1, 13.2: 显示日志列表和筛选功能
  describe('getAuditLogs', () => {
    it('should fetch audit logs without filters', async () => {
      const responseData = {
        logs: [
          {
            id: 1,
            timestamp: '2024-11-27T10:00:00Z',
            username: 'user1',
            action: 'LOGIN',
            ipAddress: '192.168.1.1',
            result: 'SUCCESS',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      }

      mock.onGet('/admin/audit-logs').reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await getAuditLogs()
      expect(result).toEqual(responseData)
      expect(result.logs).toHaveLength(1)
    })

    it('should fetch audit logs with filters', async () => {
      const query: AuditLogQuery = {
        username: 'admin',
        actionType: 'LOGIN',
        startTime: '2024-11-01T00:00:00Z',
        endTime: '2024-11-30T23:59:59Z',
        page: 1,
        pageSize: 20,
      }

      const responseData = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 20,
      }

      mock.onGet('/admin/audit-logs').reply(200, {
        code: 0,
        message: 'success',
        data: responseData,
      })

      const result = await getAuditLogs(query)
      expect(result.total).toBe(0)
    })
  })
})
