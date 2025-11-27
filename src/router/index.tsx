/**
 * 路由配置入口
 * 需求: 4.2, 4.3, 15.1, 15.5
 */
import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { AuthGuard } from '@/components'
import { publicRoutes, protectedRoutes } from './routes'

/**
 * 加载中组件
 */
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <Spin size="large" />
  </div>
)

/**
 * 应用路由组件
 */
export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 根路径重定向到仪表盘 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 公开路由 */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* 受保护路由 */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AuthGuard roles={route.requiredRoles}>
                {route.element}
              </AuthGuard>
            }
          />
        ))}

        {/* 404 路由 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}

export { routes, publicRoutes, protectedRoutes, filterRoutesByRole, generateMenuItems } from './routes'
