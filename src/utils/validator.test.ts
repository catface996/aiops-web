import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
  calculatePasswordStrength,
} from './validator'

// Helper: 生成只包含指定字符集的字符串
const alphanumericUnderscore = (minLen: number, maxLen: number) =>
  fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'), {
      minLength: minLen,
      maxLength: maxLen,
    })
    .map((arr) => arr.join(''))

const lowercase = (minLen: number, maxLen: number) =>
  fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), {
      minLength: minLen,
      maxLength: maxLen,
    })
    .map((arr) => arr.join(''))

const uppercase = (minLen: number, maxLen: number) =>
  fc
    .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), {
      minLength: minLen,
      maxLength: maxLen,
    })
    .map((arr) => arr.join(''))

const digits = (minLen: number, maxLen: number) =>
  fc
    .array(fc.constantFrom(...'0123456789'), {
      minLength: minLen,
      maxLength: maxLen,
    })
    .map((arr) => arr.join(''))

const specialChars = (minLen: number, maxLen: number) =>
  fc
    .array(fc.constantFrom(...'!@#$%^&*'), {
      minLength: minLen,
      maxLength: maxLen,
    })
    .map((arr) => arr.join(''))

describe('Validator Utils', () => {
  // Feature: antd-rbac-frontend, Property 3: Invalid email format rejected
  // 对于任何不符合邮箱格式的输入，系统应该阻止提交并显示错误提示
  describe('validateEmail - Property 3: Invalid email format rejected', () => {
    it('should accept valid emails', () => {
      fc.assert(
        fc.property(fc.emailAddress(), (email) => {
          // 只测试100字符以内的邮箱
          if (email.length <= 100) {
            const result = validateEmail(email)
            expect(result.valid).toBe(true)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should reject emails without @ symbol', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@') && s.trim() !== ''),
          (invalid) => {
            const result = validateEmail(invalid)
            expect(result.valid).toBe(false)
            expect(result.message).toBe('邮箱格式无效')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject emails longer than 100 characters', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 101, maxLength: 200 }), (longString) => {
          const result = validateEmail(longString)
          expect(result.valid).toBe(false)
          expect(result.message).toBe('邮箱长度不能超过100个字符')
        }),
        { numRuns: 100 }
      )
    })

    it('should reject empty email', () => {
      expect(validateEmail('').valid).toBe(false)
      expect(validateEmail('   ').valid).toBe(false)
    })
  })

  // Feature: antd-rbac-frontend, Property 4: Invalid username rejected
  // 对于任何不符合用户名规则的输入，系统应该阻止提交并显示相应错误提示
  describe('validateUsername - Property 4: Invalid username rejected', () => {
    it('should accept valid usernames', () => {
      fc.assert(
        fc.property(alphanumericUnderscore(3, 20), (username) => {
          const result = validateUsername(username)
          expect(result.valid).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject usernames shorter than 3 characters', () => {
      fc.assert(
        fc.property(alphanumericUnderscore(1, 2), (short) => {
          const result = validateUsername(short)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('3-20')
        }),
        { numRuns: 100 }
      )
    })

    it('should reject usernames longer than 20 characters', () => {
      fc.assert(
        fc.property(alphanumericUnderscore(21, 30), (long) => {
          const result = validateUsername(long)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('3-20')
        }),
        { numRuns: 100 }
      )
    })

    it('should reject usernames with special characters', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            alphanumericUnderscore(2, 10),
            fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', ' ')
          ),
          ([base, special]) => {
            const invalid = base + special
            const result = validateUsername(invalid)
            expect(result.valid).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: antd-rbac-frontend, Property 5, 18, 19, 20: Password strength validation
  describe('validatePassword - Property 5, 18, 19, 20', () => {
    // 有效密码生成器: 8-64字符，包含大写、小写、数字、特殊字符中的至少3类
    const strongPasswordArb = fc
      .tuple(uppercase(1, 2), lowercase(1, 2), digits(1, 2), specialChars(1, 2), alphanumericUnderscore(0, 50))
      .map(([upper, lower, digit, special, rest]) => upper + lower + digit + special + rest)
      .filter((p) => p.length >= 8 && p.length <= 64)

    // Property 18: Short password displays error
    it('should reject passwords shorter than 8 characters', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 7 }), (short) => {
          const result = validatePassword(short)
          expect(result.valid).toBe(false)
          expect(result.message).toBe('密码长度至少为8个字符')
        }),
        { numRuns: 100 }
      )
    })

    // Property 19: Insufficient character types displays error
    it('should reject passwords without at least 3 character types', () => {
      // 只有小写字母
      fc.assert(
        fc.property(lowercase(8, 20), (lowercaseOnly) => {
          const result = validatePassword(lowercaseOnly)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('至少3类')
        }),
        { numRuns: 100 }
      )

      // 只有大写和小写
      fc.assert(
        fc.property(fc.tuple(uppercase(4, 8), lowercase(4, 8)), ([upper, lower]) => {
          const password = upper + lower
          const result = validatePassword(password)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('至少3类')
        }),
        { numRuns: 100 }
      )
    })

    // Property 20: Password containing user info displays error
    it('should reject passwords containing username', () => {
      fc.assert(
        fc.property(
          fc.tuple(lowercase(3, 10), uppercase(1, 2), digits(1, 2), specialChars(1, 2)),
          ([username, upper, digit, special]) => {
            // 构造包含用户名的密码
            const password = upper + username + digit + special
            if (password.length >= 8) {
              const result = validatePassword(password, username)
              expect(result.valid).toBe(false)
              expect(result.message).toContain('不能包含用户名或邮箱')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject passwords containing email local part', () => {
      fc.assert(
        fc.property(
          fc.tuple(lowercase(3, 10), uppercase(1, 2), digits(1, 2), specialChars(1, 2)),
          ([emailLocal, upper, digit, special]) => {
            const email = `${emailLocal}@example.com`
            const password = upper + emailLocal + digit + special
            if (password.length >= 8) {
              const result = validatePassword(password, undefined, email)
              expect(result.valid).toBe(false)
              expect(result.message).toContain('不能包含用户名或邮箱')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    // Property 5: Weak password rejected
    it('should accept strong passwords', () => {
      fc.assert(
        fc.property(strongPasswordArb, (password) => {
          // 确保不包含常见用户名模式
          const result = validatePassword(password)
          expect(result.valid).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  // Feature: antd-rbac-frontend, Property 17: Password strength real-time update
  describe('calculatePasswordStrength - Property 17', () => {
    it('should return weak for short passwords', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 7 }), (short) => {
          const result = calculatePasswordStrength(short)
          expect(result.level).toBe('weak')
          expect(result.errors.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should return weak for passwords without enough character types', () => {
      fc.assert(
        fc.property(lowercase(8, 20), (lowercaseOnly) => {
          const result = calculatePasswordStrength(lowercaseOnly)
          expect(result.level).toBe('weak')
        }),
        { numRuns: 100 }
      )
    })

    it('should return strong for passwords with all requirements', () => {
      fc.assert(
        fc.property(
          fc.tuple(uppercase(2, 4), lowercase(2, 4), digits(2, 4), specialChars(2, 4)),
          ([upper, lower, digit, special]) => {
            const password = upper + lower + digit + special
            if (password.length >= 12) {
              const result = calculatePasswordStrength(password)
              expect(result.level).toBe('strong')
              expect(result.errors.length).toBe(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update score based on password characteristics', () => {
      // 空密码
      expect(calculatePasswordStrength('').score).toBe(0)
      // 短密码
      expect(calculatePasswordStrength('abc').score).toBe(0)
      // 长度够但类型不够
      expect(calculatePasswordStrength('abcdefgh').score).toBeLessThan(2)
      // 长度够类型够
      expect(calculatePasswordStrength('Abcdefg1!').score).toBeGreaterThanOrEqual(2)
    })
  })

  // Feature: antd-rbac-frontend, Property 2: Password mismatch blocks submission
  describe('validatePasswordMatch - Property 2', () => {
    it('should return valid when passwords match', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (password) => {
          const result = validatePasswordMatch(password, password)
          expect(result.valid).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should return invalid when passwords do not match', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })).filter(([a, b]) => a !== b),
          ([password, confirmPassword]) => {
            const result = validatePasswordMatch(password, confirmPassword)
            expect(result.valid).toBe(false)
            expect(result.message).toBe('两次输入的密码不一致')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
