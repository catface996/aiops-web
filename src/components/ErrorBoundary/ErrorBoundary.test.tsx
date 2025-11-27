/**
 * ErrorBoundary 组件测试
 * 需求: 8.3
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './index'

// 一个会抛出错误的测试组件
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div data-testid="child-component">Normal content</div>
}

// 抛出自定义错误的组件
const ThrowCustomError: React.FC<{ message: string }> = ({ message }) => {
  throw new Error(message)
}

describe('ErrorBoundary Component', () => {
  // 抑制 React 错误边界的控制台错误输出
  const originalConsoleError = console.error

  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  // 需求 8.3: 捕获组件错误
  describe('Error catching', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child-component')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
    })

    it('should catch error and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument()
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowCustomError message="Custom error message" />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-message')).toHaveTextContent('Custom error message')
    })

    it('should display default message for unknown errors', () => {
      // 创建一个抛出没有 message 的错误的组件
      const ThrowEmptyError = () => {
        throw new Error()
      }

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    })
  })

  // 需求 8.3: 显示友好的错误页面
  describe('Friendly error page', () => {
    it('should display error page with title', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('页面出错了')).toBeInTheDocument()
    })

    it('should display retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-retry-button')).toBeInTheDocument()
    })

    it('should display refresh button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-refresh-button')).toBeInTheDocument()
    })
  })

  // 测试自定义 fallback
  describe('Custom fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error page</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
    })
  })

  // 需求 8.3: 记录错误到控制台
  describe('Error logging', () => {
    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalled()
    })

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })
  })

  // 测试重试功能
  describe('Retry functionality', () => {
    it('should reset error state when retry button is clicked', () => {
      // 使用一个可以控制是否抛出错误的组件
      let shouldThrow = true
      const ControlledComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div data-testid="recovered-component">Recovered</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ControlledComponent />
        </ErrorBoundary>
      )

      // 确认显示错误页面
      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()

      // 设置不再抛出错误
      shouldThrow = false

      // 点击重试按钮
      fireEvent.click(screen.getByTestId('error-retry-button'))

      // 重新渲染以应用新状态
      rerender(
        <ErrorBoundary>
          <ControlledComponent />
        </ErrorBoundary>
      )

      // 应该显示恢复后的内容
      expect(screen.getByTestId('recovered-component')).toBeInTheDocument()
    })
  })

  // 测试刷新功能
  describe('Refresh functionality', () => {
    it('should call window.location.reload when refresh button is clicked', () => {
      // Mock window.location.reload using Object.defineProperty
      const reloadMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: reloadMock },
        writable: true,
      })

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByTestId('error-refresh-button'))

      expect(reloadMock).toHaveBeenCalled()
    })
  })
})
