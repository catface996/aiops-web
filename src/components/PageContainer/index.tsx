/**
 * PageContainer 页面容器组件
 * 提供统一的页面布局样式，包括白色卡片背景、阴影、圆角等
 */
import React from 'react'
import { Card } from 'antd'

export interface PageContainerProps {
  /** 子组件 */
  children: React.ReactNode
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
  /** 卡片变体: 'outlined' 带边框, 'filled' 填充背景, 'borderless' 无边框 */
  variant?: 'outlined' | 'filled' | 'borderless'
  /** 内边距大小 */
  padding?: number | string
}

/**
 * PageContainer - 页面容器组件
 * 为页面内容提供统一的白色卡片背景和视觉样式
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  className,
  variant = 'borderless',
  padding = 24,
}) => {
  return (
    <Card
      className={className}
      variant={variant}
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        ...style,
      }}
      styles={{
        body: {
          padding: typeof padding === 'number' ? padding : padding,
        },
      }}
    >
      {children}
    </Card>
  )
}

export default PageContainer
