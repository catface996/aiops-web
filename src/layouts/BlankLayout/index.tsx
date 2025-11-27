/**
 * BlankLayout 布局组件
 * 用于 404、403 等错误页面的空白布局
 * 需求: 15.5
 */
import React from 'react'
import { Outlet } from 'react-router-dom'

export interface BlankLayoutProps {
  /** 子组件（可选，不提供时使用 Outlet） */
  children?: React.ReactNode
}

/**
 * BlankLayout - 空白布局组件
 * 仅渲染子组件，不添加任何额外的布局元素
 */
export const BlankLayout: React.FC<BlankLayoutProps> = ({ children }) => {
  return (
    <div data-testid="blank-layout" style={{ minHeight: '100vh' }}>
      {children || <Outlet />}
    </div>
  )
}

export default BlankLayout
