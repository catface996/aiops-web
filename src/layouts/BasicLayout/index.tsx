/**
 * BasicLayout 布局组件
 * 用于已登录用户的主布局
 * 需求: 5.1, 7.1, 7.4, 7.5, 7.6
 */
import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import ProLayout from '@ant-design/pro-layout'
import type { ProLayoutProps } from '@ant-design/pro-layout'
import { Dropdown, Switch, Space, Avatar, Typography, message, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  AuditOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { themeStorage, sidebarStorage } from '@/utils/storage'
import type { UserRole } from '@/types'

const { Text } = Typography

export interface BasicLayoutProps {
  /** 子组件（可选，不提供时使用 Outlet） */
  children?: React.ReactNode
}

// 菜单图标映射
const iconMap: Record<string, React.ReactNode> = {
  '/dashboard': <DashboardOutlined />,
  '/users': <TeamOutlined />,
  '/audit': <AuditOutlined />,
}

// 路由配置
interface MenuRoute {
  path: string
  name: string
  icon?: React.ReactNode
  requiredRoles?: UserRole[]
}

const menuRoutes: MenuRoute[] = [
  { path: '/dashboard', name: '仪表盘', icon: <DashboardOutlined /> },
  { path: '/users', name: '用户管理', icon: <TeamOutlined />, requiredRoles: ['ROLE_ADMIN'] },
  { path: '/audit', name: '审计日志', icon: <AuditOutlined />, requiredRoles: ['ROLE_ADMIN'] },
]

/**
 * BasicLayout - 基础布局组件
 * 用于已登录用户的主界面
 */
export const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()
  const { hasRole } = usePermission()

  // 主题状态
  const [isDarkMode, setIsDarkMode] = useState(() => themeStorage.get() === 'dark')
  // 侧边栏折叠状态
  const [collapsed, setCollapsed] = useState(() => sidebarStorage.getCollapsed())

  // 保存主题偏好
  useEffect(() => {
    themeStorage.set(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // 保存侧边栏状态
  useEffect(() => {
    sidebarStorage.setCollapsed(collapsed)
  }, [collapsed])

  // 处理退出登录（带确认对话框）
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要退出登录吗？',
      okText: '确认退出',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await logout()
          message.success('退出成功')
          navigate('/login')
        } catch {
          // 即使 API 调用失败，也清除本地状态并重定向
          message.warning('退出时发生错误，已清除本地登录状态')
          navigate('/login')
        }
      },
    })
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      handleLogout()
    }
  }

  // 过滤菜单项（根据用户角色）
  const filteredMenuRoutes = menuRoutes.filter((route) => {
    if (!route.requiredRoles || route.requiredRoles.length === 0) {
      return true
    }
    return route.requiredRoles.some((role) => hasRole(role))
  })

  // 转换为 ProLayout 菜单数据
  const menuData = filteredMenuRoutes.map((route) => ({
    path: route.path,
    name: route.name,
    icon: route.icon || iconMap[route.path],
  }))

  // ProLayout 配置
  const layoutSettings: ProLayoutProps = {
    title: 'AIOps',
    logo: false,
    layout: 'mix',
    fixSiderbar: true,
    fixedHeader: true,
    collapsed,
    onCollapse: setCollapsed,
    navTheme: isDarkMode ? 'realDark' : 'light',
    token: {
      header: {
        colorBgHeader: isDarkMode ? '#141414' : '#fff',
      },
      sider: {
        colorMenuBackground: isDarkMode ? '#141414' : '#fff',
      },
    },
  }

  // 右上角操作区
  const rightContentRender = () => (
    <Space size="middle" data-testid="basic-layout-header-actions">
      {/* 主题切换 */}
      <Space data-testid="theme-switch">
        {isDarkMode ? <BulbFilled style={{ color: '#fadb14' }} /> : <BulbOutlined />}
        <Switch
          checked={isDarkMode}
          onChange={setIsDarkMode}
          checkedChildren="暗"
          unCheckedChildren="亮"
          size="small"
        />
      </Space>

      {/* 用户信息 */}
      {isAuthenticated && user && (
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }} data-testid="user-dropdown">
            <Avatar size="small" icon={<UserOutlined />} />
            <Text>{user.username}</Text>
          </Space>
        </Dropdown>
      )}
    </Space>
  )

  return (
    <div data-testid="basic-layout" style={{ height: '100vh' }}>
      <ProLayout
        {...layoutSettings}
        location={location}
        route={{
          path: '/',
          routes: menuData,
        }}
        menuItemRender={(item, dom) => (
          <div onClick={() => navigate(item.path || '/')}>{dom}</div>
        )}
        rightContentRender={rightContentRender}
        headerTitleRender={(logo, title) => (
          <div
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {logo}
            {title}
          </div>
        )}
      >
        <div data-testid="basic-layout-content">
          {children || <Outlet />}
        </div>
      </ProLayout>
    </div>
  )
}

export default BasicLayout
