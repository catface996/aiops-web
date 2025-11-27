/**
 * ErrorBoundary 组件
 * 捕获子组件中的 JavaScript 错误，显示友好的错误页面
 * 需求: 8.3
 */
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'

export interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode
  /** 自定义错误页面 */
  fallback?: ReactNode
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // 自定义错误页面
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 *
 * // 错误回调
 * <ErrorBoundary onError={(error, errorInfo) => logError(error, errorInfo)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * 从错误中派生状态
   * 在渲染阶段调用，用于更新状态
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * 捕获错误信息
   * 在提交阶段调用，用于记录错误
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 更新 errorInfo 状态
    this.setState({ errorInfo })

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error info:', errorInfo)

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  /**
   * 重置错误状态
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * 刷新页面
   */
  handleRefresh = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // 如果提供了自定义 fallback，使用它
      if (fallback) {
        return fallback
      }

      // 默认错误页面
      return (
        <div
          data-testid="error-boundary-fallback"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: 24,
          }}
        >
          <Result
            status="error"
            title="页面出错了"
            subTitle={
              <span data-testid="error-message">
                {error?.message || '发生了一个未知错误'}
              </span>
            }
            extra={[
              <Button
                key="retry"
                type="primary"
                onClick={this.handleReset}
                data-testid="error-retry-button"
              >
                重试
              </Button>,
              <Button
                key="refresh"
                onClick={this.handleRefresh}
                data-testid="error-refresh-button"
              >
                刷新页面
              </Button>,
            ]}
          />
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
