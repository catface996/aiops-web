/**
 * UserLayout 组件测试
 * 需求: 1.1, 2.1
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { UserLayout } from './index'

// 包装组件以提供路由上下文
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

describe('UserLayout Component', () => {
  // 需求 1.1, 2.1: 创建用于登录、注册页面的简单布局
  describe('Layout rendering', () => {
    it('should render the layout container', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByTestId('user-layout')).toBeInTheDocument()
    })

    it('should render the header section', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByTestId('user-layout-header')).toBeInTheDocument()
    })

    it('should render the form section', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByTestId('user-layout-form')).toBeInTheDocument()
    })

    it('should render the footer section', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByTestId('user-layout-footer')).toBeInTheDocument()
    })
  })

  // 显示系统标题和 Logo
  describe('Title and Logo display', () => {
    it('should render default title', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByText('AIOps 运维平台')).toBeInTheDocument()
    })

    it('should render default subtitle', () => {
      renderWithRouter(<UserLayout />)
      expect(screen.getByText('智能运维管理系统')).toBeInTheDocument()
    })

    it('should render custom title when provided', () => {
      renderWithRouter(<UserLayout title="Custom Title" />)
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render custom subtitle when provided', () => {
      renderWithRouter(<UserLayout subtitle="Custom Subtitle" />)
      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    })

    it('should render the logo icon', () => {
      renderWithRouter(<UserLayout />)
      const header = screen.getByTestId('user-layout-header')
      expect(header.querySelector('svg')).toBeInTheDocument()
    })
  })

  // 居中显示表单
  describe('Form centering', () => {
    it('should render children when provided', () => {
      renderWithRouter(
        <UserLayout>
          <div data-testid="test-form">Test Form Content</div>
        </UserLayout>
      )
      expect(screen.getByTestId('test-form')).toBeInTheDocument()
      expect(screen.getByText('Test Form Content')).toBeInTheDocument()
    })

    it('should render Outlet when no children provided', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<UserLayout />}>
              <Route path="/login" element={<div data-testid="outlet-content">Outlet Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
    })
  })

  // 页脚版权信息
  describe('Footer content', () => {
    it('should render copyright text', () => {
      renderWithRouter(<UserLayout />)
      const footer = screen.getByTestId('user-layout-footer')
      expect(footer).toHaveTextContent('AIOps Platform')
      expect(footer).toHaveTextContent('All rights reserved')
    })

    it('should render current year in copyright', () => {
      renderWithRouter(<UserLayout />)
      const currentYear = new Date().getFullYear().toString()
      const footer = screen.getByTestId('user-layout-footer')
      expect(footer).toHaveTextContent(currentYear)
    })
  })

  // 组件结构测试
  describe('Component structure', () => {
    it('should have correct DOM hierarchy', () => {
      renderWithRouter(<UserLayout />)
      const layout = screen.getByTestId('user-layout')
      const header = screen.getByTestId('user-layout-header')
      const form = screen.getByTestId('user-layout-form')
      const footer = screen.getByTestId('user-layout-footer')

      // 所有主要区域都应该在布局内
      expect(layout).toContainElement(header)
      expect(layout).toContainElement(form)
      expect(layout).toContainElement(footer)
    })
  })
})
