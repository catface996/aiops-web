/**
 * PasswordStrength 组件测试
 * 需求: 14.1, 14.2, 14.3, 14.4, 14.5
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordStrength } from './index'

describe('PasswordStrength Component', () => {
  // 需求 14.1: 实时显示密码强度指示器
  describe('Strength indicator display', () => {
    it('should not render when password is empty', () => {
      render(<PasswordStrength password="" />)
      expect(screen.queryByTestId('password-strength')).not.toBeInTheDocument()
    })

    it('should render strength indicator when password is provided', () => {
      render(<PasswordStrength password="Test1234!" />)
      expect(screen.getByTestId('password-strength')).toBeInTheDocument()
      expect(screen.getByTestId('password-strength-progress')).toBeInTheDocument()
      expect(screen.getByTestId('password-strength-level')).toBeInTheDocument()
    })
  })

  // 需求 14.2: 密码强度等级显示
  describe('Strength levels', () => {
    it('should show weak level for short password', () => {
      render(<PasswordStrength password="abc" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')
    })

    it('should show weak level for password without enough character types', () => {
      render(<PasswordStrength password="abcdefgh" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')
    })

    it('should show medium level for password with 3 character types and 8+ chars', () => {
      render(<PasswordStrength password="Test1234" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('中')
    })

    it('should show strong level for password with 4 character types and 12+ chars', () => {
      render(<PasswordStrength password="Test1234!@#abc" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('强')
    })
  })

  // 需求 14.3: 密码不能包含用户名
  describe('Username check', () => {
    it('should show weak level when password contains username', () => {
      render(<PasswordStrength password="Testuser1234!" username="testuser" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')
      expect(screen.getByTestId('password-strength-errors')).toHaveTextContent(
        '密码不能包含用户名或邮箱'
      )
    })

    it('should not affect strength when username is not in password', () => {
      render(<PasswordStrength password="Secure1234!" username="testuser" />)
      expect(screen.getByTestId('password-strength-level')).not.toHaveTextContent('弱')
    })
  })

  // 需求 14.4: 密码不能包含邮箱
  describe('Email check', () => {
    it('should show weak level when password contains email local part', () => {
      render(<PasswordStrength password="Johndoe1234!" email="johndoe@example.com" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')
      expect(screen.getByTestId('password-strength-errors')).toHaveTextContent(
        '密码不能包含用户名或邮箱'
      )
    })

    it('should not affect strength when email is not in password', () => {
      render(<PasswordStrength password="Secure1234!" email="johndoe@example.com" />)
      expect(screen.getByTestId('password-strength-level')).not.toHaveTextContent('弱')
    })
  })

  // 需求 14.5: 错误提示显示
  describe('Error messages', () => {
    it('should show error for short password', () => {
      render(<PasswordStrength password="abc" showErrors />)
      expect(screen.getByTestId('password-strength-errors')).toHaveTextContent(
        '密码长度至少为8个字符'
      )
    })

    it('should show error for password without enough character types', () => {
      render(<PasswordStrength password="abcdefgh" showErrors />)
      expect(screen.getByTestId('password-strength-errors')).toHaveTextContent(
        '密码必须包含大写字母、小写字母、数字、特殊字符中的至少3类'
      )
    })

    it('should not show errors when showErrors is false', () => {
      render(<PasswordStrength password="abc" showErrors={false} />)
      expect(screen.queryByTestId('password-strength-errors')).not.toBeInTheDocument()
    })

    it('should show multiple errors', () => {
      render(<PasswordStrength password="test" username="test" showErrors />)
      const errors = screen.getByTestId('password-strength-errors')
      expect(errors).toHaveTextContent('密码长度至少为8个字符')
      expect(errors).toHaveTextContent('密码不能包含用户名或邮箱')
    })

    it('should not show errors when password is valid', () => {
      render(<PasswordStrength password="Secure1234!" showErrors />)
      expect(screen.queryByTestId('password-strength-errors')).not.toBeInTheDocument()
    })
  })

  // 测试组件更新
  describe('Component updates', () => {
    it('should update strength level when password changes', () => {
      const { rerender } = render(<PasswordStrength password="abc" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('弱')

      rerender(<PasswordStrength password="Test1234!@#abc" />)
      expect(screen.getByTestId('password-strength-level')).toHaveTextContent('强')
    })

    it('should update errors when username changes', () => {
      const { rerender } = render(
        <PasswordStrength password="Testuser1234!" username="other" showErrors />
      )
      expect(screen.queryByText('密码不能包含用户名或邮箱')).not.toBeInTheDocument()

      rerender(<PasswordStrength password="Testuser1234!" username="testuser" showErrors />)
      expect(screen.getByText('密码不能包含用户名或邮箱')).toBeInTheDocument()
    })
  })
})
