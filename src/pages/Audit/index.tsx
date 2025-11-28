/**
 * 审计日志页面（管理员）
 * 需求: 13.1, 13.2, 13.3, 13.4, 13.5
 */
import { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Tag,
  Button,
  message,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Descriptions,
} from 'antd'
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getAuditLogs } from '@/services/admin'
import type { AuditLogEntry, AuditLogQuery } from '@/types'
import { AuditActionType, AuditResult } from '@/types'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

// 操作类型选项
const actionTypeOptions = [
  { value: AuditActionType.LOGIN, label: '登录' },
  { value: AuditActionType.LOGOUT, label: '登出' },
  { value: AuditActionType.REGISTER, label: '注册' },
  { value: AuditActionType.PASSWORD_CHANGE, label: '密码修改' },
  { value: AuditActionType.ACCOUNT_LOCK, label: '账号锁定' },
  { value: AuditActionType.ACCOUNT_UNLOCK, label: '账号解锁' },
]

// 操作类型显示
const getActionTypeLabel = (actionType: string) => {
  const option = actionTypeOptions.find((o) => o.value === actionType)
  return option?.label || actionType
}

const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filters, setFilters] = useState<AuditLogQuery>({})
  const [form] = Form.useForm()

  // 获取审计日志
  const fetchLogs = async (query: AuditLogQuery = {}) => {
    setLoading(true)
    try {
      const response = await getAuditLogs({
        ...filters,
        ...query,
        page: query.page || pagination.current,
        pageSize: query.pageSize || pagination.pageSize,
      })
      setLogs(response.logs)
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.total,
      })
    } catch (error) {
      message.error('获取审计日志失败')
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchLogs()
  }, [])

  // 搜索
  const handleSearch = (values: {
    username?: string
    actionType?: string
    timeRange?: [dayjs.Dayjs, dayjs.Dayjs]
  }) => {
    const newFilters: AuditLogQuery = {
      username: values.username || undefined,
      actionType: values.actionType as AuditLogQuery['actionType'],
      startTime: values.timeRange?.[0]?.toISOString(),
      endTime: values.timeRange?.[1]?.toISOString(),
    }
    setFilters(newFilters)
    fetchLogs({ ...newFilters, page: 1 })
  }

  // 重置筛选
  const handleReset = () => {
    form.resetFields()
    setFilters({})
    fetchLogs({ page: 1 })
  }

  // 查看详情
  const handleViewDetail = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setDetailVisible(true)
  }

  // 分页变化
  const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
    fetchLogs({
      page: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    })
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  // 表格列定义
  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text: string) => formatDate(text),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '操作类型',
      dataIndex: 'actionType',
      key: 'actionType',
      render: (actionType: string) => {
        const colorMap: Record<string, string> = {
          [AuditActionType.LOGIN]: 'green',
          [AuditActionType.LOGOUT]: 'blue',
          [AuditActionType.REGISTER]: 'cyan',
          [AuditActionType.PASSWORD_CHANGE]: 'orange',
          [AuditActionType.ACCOUNT_LOCK]: 'red',
          [AuditActionType.ACCOUNT_UNLOCK]: 'purple',
        }
        return <Tag color={colorMap[actionType] || 'default'}>{getActionTypeLabel(actionType)}</Tag>
      },
    },
    {
      title: 'IP 地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => {
        if (result === AuditResult.SUCCESS) {
          return <Tag color="success">成功</Tag>
        }
        return <Tag color="error">失败</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: AuditLogEntry) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          data-testid={`view-detail-${record.id}`}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div data-testid="audit-page" style={{ padding: '24px' }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>审计日志</Title>}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLogs()}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        {/* 筛选表单 */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="actionType" label="操作类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              options={actionTypeOptions}
            />
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker showTime />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 日志表格 */}
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          data-testid="audit-logs-table"
        />
      </Card>

      {/* 详情 Modal */}
      <Modal
        title="日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedLog && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="日志 ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="时间">
              {formatDate(selectedLog.timestamp)}
            </Descriptions.Item>
            <Descriptions.Item label="用户名">{selectedLog.username}</Descriptions.Item>
            <Descriptions.Item label="操作类型">
              {getActionTypeLabel(selectedLog.actionType)}
            </Descriptions.Item>
            <Descriptions.Item label="IP 地址">{selectedLog.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="结果">
              {selectedLog.result === AuditResult.SUCCESS ? (
                <Tag color="success">成功</Tag>
              ) : (
                <Tag color="error">失败</Tag>
              )}
            </Descriptions.Item>
            {selectedLog.details && (
              <Descriptions.Item label="详细信息">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedLog.details}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default AuditPage
