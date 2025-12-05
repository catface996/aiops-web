/**
 * ErrorBoundary 组件测试
 * 任务 28: 全局错误处理
 * 需求: REQ-NFR-018
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './index'

// 创建一个会抛出错误的组件
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // 抑制控制台错误输出（因为我们故意触发错误）
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 正常渲染子组件
   */
  it('应该正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child component</div>
      </ErrorBoundary>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child component')).toBeInTheDocument()
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 捕获子组件错误并显示错误页面
   */
  it('应该捕获子组件错误并显示错误页面', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // 验证显示错误页面
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    expect(screen.getByText('页面出错了')).toBeInTheDocument()
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error')
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 显示重试和刷新按钮
   */
  it('应该显示重试和刷新按钮', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument()
    expect(screen.getByTestId('error-refresh-button')).toBeInTheDocument()
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 重试按钮应该重置错误状态
   */
  it('重试按钮应该重置错误状态', async () => {
    const user = userEvent.setup()
    let shouldThrow = true
    
    const DynamicComponent = () => <ThrowError shouldThrow={shouldThrow} />
    
    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )

    // 验证显示错误页面
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()

    // 修改状态，不再抛出错误
    shouldThrow = false

    // 点击重试按钮
    await user.click(screen.getByTestId('error-retry-button'))

    // 重新渲染
    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    )

    // 验证显示正常内容
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 刷新按钮应该刷新页面
   */
  it('刷新按钮应该刷新页面', async () => {
    const user = userEvent.setup()
    const reloadSpy = vi.fn()
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // 点击刷新按钮
    await user.click(screen.getByTestId('error-refresh-button'))

    // 验证调用了 reload
    expect(reloadSpy).toHaveBeenCalled()
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 支持自定义错误页面
   */
  it('应该支持自定义错误页面', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error page</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // 验证显示自定义错误页面
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom error page')).toBeInTheDocument()
    
    // 验证不显示默认错误页面
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument()
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 支持错误回调
   */
  it('应该调用错误回调', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // 验证调用了错误回调
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 错误消息应该正确显示
   */
  it('应该显示正确的错误消息', () => {
    const errorMessage = 'Custom error message'
    
    const ThrowCustomError = () => {
      throw new Error(errorMessage)
    }

    render(
      <ErrorBoundary>
        <ThrowCustomError />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
  })

  /**
   * 需求 REQ-NFR-018: 全局错误边界
   * 无错误消息时显示默认消息
   */
  it('无错误消息时应该显示默认消息', () => {
    const ThrowEmptyError = () => {
      const error = new Error()
      error.message = ''
      throw error
    }

    render(
      <ErrorBoundary>
        <ThrowEmptyError />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('error-message')).toHaveTextContent('发生了一个未知错误')
  })
})
