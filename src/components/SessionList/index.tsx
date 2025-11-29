/**
 * 会话列表组件
 * 任务 24: 实现会话列表基础组件
 * 任务 27: 实现会话列表响应式布局
 * 需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 10.1, 10.2, 10.3
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Table, Card, Tag, Button, Space, Spin, Empty, message, Modal, Typography, Grid, List } from 'antd'
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SessionInfo } from '@/types'
import { getSessionList, terminateSession, terminateOtherSessions } from '@/services/session'

const { Text, Title } = Typography
const { useBreakpoint } = Grid

/**
 * 格式化相对时间
 * @param dateString ISO 日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins} 分钟前`
  } else if (diffHours < 24) {
    return `${diffHours} 小时前`
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 获取设备图标
 */
function getDeviceIcon(deviceType: string): React.ReactNode {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return <MobileOutlined />
    case 'tablet':
      return <TabletOutlined />
    default:
      return <DesktopOutlined />
  }
}

/**
 * 获取设备类型名称
 */
function getDeviceTypeName(deviceType: string): string {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return '手机'
    case 'tablet':
      return '平板'
    default:
      return '桌面'
  }
}

export interface SessionListProps {
  /** 当前会话 ID（可选，用于外部标识当前会话） */
  currentSessionId?: string
}

/**
 * 会话列表组件
 */
export const SessionList: React.FC<SessionListProps> = ({ currentSessionId: _currentSessionId }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)
  const [terminatingOthers, setTerminatingOthers] = useState(false)
  const screens = useBreakpoint()

  // 移动端使用卡片布局，平板及以上使用表格
  const isMobile = !screens.md

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSessionList()
      setSessions(response.sessions)
    } catch {
      message.error('加载会话列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 首次加载
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // 终止单个会话
  const handleTerminate = useCallback(
    (sessionId: string, isCurrent: boolean) => {
      if (isCurrent) {
        message.warning('无法终止当前会话')
        return
      }

      Modal.confirm({
        title: '确认终止会话',
        icon: <ExclamationCircleOutlined />,
        content: '确定要终止此会话吗？该设备将被强制登出。',
        okText: '确认终止',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: async () => {
          setTerminatingId(sessionId)
          try {
            await terminateSession(sessionId)
            message.success('会话已终止')
            loadSessions()
          } catch {
            message.error('终止会话失败')
          } finally {
            setTerminatingId(null)
          }
        },
      })
    },
    [loadSessions]
  )

  // 终止所有其他会话
  const handleTerminateOthers = useCallback(() => {
    const otherSessions = sessions.filter((s) => !s.isCurrent)
    if (otherSessions.length === 0) {
      message.info('没有其他会话可终止')
      return
    }

    Modal.confirm({
      title: '确认终止所有其他会话',
      icon: <ExclamationCircleOutlined />,
      content: `确定要终止其他 ${otherSessions.length} 个会话吗？这些设备将被强制登出。`,
      okText: '确认终止',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setTerminatingOthers(true)
        try {
          await terminateOtherSessions()
          message.success('所有其他会话已终止')
          loadSessions()
        } catch {
          message.error('终止会话失败')
        } finally {
          setTerminatingOthers(false)
        }
      },
    })
  }, [sessions, loadSessions])

  // 表格列定义
  const columns: ColumnsType<SessionInfo> = [
    {
      title: '设备',
      key: 'device',
      render: (_, record) => (
        <Space>
          {getDeviceIcon(record.deviceType)}
          <span>{getDeviceTypeName(record.deviceType)}</span>
          {record.isCurrent && (
            <Tag color="green" data-testid="current-session-tag">
              当前会话
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '浏览器 / 系统',
      key: 'browserOs',
      render: (_, record) => (
        <div>
          <div>{record.browser}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.os}
          </Text>
        </div>
      ),
    },
    {
      title: 'IP 地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string, record) => (
        <Space>
          <GlobalOutlined />
          <span>{ip}</span>
          {record.location && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({record.location})
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '最后活动',
      key: 'lastActivity',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <span data-testid="relative-time">{formatRelativeTime(record.lastActivityAt)}</span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          disabled={record.isCurrent}
          loading={terminatingId === record.sessionId}
          onClick={() => handleTerminate(record.sessionId, record.isCurrent)}
          data-testid={`terminate-btn-${record.sessionId}`}
        >
          终止
        </Button>
      ),
    },
  ]

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length

  // 移动端卡片渲染
  const renderMobileCard = (session: SessionInfo) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      data-testid={`session-card-${session.sessionId}`}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 设备信息行 */}
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {getDeviceIcon(session.deviceType)}
            <span>{getDeviceTypeName(session.deviceType)}</span>
            {session.isCurrent && (
              <Tag color="green" data-testid="current-session-tag">
                当前会话
              </Tag>
            )}
          </Space>
        </Space>

        {/* 浏览器和系统 */}
        <div>
          <Text strong>{session.browser}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {session.os}
          </Text>
        </div>

        {/* IP 地址 */}
        <Space>
          <GlobalOutlined />
          <span>{session.ipAddress}</span>
          {session.location && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({session.location})
            </Text>
          )}
        </Space>

        {/* 最后活动时间 */}
        <Space>
          <ClockCircleOutlined />
          <span data-testid="relative-time">{formatRelativeTime(session.lastActivityAt)}</span>
        </Space>

        {/* 操作按钮 */}
        <Button
          type="primary"
          danger
          block
          icon={<DeleteOutlined />}
          disabled={session.isCurrent}
          loading={terminatingId === session.sessionId}
          onClick={() => handleTerminate(session.sessionId, session.isCurrent)}
          data-testid={`terminate-btn-${session.sessionId}`}
          style={{ minHeight: 44 }} // 移动端触摸目标大小
        >
          终止会话
        </Button>
      </Space>
    </Card>
  )

  return (
    <Card
      title={
        <Space wrap>
          <Title level={5} style={{ margin: 0 }}>
            活动会话
          </Title>
          <Tag>{sessions.length} 个会话</Tag>
        </Space>
      }
      extra={
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={loadSessions} loading={loading}>
            刷新
          </Button>
          {otherSessionsCount > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleTerminateOthers}
              loading={terminatingOthers}
              data-testid="terminate-others-btn"
            >
              终止其他会话 ({otherSessionsCount})
            </Button>
          )}
        </Space>
      }
      data-testid="session-list"
    >
      {loading && sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : sessions.length === 0 ? (
        <Empty description="暂无会话" />
      ) : isMobile ? (
        // 移动端卡片布局
        <List
          dataSource={sessions}
          renderItem={renderMobileCard}
          loading={loading}
          data-testid="session-list-mobile"
        />
      ) : (
        // 桌面端表格布局
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="sessionId"
          pagination={false}
          loading={loading}
          data-testid="session-table"
          scroll={{ x: 'max-content' }}
        />
      )}
    </Card>
  )
}

export default SessionList
