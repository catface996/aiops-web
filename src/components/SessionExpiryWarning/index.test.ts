/**
 * 会话过期警告属性测试
 * 任务 23: 会话过期警告属性测试 - 倒计时格式化
 * 需求: 3.3
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatCountdown } from './index'

describe('会话过期警告属性测试', () => {
  /**
   * 任务 23: 属性测试 - 倒计时格式化
   * 属性11: 对于任何非负整数秒数，formatCountdown 应返回 MM:SS 格式的字符串
   * 验证: 需求 3.3
   */
  describe('属性11: 倒计时格式化', () => {
    it('返回值应符合 MM:SS 格式', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 3600 }), (seconds) => {
          const result = formatCountdown(seconds)

          // 验证格式为 MM:SS
          expect(result).toMatch(/^\d{2}:\d{2}$/)
        }),
        { numRuns: 100 }
      )
    })

    it('分钟数应正确计算', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 3600 }), (seconds) => {
          const result = formatCountdown(seconds)
          const [mins] = result.split(':').map(Number)
          const expectedMins = Math.floor(seconds / 60)

          expect(mins).toBe(expectedMins)
        }),
        { numRuns: 100 }
      )
    })

    it('秒数应正确计算', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 3600 }), (seconds) => {
          const result = formatCountdown(seconds)
          const [, secs] = result.split(':').map(Number)
          const expectedSecs = seconds % 60

          expect(secs).toBe(expectedSecs)
        }),
        { numRuns: 100 }
      )
    })

    it('分钟和秒数应有前导零', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 59 }), (seconds) => {
          const result = formatCountdown(seconds)
          const [mins, secs] = result.split(':')

          // 分钟和秒都应该是两位数
          expect(mins.length).toBe(2)
          expect(secs.length).toBe(2)
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * 单元测试 - formatCountdown 边界情况
   */
  describe('formatCountdown 单元测试', () => {
    it('0 秒应返回 "00:00"', () => {
      expect(formatCountdown(0)).toBe('00:00')
    })

    it('负数应返回 "00:00"', () => {
      expect(formatCountdown(-1)).toBe('00:00')
      expect(formatCountdown(-100)).toBe('00:00')
    })

    it('59 秒应返回 "00:59"', () => {
      expect(formatCountdown(59)).toBe('00:59')
    })

    it('60 秒应返回 "01:00"', () => {
      expect(formatCountdown(60)).toBe('01:00')
    })

    it('61 秒应返回 "01:01"', () => {
      expect(formatCountdown(61)).toBe('01:01')
    })

    it('300 秒 (5分钟) 应返回 "05:00"', () => {
      expect(formatCountdown(300)).toBe('05:00')
    })

    it('599 秒应返回 "09:59"', () => {
      expect(formatCountdown(599)).toBe('09:59')
    })

    it('600 秒 (10分钟) 应返回 "10:00"', () => {
      expect(formatCountdown(600)).toBe('10:00')
    })

    it('3599 秒应返回 "59:59"', () => {
      expect(formatCountdown(3599)).toBe('59:59')
    })

    it('3600 秒 (1小时) 应返回 "60:00"', () => {
      expect(formatCountdown(3600)).toBe('60:00')
    })

    it('典型警告时间 299 秒应返回 "04:59"', () => {
      expect(formatCountdown(299)).toBe('04:59')
    })

    it('典型警告时间 180 秒应返回 "03:00"', () => {
      expect(formatCountdown(180)).toBe('03:00')
    })

    it('典型警告时间 30 秒应返回 "00:30"', () => {
      expect(formatCountdown(30)).toBe('00:30')
    })

    it('典型警告时间 10 秒应返回 "00:10"', () => {
      expect(formatCountdown(10)).toBe('00:10')
    })

    it('典型警告时间 1 秒应返回 "00:01"', () => {
      expect(formatCountdown(1)).toBe('00:01')
    })
  })
})
