/**
 * 用户管理页面（管理员）
 * 需求: 12.1, 12.2, 12.3, 12.4, 12.5
 */
import { useState, useEffect } from 'react'
import { Table, Card, Tag, Button, message, Space, Typography, Modal } from 'antd'
import { ReloadOutlined, UnlockOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getUserList, unlockAccount } from '@/services/admin'
import type { AdminUserItem } from '@/types'
import { UserRole } from '@/types'

const { Title } = Typography

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState<number | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 获取用户列表
  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await getUserList(page, pageSize)
      setUsers(response.users)
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.total,
      })
    } catch (error) {
      message.error('获取用户列表失败')
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchUsers()
  }, [])

  // 解锁账号
  const handleUnlock = (user: AdminUserItem) => {
    Modal.confirm({
      title: '确认解锁',
      icon: <ExclamationCircleOutlined />,
      content: `确定要解锁用户 "${user.username}" 的账号吗？`,
      okText: '确认解锁',
      cancelText: '取消',
      onOk: async () => {
        setUnlocking(user.userId)
        try {
          await unlockAccount(user.userId)
          message.success(`用户 "${user.username}" 已成功解锁`)
          // 刷新列表
          fetchUsers(pagination.current, pagination.pageSize)
        } catch (error) {
          message.error('解锁失败，请稍后重试')
          console.error('Failed to unlock account:', error)
        } finally {
          setUnlocking(null)
        }
      },
    })
  }

  // 分页变化
  const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
    fetchUsers(newPagination.current || 1, newPagination.pageSize || 10)
  }

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  // 表格列定义
  const columns: ColumnsType<AdminUserItem> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        if (role === UserRole.ROLE_ADMIN) {
          return <Tag color="red">管理员</Tag>
        }
        return <Tag color="blue">普通用户</Tag>
      },
    },
    {
      title: '账号状态',
      dataIndex: 'isLocked',
      key: 'status',
      render: (isLocked: boolean, record: AdminUserItem) => {
        if (isLocked) {
          return (
            <Space direction="vertical" size={0}>
              <Tag color="error">已锁定</Tag>
              {record.lockUntil && (
                <small style={{ color: '#999' }}>
                  解锁时间: {formatDate(record.lockUntil)}
                </small>
              )}
            </Space>
          )
        }
        return <Tag color="success">正常</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (text: string) => formatDate(text),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminUserItem) => (
        <Space>
          {record.isLocked && (
            <Button
              type="primary"
              size="small"
              icon={<UnlockOutlined />}
              loading={unlocking === record.userId}
              onClick={() => handleUnlock(record)}
              data-testid={`unlock-btn-${record.userId}`}
            >
              解锁
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div data-testid="users-page" style={{ padding: '24px' }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>用户管理</Title>}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          data-testid="users-table"
        />
      </Card>
    </div>
  )
}

export default UsersPage
