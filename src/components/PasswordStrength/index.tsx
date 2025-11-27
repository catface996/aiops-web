/**
 * PasswordStrength 组件
 * 实时显示密码强度指示器
 * 需求: 14.1, 14.2, 14.3, 14.4, 14.5
 */
import React, { useMemo } from 'react'
import { Progress, Typography, Space } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { calculatePasswordStrength, type PasswordStrengthLevel } from '@/utils/validator'

const { Text } = Typography

export interface PasswordStrengthProps {
  /** 当前密码 */
  password: string
  /** 用户名（用于检查密码是否包含用户名） */
  username?: string
  /** 邮箱（用于检查密码是否包含邮箱） */
  email?: string
  /** 是否显示错误提示 */
  showErrors?: boolean
}

/** 强度等级对应的颜色 */
const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  weak: '#ff4d4f', // 红色
  medium: '#faad14', // 黄色
  strong: '#52c41a', // 绿色
}

/** 强度等级对应的文本 */
const STRENGTH_TEXT: Record<PasswordStrengthLevel, string> = {
  weak: '弱',
  medium: '中',
  strong: '强',
}

/** 强度等级对应的百分比 */
const STRENGTH_PERCENT: Record<PasswordStrengthLevel, number> = {
  weak: 33,
  medium: 66,
  strong: 100,
}

/**
 * 密码强度指示器组件
 *
 * @example
 * ```tsx
 * <PasswordStrength
 *   password={password}
 *   username={username}
 *   email={email}
 *   showErrors
 * />
 * ```
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  username,
  email,
  showErrors = true,
}) => {
  // 计算密码强度
  const strengthResult = useMemo(() => {
    return calculatePasswordStrength(password, username, email)
  }, [password, username, email])

  const { level, errors } = strengthResult

  // 如果密码为空，不显示组件
  if (!password) {
    return null
  }

  const color = STRENGTH_COLORS[level]
  const text = STRENGTH_TEXT[level]
  const percent = STRENGTH_PERCENT[level]

  // 获取图标
  const getIcon = () => {
    switch (level) {
      case 'strong':
        return <CheckCircleOutlined style={{ color }} />
      case 'medium':
        return <ExclamationCircleOutlined style={{ color }} />
      case 'weak':
        return <CloseCircleOutlined style={{ color }} />
    }
  }

  return (
    <div data-testid="password-strength" style={{ marginTop: 8 }}>
      {/* 强度进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor={color}
          size="small"
          style={{ flex: 1 }}
          data-testid="password-strength-progress"
        />
        <Space size={4}>
          {getIcon()}
          <Text style={{ color, minWidth: 24 }} data-testid="password-strength-level">
            {text}
          </Text>
        </Space>
      </div>

      {/* 错误提示 */}
      {showErrors && errors.length > 0 && (
        <div style={{ marginTop: 4 }} data-testid="password-strength-errors">
          {errors.map((error, index) => (
            <Text
              key={index}
              type="danger"
              style={{ display: 'block', fontSize: 12 }}
              data-testid={`password-strength-error-${index}`}
            >
              {error}
            </Text>
          ))}
        </div>
      )}
    </div>
  )
}

export default PasswordStrength
