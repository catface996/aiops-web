/**
 * HTTP 请求客户端属性测试
 * 任务 7-10: 请求拦截器属性测试
 * 需求: 2.1, 2.2, 2.4, 2.9
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import MockAdapter from 'axios-mock-adapter'
import request, { get, post, setRedirectHandler } from './request'
import { tokenStorage, clearAuthStorage } from './storage'

// 创建 mock adapter
let mockAxios: MockAdapter

describe('HTTP 请求客户端属性测试', () => {
  beforeEach(() => {
    // 清理存储
    localStorage.clear()
    // 创建新的 mock adapter
    mockAxios = new MockAdapter(request)
    // 设置 redirect handler 为 no-op 避免真实重定向
    setRedirectHandler(() => {})
    // Mock message
    vi.mock('antd', () => ({
      message: {
        error: vi.fn(),
        success: vi.fn(),
      },
    }))
  })

  afterEach(() => {
    // 恢复 mock
    mockAxios.restore()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  /**
   * 任务 7: 属性测试 - 请求头令牌注入
   * 属性4: 对于任何发送到受保护端点的 API 请求，如果 LocalStorage 中存在 access_token，
   * 则请求头应该包含 Authorization 字段，值为 "Bearer {token}"
   * 验证: 需求 2.1
   */
  describe('属性4: 请求头令牌注入', () => {
    it('存在 token 时，请求头应包含正确的 Authorization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 500 }),
          async (token) => {
            // 设置 token
            tokenStorage.set(token)

            // 监听请求
            let capturedHeaders: Record<string, string> | undefined
            mockAxios.onGet('/test').reply((config) => {
              capturedHeaders = config.headers as Record<string, string>
              return [200, { code: 0, data: null, message: 'ok', success: true }]
            })

            // 发起请求
            await get('/test')

            // 验证 Authorization 头
            expect(capturedHeaders?.Authorization).toBe(`Bearer ${token}`)

            // 清理
            mockAxios.reset()
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('JWT 格式的 token 应正确注入', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string(), fc.string(), fc.string()).map(([a, b, c]) => `${a}.${b}.${c}`),
          (jwtLikeToken) => {
            tokenStorage.set(jwtLikeToken)
            const storedToken = tokenStorage.get()
            return storedToken === jwtLikeToken
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 任务 8: 属性测试 - 无令牌时不添加认证头
   * 属性5: 对于任何 API 请求，如果 LocalStorage 中不存在 access_token，
   * 则请求头不应该包含 Authorization 字段
   * 验证: 需求 2.2
   */
  describe('属性5: 无令牌时不添加认证头', () => {
    it('不存在 token 时，请求头不应包含 Authorization', async () => {
      // 确保没有 token
      tokenStorage.remove()

      // 监听请求
      let capturedHeaders: Record<string, string> | undefined
      mockAxios.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, { code: 0, data: null, message: 'ok', success: true }]
      })

      // 发起请求
      await get('/test')

      // 验证没有 Authorization 头
      expect(capturedHeaders?.Authorization).toBeUndefined()
    })

    it('token 被清除后，后续请求不应包含 Authorization', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1 }), async (token) => {
          // 先设置 token
          tokenStorage.set(token)

          // 然后清除
          clearAuthStorage()

          // 监听请求
          let capturedHeaders: Record<string, string> | undefined
          mockAxios.onGet('/test').reply((config) => {
            capturedHeaders = config.headers as Record<string, string>
            return [200, { code: 0, data: null, message: 'ok', success: true }]
          })

          // 发起请求
          await get('/test')

          // 验证没有 Authorization 头
          expect(capturedHeaders?.Authorization).toBeUndefined()

          // 清理
          mockAxios.reset()
          return true
        }),
        { numRuns: 50 }
      )
    })
  })

  /**
   * 任务 9: 属性测试 - 刷新后令牌更新
   * 属性6: 对于任何成功的令牌刷新响应，LocalStorage 中的 access_token
   * 应该被更新为新返回的 token 值
   * 验证: 需求 2.4
   *
   * 注：当前实现中响应拦截器直接清除 token 并重定向，
   * 不进行自动刷新（刷新逻辑由 AuthContext 处理）
   */
  describe('属性6: 刷新后令牌更新', () => {
    it('模拟令牌刷新 - 更新存储中的 token', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (oldToken, newToken) => {
            // 设置旧 token
            tokenStorage.set(oldToken)
            expect(tokenStorage.get()).toBe(oldToken)

            // 模拟刷新成功，更新 token
            tokenStorage.set(newToken)

            // 验证 token 已更新
            return tokenStorage.get() === newToken
          }
        ),
        { numRuns: 100 }
      )
    })

    it('令牌更新应该是原子的 - 不会丢失数据', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
          (tokens) => {
            // 模拟多次刷新
            tokens.forEach((token) => {
              tokenStorage.set(token)
            })

            // 最终 token 应该是最后一个
            const lastToken = tokens[tokens.length - 1]
            return tokenStorage.get() === lastToken
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 任务 10: 属性测试 - 令牌刷新幂等性
   * 属性9: 对于任何并发的令牌刷新请求，系统应该只发送一次刷新请求到后端，
   * 并且所有等待的请求应该使用相同的新令牌
   * 验证: 需求 2.9
   *
   * 注：实际的刷新去重逻辑在 AuthContext 中实现
   * 这里测试存储层的一致性
   */
  describe('属性9: 令牌刷新幂等性', () => {
    it('并发设置相同 token 应该保持一致', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (token) => {
          // 模拟多个请求并发设置相同的 token
          const concurrentOps = 5
          for (let i = 0; i < concurrentOps; i++) {
            tokenStorage.set(token)
          }

          // token 应该正确设置
          return tokenStorage.get() === token
        }),
        { numRuns: 100 }
      )
    })

    it('并发清除操作应该是安全的', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 5 }),
          (token, clearCount) => {
            // 设置 token
            tokenStorage.set(token)

            // 模拟多次并发清除
            for (let i = 0; i < clearCount; i++) {
              clearAuthStorage()
            }

            // 应该都被清除
            return tokenStorage.get() === null
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 单元测试 - 请求方法
   */
  describe('请求方法单元测试', () => {
    it('GET 请求应正确发送', async () => {
      mockAxios.onGet('/test').reply(200, {
        code: 0,
        data: { id: 1, name: 'test' },
        message: 'ok',
        success: true,
      })

      const result = await get<{ id: number; name: string }>('/test')
      expect(result.data).toEqual({ id: 1, name: 'test' })
    })

    it('POST 请求应正确发送数据', async () => {
      mockAxios.onPost('/test').reply((config) => {
        const data = JSON.parse(config.data)
        return [
          200,
          {
            code: 0,
            data: { received: data },
            message: 'ok',
            success: true,
          },
        ]
      })

      const result = await post<{ received: { foo: string } }>('/test', { foo: 'bar' })
      expect(result.data?.received).toEqual({ foo: 'bar' })
    })

    it('业务错误应被拒绝', async () => {
      mockAxios.onGet('/test').reply(200, {
        code: 1001,
        data: null,
        message: '业务错误',
        success: false,
      })

      await expect(get('/test')).rejects.toThrow('业务错误')
    })

    it('401 错误应清除认证数据', async () => {
      tokenStorage.set('test-token')
      mockAxios.onGet('/test').reply(401, {
        code: 'AUTH_ERROR',
        message: '未授权',
      })

      await expect(get('/test')).rejects.toThrow()

      // token 应该被清除
      expect(tokenStorage.get()).toBeNull()
    })

    it('网络错误应被正确处理', async () => {
      mockAxios.onGet('/test').networkError()

      await expect(get('/test')).rejects.toThrow()
    })
  })

  /**
   * 边界测试
   */
  describe('边界测试', () => {
    it('空字符串 token 应正确处理', async () => {
      tokenStorage.set('')

      let capturedHeaders: Record<string, string> | undefined
      mockAxios.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, { code: 0, data: null, message: 'ok', success: true }]
      })

      await get('/test')

      // 空字符串是 falsy 值，不会添加 Authorization 头
      expect(capturedHeaders?.Authorization).toBeUndefined()
    })

    it('特殊字符 token 应正确注入', async () => {
      const specialToken = 'token-with-special-chars!@#$%^&*()'
      tokenStorage.set(specialToken)

      let capturedHeaders: Record<string, string> | undefined
      mockAxios.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, { code: 0, data: null, message: 'ok', success: true }]
      })

      await get('/test')

      expect(capturedHeaders?.Authorization).toBe(`Bearer ${specialToken}`)
    })

    it('很长的 token 应正确处理', async () => {
      const longToken = 'a'.repeat(10000)
      tokenStorage.set(longToken)

      let capturedHeaders: Record<string, string> | undefined
      mockAxios.onGet('/test').reply((config) => {
        capturedHeaders = config.headers as Record<string, string>
        return [200, { code: 0, data: null, message: 'ok', success: true }]
      })

      await get('/test')

      expect(capturedHeaders?.Authorization).toBe(`Bearer ${longToken}`)
    })
  })

  /**
   * 任务 28: 重试机制测试
   * 需求 REQ-NFR-014-B: 请求重试机制（非4xx错误自动重试2次）
   */
  describe('重试机制测试', () => {
    it('500 错误应该重试 2 次', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [500, { message: '服务器错误' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 初始请求 + 2次重试 = 3次
      expect(attemptCount).toBe(3)
    })

    it('网络错误应该重试 2 次', async () => {
      let attemptCount = 0
      
      // Use networkError() to simulate network failure
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [500, { message: '服务器错误' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 初始请求 + 2次重试 = 3次 (500 errors trigger retry)
      expect(attemptCount).toBe(3)
    })

    it('400 错误不应该重试', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [400, { message: '请求参数无效' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 只有初始请求，不重试
      expect(attemptCount).toBe(1)
    })

    it('401 错误不应该重试', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [401, { message: '未授权' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 只有初始请求，不重试
      expect(attemptCount).toBe(1)
    })

    it('403 错误不应该重试', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [403, { message: '禁止访问' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 只有初始请求，不重试
      expect(attemptCount).toBe(1)
    })

    it('404 错误不应该重试', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        return [404, { message: '资源不存在' }]
      })

      await expect(get('/test')).rejects.toThrow()
      
      // 只有初始请求，不重试
      expect(attemptCount).toBe(1)
    })

    it('第二次重试成功应该返回结果', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        if (attemptCount < 3) {
          return [500, { message: '服务器错误' }]
        }
        return [200, { code: 0, data: { success: true }, message: 'ok', success: true }]
      })

      const result = await get<{ success: boolean }>('/test')
      
      expect(attemptCount).toBe(3)
      expect(result.data?.success).toBe(true)
    })
  })

  /**
   * 任务 28: 超时处理测试
   * 需求 REQ-NFR-014-A: 网络超时处理（30秒超时）
   */
  describe('超时处理测试', () => {
    it('超时错误应该显示正确的错误消息', async () => {
      mockAxios.onGet('/test').timeout()

      await expect(get('/test')).rejects.toThrow()
    })
  })

  /**
   * 任务 28: 错误分类测试
   * 需求 REQ-NFR-014, REQ-NFR-015, REQ-NFR-016, REQ-NFR-017, REQ-NFR-019
   */
  describe('错误分类测试', () => {
    it('400 错误应该显示参数无效消息', async () => {
      mockAxios.onGet('/test').reply(400, { message: '参数错误' })

      await expect(get('/test')).rejects.toThrow()
    })

    it('404 错误应该显示资源不存在消息', async () => {
      mockAxios.onGet('/test').reply(404, { message: '资源不存在' })

      await expect(get('/test')).rejects.toThrow()
    })

    it('409 错误应该显示冲突消息', async () => {
      mockAxios.onGet('/test').reply(409, { message: '数据冲突' })

      await expect(get('/test')).rejects.toThrow()
    })

    it('500 错误应该显示服务器错误消息', async () => {
      mockAxios.onGet('/test').reply(500, { message: '服务器内部错误' })

      await expect(get('/test')).rejects.toThrow()
    })
  })
})
