/**
 * 会话列表组件属性测试
 * 任务 25: 编写会话列表属性测试 - 相对时间格式化
 * 任务 26: 编写会话列表属性测试 - 当前会话条件渲染
 * 需求: 5.7, 5.8, 5.9, 5.10
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatRelativeTime } from './index'

describe('会话列表属性测试', () => {
  describe('属性13: 相对时间格式化', () => {
    it('60秒内返回"刚刚"', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 59 }), (secondsAgo) => {
          const date = new Date(Date.now() - secondsAgo * 1000)
          const result = formatRelativeTime(date.toISOString())
          expect(result).toBe('刚刚')
        }),
        { numRuns: 100 }
      )
    })

    it('1-59分钟返回"X 分钟前"', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 59 }), (minutesAgo) => {
          const date = new Date(Date.now() - minutesAgo * 60 * 1000)
          const result = formatRelativeTime(date.toISOString())
          expect(result).toBe(`${minutesAgo} 分钟前`)
        }),
        { numRuns: 100 }
      )
    })

    it('1-23小时返回"X 小时前"', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 23 }), (hoursAgo) => {
          const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
          const result = formatRelativeTime(date.toISOString())
          expect(result).toBe(`${hoursAgo} 小时前`)
        }),
        { numRuns: 100 }
      )
    })

    it('1-6天返回"X 天前"', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 6 }), (daysAgo) => {
          const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
          const result = formatRelativeTime(date.toISOString())
          expect(result).toBe(`${daysAgo} 天前`)
        }),
        { numRuns: 100 }
      )
    })

    it('7天及以上返回日期格式', () => {
      fc.assert(
        fc.property(fc.integer({ min: 7, max: 365 }), (daysAgo) => {
          const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
          const result = formatRelativeTime(date.toISOString())
          // 应该返回中文日期格式，如 "2025/11/22"
          expect(result).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('单元测试 - formatRelativeTime 边界情况', () => {
    it('正好0秒返回"刚刚"', () => {
      const now = new Date()
      expect(formatRelativeTime(now.toISOString())).toBe('刚刚')
    })

    it('正好59秒返回"刚刚"', () => {
      const date = new Date(Date.now() - 59 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('刚刚')
    })

    it('正好60秒返回"1 分钟前"', () => {
      const date = new Date(Date.now() - 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('1 分钟前')
    })

    it('正好59分钟返回"59 分钟前"', () => {
      const date = new Date(Date.now() - 59 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('59 分钟前')
    })

    it('正好60分钟返回"1 小时前"', () => {
      const date = new Date(Date.now() - 60 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('1 小时前')
    })

    it('正好23小时返回"23 小时前"', () => {
      const date = new Date(Date.now() - 23 * 60 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('23 小时前')
    })

    it('正好24小时返回"1 天前"', () => {
      const date = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('1 天前')
    })

    it('正好6天返回"6 天前"', () => {
      const date = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date.toISOString())).toBe('6 天前')
    })

    it('正好7天返回日期格式', () => {
      const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(date.toISOString())
      expect(result).toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/)
    })
  })

  describe('属性测试 - 时间单调性', () => {
    it('越旧的时间返回越大的单位', () => {
      // 生成两个不同时间差的值
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 59 }), // 秒
          fc.integer({ min: 1, max: 59 }), // 分钟
          (seconds, minutes) => {
            const dateSeconds = new Date(Date.now() - seconds * 1000)
            const dateMinutes = new Date(Date.now() - minutes * 60 * 1000)

            const resultSeconds = formatRelativeTime(dateSeconds.toISOString())
            const resultMinutes = formatRelativeTime(dateMinutes.toISOString())

            // 秒级别应该是"刚刚"，分钟级别应该是"X 分钟前"
            expect(resultSeconds).toBe('刚刚')
            expect(resultMinutes).toContain('分钟前')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
