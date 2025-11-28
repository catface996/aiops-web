/**
 * 仪表盘页面
 * 需求: 2.2, 4.4, 4.5
 */
import { Card, Row, Col, Statistic, Typography, Tag, Descriptions } from 'antd'
import {
  UserOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types'

const { Title, Text } = Typography

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // 角色显示
  const getRoleTag = (role: string) => {
    if (role === UserRole.ROLE_ADMIN) {
      return <Tag color="red">管理员</Tag>
    }
    return <Tag color="blue">普通用户</Tag>
  }

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未知'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  return (
    <div data-testid="dashboard-page" style={{ padding: '24px' }}>
      {/* 欢迎信息 */}
      <Title level={2} style={{ marginBottom: 24 }}>
        欢迎回来，{user?.username || '用户'}！
      </Title>

      <Row gutter={[16, 16]}>
        {/* 用户信息卡片 */}
        <Col xs={24} lg={12}>
          <Card title="个人信息" data-testid="user-info-card">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> 用户名
                  </span>
                }
              >
                {user?.username || '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> 邮箱
                  </span>
                }
              >
                {user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <SafetyOutlined /> 角色
                  </span>
                }
              >
                {user?.role ? getRoleTag(user.role) : '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <ClockCircleOutlined /> 上次登录
                  </span>
                }
              >
                {formatDate(user?.lastLoginAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 统计卡片 */}
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card data-testid="stat-card-role">
                <Statistic
                  title="当前角色"
                  value={user?.role === UserRole.ROLE_ADMIN ? '管理员' : '普通用户'}
                  prefix={<SafetyOutlined />}
                  valueStyle={{
                    color: user?.role === UserRole.ROLE_ADMIN ? '#cf1322' : '#3f8600',
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card data-testid="stat-card-status">
                <Statistic
                  title="账号状态"
                  value={user?.isLocked ? '已锁定' : '正常'}
                  prefix={<UserOutlined />}
                  valueStyle={{
                    color: user?.isLocked ? '#cf1322' : '#3f8600',
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 管理员专属内容 */}
      {user?.role === UserRole.ROLE_ADMIN && (
        <Card
          title="管理员功能"
          style={{ marginTop: 16 }}
          data-testid="admin-section"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card hoverable>
                <Statistic
                  title="用户管理"
                  value="查看所有用户"
                  valueStyle={{ fontSize: 16 }}
                />
                <Text type="secondary">管理系统用户、解锁账号</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable>
                <Statistic
                  title="审计日志"
                  value="查看操作记录"
                  valueStyle={{ fontSize: 16 }}
                />
                <Text type="secondary">查看系统操作日志</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable>
                <Statistic
                  title="系统状态"
                  value="运行正常"
                  valueStyle={{ fontSize: 16, color: '#3f8600' }}
                />
                <Text type="secondary">系统各项指标正常</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 普通用户内容 */}
      {user?.role === UserRole.ROLE_USER && (
        <Card
          title="快速操作"
          style={{ marginTop: 16 }}
          data-testid="user-section"
        >
          <Text>
            欢迎使用 AIOps 系统。您当前是普通用户，可以查看仪表盘信息。
            如需更多权限，请联系管理员。
          </Text>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
