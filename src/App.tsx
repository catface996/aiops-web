/**
 * 应用根组件
 * 集成路由、认证上下文、国际化、错误边界
 */
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { ErrorBoundary } from '@/components'
import { AppRouter } from '@/router'

function App() {
  return (
    <LocaleProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </LocaleProvider>
  )
}

export default App
