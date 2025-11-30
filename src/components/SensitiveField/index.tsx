/**
 * 敏感字段显示组件
 * 需求: REQ-FR-031, REQ-FR-032
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button, Tooltip, Spin } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { SENSITIVE_DISPLAY_DURATION } from '@/utils/resourceConstants'

export interface SensitiveFieldProps {
  /** 敏感字段的掩码值，通常为 "***" */
  value?: string
  /** 是否有查看权限 */
  canView: boolean
  /** 获取明文的回调函数 */
  onView?: () => Promise<string>
  /** 无权限时的提示文字 */
  noPermissionTip?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * SensitiveField 组件
 * 显示敏感字段，支持显示/隐藏切换
 */
export const SensitiveField: React.FC<SensitiveFieldProps> = ({
  value = '***',
  canView,
  onView,
  noPermissionTip = '仅Owner可查看',
  style,
}) => {
  const [visible, setVisible] = useState(false)
  const [plaintext, setPlaintext] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // 处理显示按钮点击
  const handleView = useCallback(async () => {
    if (!onView) return

    setLoading(true)
    try {
      const text = await onView()
      setPlaintext(text)
      setVisible(true)

      // 3秒后自动隐藏
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setPlaintext(null)
      }, SENSITIVE_DISPLAY_DURATION)
    } catch (error) {
      console.error('Failed to fetch sensitive data:', error)
    } finally {
      setLoading(false)
    }
  }, [onView])

  // 手动隐藏
  const handleHide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setVisible(false)
    setPlaintext(null)
  }, [])

  // 显示的文本
  const displayText = visible && plaintext ? plaintext : value

  return (
    <span data-testid="sensitive-field" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span data-testid="sensitive-value">{displayText}</span>

      {canView && onView ? (
        // 有权限：显示/隐藏按钮
        loading ? (
          <Spin size="small" />
        ) : visible ? (
          <Button
            type="link"
            size="small"
            icon={<EyeInvisibleOutlined />}
            onClick={handleHide}
            data-testid="hide-button"
          >
            隐藏
          </Button>
        ) : (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={handleView}
            data-testid="show-button"
          >
            显示
          </Button>
        )
      ) : (
        // 无权限：显示提示
        <Tooltip title={noPermissionTip}>
          <EyeInvisibleOutlined style={{ color: '#999', cursor: 'not-allowed' }} />
        </Tooltip>
      )}
    </span>
  )
}

export default SensitiveField
