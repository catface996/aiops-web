/**
 * 存储服务属性测试
 * 任务 2, 3, 4: 存储服务属性测试
 * 需求: 1.2, 1.3, 4.2, 4.3, 4.7, 4.8
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import {
  tokenStorage,
  userStorage,
  clearAuthStorage,
  clearAllStorage,
  themeStorage,
  sidebarStorage,
} from './storage'
import type { User } from '@/types'

/**
 * 生成有效日期字符串的 arbitrary
 */
const validDateStringArbitrary = fc
  .integer({ min: 946684800000, max: 1924905600000 }) // 2000-01-01 到 2030-12-31 的时间戳
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

describe('存储服务属性测试', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // 清理 localStorage
    localStorage.clear()
  })

  /**
   * 任务 2: 属性测试 - 令牌存储一致性
   * 属性1: 对于任何成功的登录响应，LocalStorage 中存储的 access_token
   * 应该与响应中返回的 token 值完全相同
   * 验证: 需求 1.2
   */
  describe('属性1: 令牌存储一致性', () => {
    it('对于任何 token 字符串，存储后读取应返回完全相同的值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (token) => {
            // 存储 token
            tokenStorage.set(token)

            // 读取 token
            const retrieved = tokenStorage.get()

            // 验证一致性
            return retrieved === token
          }
        ),
        { numRuns: 100 }
      )
    })

    it('空 token 存储后应正确读取', () => {
      tokenStorage.set('')
      expect(tokenStorage.get()).toBe('')
    })

    it('包含特殊字符的 token 应正确存储和读取', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).map((s) => `${s}.${s}.${s}`), // JWT-like format
          (token) => {
            tokenStorage.set(token)
            return tokenStorage.get() === token
          }
        ),
        { numRuns: 100 }
      )
    })

    it('连续多次设置应保留最后一个值', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
          (tokens) => {
            tokens.forEach((token) => tokenStorage.set(token))
            const lastToken = tokens[tokens.length - 1]
            return tokenStorage.get() === lastToken
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 任务 3: 属性测试 - 用户信息存储一致性
   * 属性2: 对于任何成功的登录响应，LocalStorage 中存储的 user_info
   * 应该与响应中返回的 userInfo 对象完全相同
   * 验证: 需求 1.3
   */
  describe('属性2: 用户信息存储一致性', () => {
    it('对于任何 User 对象，存储后读取应返回完全相同的值', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // 存储用户信息
          userStorage.set(user)

          // 读取用户信息
          const retrieved = userStorage.get()

          // 验证一致性
          if (retrieved === null) return false
          return (
            retrieved.userId === user.userId &&
            retrieved.username === user.username &&
            retrieved.email === user.email &&
            retrieved.role === user.role &&
            retrieved.createdAt === user.createdAt
          )
        }),
        { numRuns: 100 }
      )
    })

    it('用户角色应正确保留', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('ROLE_USER', 'ROLE_ADMIN') as fc.Arbitrary<'ROLE_USER' | 'ROLE_ADMIN'>,
          (role) => {
            const user: User = {
              userId: 1,
              username: 'test',
              email: 'test@example.com',
              role,
              createdAt: new Date().toISOString(),
            }
            userStorage.set(user)
            const retrieved = userStorage.get()
            return retrieved?.role === role
          }
        ),
        { numRuns: 100 }
      )
    })

    it('损坏的 JSON 应返回 null', () => {
      localStorage.setItem('aiops_user', 'invalid json {')
      expect(userStorage.get()).toBeNull()
    })

    it('不存在的用户信息应返回 null', () => {
      expect(userStorage.get()).toBeNull()
    })
  })

  /**
   * 任务 4: 属性测试 - 登出清理完整性
   * 属性12: 对于任何登出操作，无论 API 请求成功或失败，
   * LocalStorage 中的 access_token 和 user_info 都应该被删除
   * 验证: 需求 4.2, 4.3, 4.7, 4.8
   */
  describe('属性12: 登出清理完整性', () => {
    it('clearAuthStorage 应清除所有认证数据', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), userArbitrary, (token, user) => {
          // 设置初始状态
          tokenStorage.set(token)
          userStorage.set(user)

          // 验证数据已存储
          if (tokenStorage.get() !== token) return false
          if (userStorage.get() === null) return false

          // 执行清理
          clearAuthStorage()

          // 验证所有认证数据已清除
          return tokenStorage.get() === null && userStorage.get() === null
        }),
        { numRuns: 100 }
      )
    })

    it('clearAuthStorage 不应影响非认证数据', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), userArbitrary, (token, user) => {
          // 设置初始状态
          tokenStorage.set(token)
          userStorage.set(user)
          themeStorage.set('dark')

          // 执行认证清理
          clearAuthStorage()

          // 验证认证数据已清除
          if (tokenStorage.get() !== null) return false
          if (userStorage.get() !== null) return false

          // 验证非认证数据未受影响
          return themeStorage.get() === 'dark'
        }),
        { numRuns: 100 }
      )
    })

    it('clearAllStorage 应清除所有数据', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), userArbitrary, (token, user) => {
          // 设置初始状态
          tokenStorage.set(token)
          userStorage.set(user)
          themeStorage.set('dark')
          sidebarStorage.setCollapsed(true)

          // 执行全部清理
          clearAllStorage()

          // 验证所有数据已清除
          return (
            tokenStorage.get() === null &&
            userStorage.get() === null &&
            themeStorage.get() === 'light' && // 返回默认值
            sidebarStorage.getCollapsed() === false // 返回默认值
          )
        }),
        { numRuns: 100 }
      )
    })

    it('重复清理应该是安全的（幂等性）', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (times) => {
          // 设置初始状态
          tokenStorage.set('test-token')
          userStorage.set({
            userId: 1,
            username: 'test',
            email: 'test@example.com',
            role: 'ROLE_USER',
            createdAt: new Date().toISOString(),
          })

          // 多次执行清理
          for (let i = 0; i < times; i++) {
            clearAuthStorage()
          }

          // 验证结果一致
          return tokenStorage.get() === null && userStorage.get() === null
        }),
        { numRuns: 100 }
      )
    })

    it('部分数据存在时清理应正常工作', () => {
      // 只有 token，没有 user
      tokenStorage.set('test-token')
      clearAuthStorage()
      expect(tokenStorage.get()).toBeNull()
      expect(userStorage.get()).toBeNull()

      // 只有 user，没有 token
      userStorage.set({
        userId: 1,
        username: 'test',
        email: 'test@example.com',
        role: 'ROLE_USER',
        createdAt: new Date().toISOString(),
      })
      clearAuthStorage()
      expect(tokenStorage.get()).toBeNull()
      expect(userStorage.get()).toBeNull()
    })
  })

  /**
   * 额外单元测试
   */
  describe('tokenStorage 单元测试', () => {
    it('get 在没有 token 时返回 null', () => {
      expect(tokenStorage.get()).toBeNull()
    })

    it('set 和 get 正常工作', () => {
      tokenStorage.set('my-token')
      expect(tokenStorage.get()).toBe('my-token')
    })

    it('remove 正确删除 token', () => {
      tokenStorage.set('my-token')
      tokenStorage.remove()
      expect(tokenStorage.get()).toBeNull()
    })
  })

  describe('userStorage 单元测试', () => {
    const testUser: User = {
      userId: 123,
      username: 'testuser',
      email: 'test@example.com',
      role: 'ROLE_ADMIN',
      createdAt: '2024-01-01T00:00:00Z',
    }

    it('get 在没有用户时返回 null', () => {
      expect(userStorage.get()).toBeNull()
    })

    it('set 和 get 正常工作', () => {
      userStorage.set(testUser)
      const retrieved = userStorage.get()
      expect(retrieved).toEqual(testUser)
    })

    it('remove 正确删除用户信息', () => {
      userStorage.set(testUser)
      userStorage.remove()
      expect(userStorage.get()).toBeNull()
    })
  })

  describe('themeStorage 单元测试', () => {
    it('get 在没有设置时返回默认值 light', () => {
      expect(themeStorage.get()).toBe('light')
    })

    it('set 和 get 正常工作', () => {
      themeStorage.set('dark')
      expect(themeStorage.get()).toBe('dark')
    })

    it('无效值返回默认值', () => {
      localStorage.setItem('aiops_theme', 'invalid')
      expect(themeStorage.get()).toBe('light')
    })
  })

  describe('sidebarStorage 单元测试', () => {
    it('getCollapsed 在没有设置时返回默认值 false', () => {
      expect(sidebarStorage.getCollapsed()).toBe(false)
    })

    it('setCollapsed 和 getCollapsed 正常工作', () => {
      sidebarStorage.setCollapsed(true)
      expect(sidebarStorage.getCollapsed()).toBe(true)
    })

    it('getWidth 在没有设置时返回默认值 256', () => {
      expect(sidebarStorage.getWidth()).toBe(256)
    })

    it('setWidth 和 getWidth 正常工作', () => {
      sidebarStorage.setWidth(200)
      expect(sidebarStorage.getWidth()).toBe(200)
    })

    it('无效宽度返回默认值', () => {
      localStorage.setItem('aiops_sidebar_width', 'invalid')
      expect(sidebarStorage.getWidth()).toBe(256)
    })
  })
})
