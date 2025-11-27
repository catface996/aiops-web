/**
 * 表单验证工具
 * 验证需求: 1.4, 1.5, 1.6, 14.2, 14.3, 14.4
 */

// 验证结果接口
export interface ValidationResult {
  valid: boolean
  message: string
}

// 密码强度等级
export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong'

// 密码强度结果
export interface PasswordStrengthResult {
  level: PasswordStrengthLevel
  score: number // 0-4
  errors: string[]
}

// 正则表达式
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

/**
 * 验证邮箱格式
 * 需求 1.4: 无效邮箱格式应该阻止提交并显示错误提示"邮箱格式无效"
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, message: '邮箱不能为空' }
  }

  if (email.length > 100) {
    return { valid: false, message: '邮箱长度不能超过100个字符' }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: '邮箱格式无效' }
  }

  return { valid: true, message: '' }
}

/**
 * 验证用户名
 * 需求 1.5: 用户名必须为3-20个字符，只能包含字母、数字、下划线
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim() === '') {
    return { valid: false, message: '用户名不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, message: '用户名必须为3-20个字符，只能包含字母、数字、下划线' }
  }

  if (username.length > 20) {
    return { valid: false, message: '用户名必须为3-20个字符，只能包含字母、数字、下划线' }
  }

  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, message: '用户名必须为3-20个字符，只能包含字母、数字、下划线' }
  }

  return { valid: true, message: '' }
}

/**
 * 验证密码强度
 * 需求 1.6, 14.2, 14.3, 14.4:
 * - 密码长度至少为8个字符
 * - 密码必须包含大写字母、小写字母、数字、特殊字符中的至少3类
 * - 密码不能包含用户名或邮箱
 */
export function validatePassword(
  password: string,
  username?: string,
  email?: string
): ValidationResult {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }

  if (password.length < 8) {
    return { valid: false, message: '密码长度至少为8个字符' }
  }

  if (password.length > 64) {
    return { valid: false, message: '密码长度不能超过64个字符' }
  }

  // 检查字符类型
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)

  const typeCount = [hasUppercase, hasLowercase, hasDigit, hasSpecial].filter(Boolean).length

  if (typeCount < 3) {
    return {
      valid: false,
      message: '密码必须包含大写字母、小写字母、数字、特殊字符中的至少3类',
    }
  }

  // 检查是否包含用户名
  if (username && username.length >= 3) {
    const lowerPassword = password.toLowerCase()
    const lowerUsername = username.toLowerCase()
    if (lowerPassword.includes(lowerUsername)) {
      return { valid: false, message: '密码不能包含用户名或邮箱' }
    }
  }

  // 检查是否包含邮箱的本地部分
  if (email) {
    const emailLocalPart = email.split('@')[0]
    if (emailLocalPart && emailLocalPart.length >= 3) {
      const lowerPassword = password.toLowerCase()
      const lowerEmailLocal = emailLocalPart.toLowerCase()
      if (lowerPassword.includes(lowerEmailLocal)) {
        return { valid: false, message: '密码不能包含用户名或邮箱' }
      }
    }
  }

  return { valid: true, message: '' }
}

/**
 * 计算密码强度等级
 * 需求 14.1, 14.5: 实时显示密码强度指示器
 */
export function calculatePasswordStrength(
  password: string,
  username?: string,
  email?: string
): PasswordStrengthResult {
  const errors: string[] = []
  let score = 0

  if (!password) {
    return { level: 'weak', score: 0, errors: ['密码不能为空'] }
  }

  // 长度检查
  if (password.length < 8) {
    errors.push('密码长度至少为8个字符')
  } else {
    score += 1
    if (password.length >= 12) {
      score += 1
    }
  }

  // 字符类型检查
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)

  const typeCount = [hasUppercase, hasLowercase, hasDigit, hasSpecial].filter(Boolean).length

  if (typeCount < 3) {
    errors.push('密码必须包含大写字母、小写字母、数字、特殊字符中的至少3类')
  } else {
    score += 1
    if (typeCount === 4) {
      score += 1
    }
  }

  // 检查是否包含用户名
  if (username && username.length >= 3) {
    const lowerPassword = password.toLowerCase()
    const lowerUsername = username.toLowerCase()
    if (lowerPassword.includes(lowerUsername)) {
      errors.push('密码不能包含用户名或邮箱')
      score = Math.max(0, score - 1)
    }
  }

  // 检查是否包含邮箱的本地部分
  if (email) {
    const emailLocalPart = email.split('@')[0]
    if (emailLocalPart && emailLocalPart.length >= 3) {
      const lowerPassword = password.toLowerCase()
      const lowerEmailLocal = emailLocalPart.toLowerCase()
      if (lowerPassword.includes(lowerEmailLocal)) {
        if (!errors.includes('密码不能包含用户名或邮箱')) {
          errors.push('密码不能包含用户名或邮箱')
        }
        score = Math.max(0, score - 1)
      }
    }
  }

  // 计算强度等级
  let level: PasswordStrengthLevel
  if (errors.length > 0 || score < 2) {
    level = 'weak'
  } else if (score < 3) {
    level = 'medium'
  } else {
    level = 'strong'
  }

  return { level, score, errors }
}

/**
 * 验证两次密码是否匹配
 * 需求 1.3: 两次输入的密码不一致应该阻止提交
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true, message: '' }
}
