/**
 * PasswordStrength 属性测试
 * 需求: 14.1, 14.5
 * 属性 17: 密码强度实时更新
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { PasswordStrength } from './index'

// 生成有效用户名的 Arbitrary
const validUsername = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('')), {
    minLength: 3,
    maxLength: 20,
  })
  .map((arr) => arr.join(''))

// 生成有效邮箱的 Arbitrary
const validEmail = fc.emailAddress().filter((e) => e.length <= 100)

// 生成弱密码的 Arbitrary（长度不足或字符类型不够）
const weakPassword = fc.oneof(
  // 太短的密码
  fc.string({ minLength: 1, maxLength: 7 }),
  // 只有小写字母的长密码
  fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 8, maxLength: 12 })
    .map((arr) => arr.join(''))
)

// 生成中等强度密码的 Arbitrary（满足基本要求但不够强）
const mediumPassword = fc
  .tuple(
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 2, maxLength: 3 }),
    fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 2, maxLength: 3 }),
    fc.array(fc.constantFrom(...'0123456789'.split('')), { minLength: 2, maxLength: 3 })
  )
  .map(([lower, upper, digit]) => [...lower, ...upper, ...digit].join(''))
  .filter((p) => p.length >= 8 && p.length < 12)

// 生成强密码的 Arbitrary（满足所有要求）
const strongPassword = fc
  .tuple(
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 3, maxLength: 4 }),
    fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 3, maxLength: 4 }),
    fc.array(fc.constantFrom(...'0123456789'.split('')), { minLength: 3, maxLength: 4 }),
    fc.array(fc.constantFrom(...'!@#$%^&*'.split('')), { minLength: 2, maxLength: 3 })
  )
  .map(([lower, upper, digit, special]) => [...lower, ...upper, ...digit, ...special].join(''))
  .filter((p) => p.length >= 12)

describe('PasswordStrength Property Tests', () => {
  // Feature: antd-rbac-frontend, Property 17: Password strength updates in real-time
  // 对于任何密码输入，系统应该实时更新强度指示器
  describe('Property 17: Password strength updates in real-time', () => {
    it('should show weak level for any weak password', () => {
      fc.assert(
        fc.property(weakPassword, (password) => {
          const { unmount } = render(<PasswordStrength password={password} />)

          if (password.length > 0) {
            const levelElement = screen.getByTestId('password-strength-level')
            expect(levelElement).toHaveTextContent('弱')
          }

          unmount()
          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should show medium level for medium strength passwords', () => {
      fc.assert(
        fc.property(mediumPassword, (password) => {
          const { unmount } = render(<PasswordStrength password={password} />)

          const levelElement = screen.getByTestId('password-strength-level')
          expect(levelElement).toHaveTextContent('中')

          unmount()
          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should show strong level for strong passwords', () => {
      fc.assert(
        fc.property(strongPassword, (password) => {
          const { unmount } = render(<PasswordStrength password={password} />)

          const levelElement = screen.getByTestId('password-strength-level')
          expect(levelElement).toHaveTextContent('强')

          unmount()
          return true
        }),
        { numRuns: 50 }
      )
    })

    it('should update strength level when password changes', () => {
      fc.assert(
        fc.property(weakPassword, strongPassword, (weak, strong) => {
          // 跳过空密码
          if (weak.length === 0) return true

          const { rerender, unmount } = render(<PasswordStrength password={weak} />)

          // 初始显示弱
          expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')

          // 更新为强密码
          rerender(<PasswordStrength password={strong} />)

          // 应该更新为强
          expect(screen.getByTestId('password-strength-level')).toHaveTextContent('强')

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })
  })

  // 属性测试：密码包含用户名时强度降低
  describe('Property: Password containing username reduces strength', () => {
    it('should show weak level when password contains username', () => {
      fc.assert(
        fc.property(validUsername, (username) => {
          // 创建一个包含用户名的密码
          const password = `${username}Test123!`

          const { unmount } = render(
            <PasswordStrength password={password} username={username} showErrors />
          )

          // 应该显示弱，因为包含用户名
          const levelElement = screen.getByTestId('password-strength-level')
          expect(levelElement).toHaveTextContent('弱')

          // 应该显示错误信息
          const errorsElement = screen.getByTestId('password-strength-errors')
          expect(errorsElement).toHaveTextContent('密码不能包含用户名或邮箱')

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })

    it('should not affect strength when password does not contain username', () => {
      fc.assert(
        fc.property(strongPassword, validUsername, (password, username) => {
          // 确保密码不包含用户名
          if (password.toLowerCase().includes(username.toLowerCase())) {
            return true // 跳过这种情况
          }

          const { unmount } = render(
            <PasswordStrength password={password} username={username} />
          )

          // 应该显示强
          const levelElement = screen.getByTestId('password-strength-level')
          expect(levelElement).toHaveTextContent('强')

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })
  })

  // 属性测试：密码包含邮箱时强度降低
  describe('Property: Password containing email reduces strength', () => {
    it('should show weak level when password contains email local part', () => {
      fc.assert(
        fc.property(validEmail, (email) => {
          const localPart = email.split('@')[0]
          // 跳过太短的邮箱本地部分
          if (localPart.length < 3) return true

          // 创建一个包含邮箱本地部分的密码
          const password = `${localPart}Test123!`

          const { unmount } = render(
            <PasswordStrength password={password} email={email} showErrors />
          )

          // 应该显示弱，因为包含邮箱
          const levelElement = screen.getByTestId('password-strength-level')
          expect(levelElement).toHaveTextContent('弱')

          // 应该显示错误信息
          const errorsElement = screen.getByTestId('password-strength-errors')
          expect(errorsElement).toHaveTextContent('密码不能包含用户名或邮箱')

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })
  })

  // 属性测试：错误信息显示一致性
  describe('Property: Error message display consistency', () => {
    it('should always show errors when showErrors is true and password is invalid', () => {
      fc.assert(
        fc.property(weakPassword, (password) => {
          // 跳过空密码
          if (password.length === 0) return true

          const { unmount } = render(
            <PasswordStrength password={password} showErrors />
          )

          // 应该显示错误
          const errorsElement = screen.queryByTestId('password-strength-errors')
          expect(errorsElement).toBeInTheDocument()

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })

    it('should never show errors when showErrors is false', () => {
      fc.assert(
        fc.property(weakPassword, (password) => {
          // 跳过空密码
          if (password.length === 0) return true

          const { unmount } = render(
            <PasswordStrength password={password} showErrors={false} />
          )

          // 不应该显示错误
          const errorsElement = screen.queryByTestId('password-strength-errors')
          expect(errorsElement).not.toBeInTheDocument()

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })

    it('should not show errors when password is strong', () => {
      fc.assert(
        fc.property(strongPassword, (password) => {
          const { unmount } = render(
            <PasswordStrength password={password} showErrors />
          )

          // 强密码不应该有错误
          const errorsElement = screen.queryByTestId('password-strength-errors')
          expect(errorsElement).not.toBeInTheDocument()

          unmount()
          return true
        }),
        { numRuns: 30 }
      )
    })
  })
})
