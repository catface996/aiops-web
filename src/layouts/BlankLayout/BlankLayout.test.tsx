/**
 * BlankLayout 组件测试
 * 需求: 15.5
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { BlankLayout } from './index'

// 包装组件以提供路由上下文
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('BlankLayout Component', () => {
  // 需求 15.5: 创建用于 404、403 页面的空白布局
  describe('Layout rendering', () => {
    it('should render the layout container', () => {
      renderWithRouter(<BlankLayout />)
      expect(screen.getByTestId('blank-layout')).toBeInTheDocument()
    })

    it('should have minimum viewport height', () => {
      renderWithRouter(<BlankLayout />)
      const layout = screen.getByTestId('blank-layout')
      expect(layout).toHaveStyle({ minHeight: '100vh' })
    })
  })

  // 仅渲染子组件
  describe('Children rendering', () => {
    it('should render children when provided', () => {
      renderWithRouter(
        <BlankLayout>
          <div data-testid="test-content">Test Content</div>
        </BlankLayout>
      )
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render Outlet when no children provided', () => {
      render(
        <MemoryRouter initialEntries={['/404']}>
          <Routes>
            <Route element={<BlankLayout />}>
              <Route path="/404" element={<div data-testid="outlet-content">404 Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
      expect(screen.getByText('404 Page')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      renderWithRouter(
        <BlankLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </BlankLayout>
      )
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  // 组件结构测试
  describe('Component structure', () => {
    it('should have correct DOM structure', () => {
      renderWithRouter(
        <BlankLayout>
          <div data-testid="child">Content</div>
        </BlankLayout>
      )
      const layout = screen.getByTestId('blank-layout')
      const child = screen.getByTestId('child')

      expect(layout).toContainElement(child)
    })

    it('should not add extra wrapper elements', () => {
      renderWithRouter(
        <BlankLayout>
          <div data-testid="child">Content</div>
        </BlankLayout>
      )
      const layout = screen.getByTestId('blank-layout')
      const child = screen.getByTestId('child')

      // 子元素应该是布局的直接子元素
      expect(child.parentElement).toBe(layout)
    })
  })
})
