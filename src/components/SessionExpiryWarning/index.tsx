/**
 * 会话过期警告组件
 * 任务 22: 实现会话过期警告组件
 * 任务 35: 响应式设计优化
 * 需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 10.4, 10.5, 10.6
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Modal, Button, Typography, Space, Progress, Grid } from 'antd'
import { ClockCircleOutlined, LogoutOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography
const { useBreakpoint } = Grid

export interface SessionExpiryWarningProps {
  /** 会话过期时间（毫秒时间戳） */
  expiresAt?: number
  /** 警告显示提前时间（秒），默认 300 秒（5分钟） */
  warningBeforeSeconds?: number
  /** 刷新会话回调 */
  onRefreshSession?: () => Promise<void>
  /** 是否启用会话过期检测 */
  enabled?: boolean
}

/**
 * 格式化倒计时时间
 * @param seconds 剩余秒数
 * @returns 格式化的时间字符串
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 会话过期警告组件
 * 在会话即将过期时显示警告对话框
 */
export const SessionExpiryWarning: React.FC<SessionExpiryWarningProps> = ({
  expiresAt,
  warningBeforeSeconds = 300,
  onRefreshSession,
  enabled = true,
}) => {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAuth()
  const screens = useBreakpoint()

  // 移动端检测
  const isMobile = !screens.md

  // 状态
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // 定时器引用
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 清除定时器
  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current)
      checkTimerRef.current = null
    }
  }, [])

  // 处理自动登出
  const handleAutoLogout = useCallback(async () => {
    clearTimers()
    setVisible(false)
    try {
      await logout()
    } catch {
      // 忽略错误
    }
    navigate('/login', { state: { message: '会话已过期，请重新登录' } })
  }, [clearTimers, logout, navigate])

  // 处理延长会话
  const handleExtendSession = useCallback(async () => {
    if (!onRefreshSession) {
      return
    }

    setRefreshing(true)
    try {
      await onRefreshSession()
      setVisible(false)
      clearTimers()
    } catch {
      // 刷新失败，继续显示警告
    } finally {
      setRefreshing(false)
    }
  }, [onRefreshSession, clearTimers])

  // 处理立即登出
  const handleLogoutNow = useCallback(async () => {
    clearTimers()
    setVisible(false)
    try {
      await logout()
    } catch {
      // 忽略错误
    }
    navigate('/login')
  }, [clearTimers, logout, navigate])

  // 检查会话过期状态
  useEffect(() => {
    if (!enabled || !isAuthenticated || !expiresAt) {
      clearTimers()
      setVisible(false)
      return
    }

    const checkExpiry = () => {
      const now = Date.now()
      const remainingMs = expiresAt - now
      const remainingSecs = Math.floor(remainingMs / 1000)

      // 如果已过期，自动登出
      if (remainingSecs <= 0) {
        handleAutoLogout()
        return
      }

      // 如果在警告时间内，显示警告
      if (remainingSecs <= warningBeforeSeconds && !visible) {
        setVisible(true)
        setCountdown(remainingSecs)

        // 启动倒计时
        countdownTimerRef.current = setInterval(() => {
          setCountdown((prev) => {
            const next = prev - 1
            if (next <= 0) {
              handleAutoLogout()
              return 0
            }
            return next
          })
        }, 1000)
      }
    }

    // 立即检查一次
    checkExpiry()

    // 定期检查（每 10 秒）
    checkTimerRef.current = setInterval(checkExpiry, 10000)

    return () => {
      clearTimers()
    }
  }, [enabled, isAuthenticated, expiresAt, warningBeforeSeconds, visible, clearTimers, handleAutoLogout])

  // 计算进度百分比
  const progressPercent = Math.max(0, Math.min(100, (countdown / warningBeforeSeconds) * 100))

  // 响应式尺寸
  const progressSize = isMobile ? 120 : 150
  const titleLevel = isMobile ? 3 : 2
  const buttonStyle = isMobile ? { minHeight: 44, minWidth: 100 } : {}

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#faad14', fontSize: isMobile ? 18 : 20 }} />
          <span style={{ fontSize: isMobile ? 16 : 18 }}>会话即将过期</span>
        </Space>
      }
      open={visible}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      width={isMobile ? '90%' : 420}
      data-testid="session-expiry-warning"
    >
      <div style={{ textAlign: 'center', padding: isMobile ? '16px 0' : '20px 0' }}>
        <Progress
          type="circle"
          percent={progressPercent}
          format={() => (
            <div>
              <Title level={titleLevel} style={{ margin: 0 }} data-testid="countdown-display">
                {formatCountdown(countdown)}
              </Title>
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>剩余时间</Text>
            </div>
          )}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#faad14',
          }}
          size={progressSize}
        />

        <div style={{ marginTop: isMobile ? 16 : 24 }}>
          <Text style={{ wordBreak: 'break-word' }}>
            您的会话即将在 <Text strong>{formatCountdown(countdown)}</Text> 后过期
          </Text>
        </div>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ wordBreak: 'break-word' }}>
            请选择延长会话或立即登出
          </Text>
        </div>

        <div style={{ marginTop: isMobile ? 16 : 24 }}>
          <Space size="middle" wrap direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
            {onRefreshSession && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleExtendSession}
                loading={refreshing}
                data-testid="extend-session-btn"
                style={buttonStyle}
                block={isMobile}
              >
                延长会话
              </Button>
            )}
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogoutNow}
              data-testid="logout-now-btn"
              style={buttonStyle}
              block={isMobile}
            >
              立即登出
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  )
}

export default SessionExpiryWarning
