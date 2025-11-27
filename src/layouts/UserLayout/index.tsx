/**
 * UserLayout 布局组件
 * 用于登录、注册页面的简单布局
 * 需求: 1.1, 2.1
 */
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Typography } from 'antd'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography

export interface UserLayoutProps {
  /** 子组件（可选，不提供时使用 Outlet） */
  children?: React.ReactNode
  /** 系统标题 */
  title?: string
  /** 系统副标题 */
  subtitle?: string
}

/**
 * UserLayout - 用户布局组件
 * 用于登录、注册等认证相关页面
 */
export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  title = 'AIOps 运维平台',
  subtitle = '智能运维管理系统',
}) => {
  return (
    <div className={styles.container} data-testid="user-layout">
      <div className={styles.content}>
        {/* Logo 和标题区域 */}
        <div className={styles.header} data-testid="user-layout-header">
          <div className={styles.logo}>
            <SafetyCertificateOutlined className={styles.logoIcon} />
          </div>
          <Title level={2} className={styles.title}>
            {title}
          </Title>
          <Text type="secondary" className={styles.subtitle}>
            {subtitle}
          </Text>
        </div>

        {/* 表单区域 */}
        <div className={styles.form} data-testid="user-layout-form">
          {children || <Outlet />}
        </div>

        {/* 页脚区域 */}
        <div className={styles.footer} data-testid="user-layout-footer">
          <Text type="secondary">
            © {new Date().getFullYear()} AIOps Platform. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default UserLayout
