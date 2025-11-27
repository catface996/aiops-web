/**
 * 应用根组件
 * 集成路由、认证上下文、错误边界
 */
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components'
import { AppRouter } from '@/router'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
