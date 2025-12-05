/**
 * PageBreadcrumb 通用面包屑组件
 *
 * 根据当前路由自动生成面包屑导航
 */
import React from 'react'
import { Breadcrumb } from 'antd'
import { Link, useLocation, useParams } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

/**
 * 路由配置映射
 * path -> { name, parent? }
 */
const routeMap: Record<string, { name: string; parent?: string }> = {
  '/dashboard': { name: '仪表盘' },
  '/resources': { name: '资源管理' },
  '/resources/:id': { name: '资源详情', parent: '/resources' },
  '/topology': { name: '拓扑图' },
  '/subgraphs': { name: '子图管理' },
  '/subgraphs/:id': { name: '子图详情', parent: '/subgraphs' },
  '/users': { name: '用户管理' },
  '/audit': { name: '审计日志' },
}

export interface BreadcrumbItem {
  path?: string
  name: string
  icon?: React.ReactNode
}

export interface PageBreadcrumbProps {
  /** 自定义面包屑项（覆盖自动生成） */
  items?: BreadcrumbItem[]
  /** 额外的面包屑项（追加到自动生成的后面） */
  extra?: BreadcrumbItem[]
  /** 是否显示首页图标 */
  showHome?: boolean
}

/**
 * 根据路径匹配路由配置
 */
const matchRoute = (pathname: string): { name: string; parent?: string } | null => {
  // 先尝试精确匹配
  if (routeMap[pathname]) {
    return routeMap[pathname]
  }

  // 尝试带参数的路由匹配
  for (const [pattern, config] of Object.entries(routeMap)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(pathname)) {
        return config
      }
    }
  }

  return null
}

/**
 * 构建面包屑链
 */
const buildBreadcrumbChain = (pathname: string): BreadcrumbItem[] => {
  const chain: BreadcrumbItem[] = []
  const routeConfig = matchRoute(pathname)

  if (!routeConfig) {
    return chain
  }

  // 递归构建父级
  if (routeConfig.parent) {
    const parentChain = buildBreadcrumbChain(routeConfig.parent)
    chain.push(...parentChain)
  }

  chain.push({
    path: pathname,
    name: routeConfig.name,
  })

  return chain
}

/**
 * PageBreadcrumb 组件
 */
const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  extra,
  showHome = true,
}) => {
  const location = useLocation()

  // 如果提供了自定义 items，直接使用
  let breadcrumbItems: BreadcrumbItem[] = items || buildBreadcrumbChain(location.pathname)

  // 追加额外项
  if (extra && extra.length > 0) {
    breadcrumbItems = [...breadcrumbItems, ...extra]
  }

  // 构建 Ant Design Breadcrumb items
  const antdItems = []

  // 添加首页
  if (showHome) {
    antdItems.push({
      key: 'home',
      title: (
        <Link to="/dashboard">
          <HomeOutlined />
        </Link>
      ),
    })
  }

  // 添加面包屑项
  breadcrumbItems.forEach((item, index) => {
    const isLast = index === breadcrumbItems.length - 1

    antdItems.push({
      key: item.path || index,
      title: isLast || !item.path ? (
        <span>{item.icon}{item.name}</span>
      ) : (
        <Link to={item.path}>
          {item.icon}{item.name}
        </Link>
      ),
    })
  })

  return (
    <Breadcrumb
      items={antdItems}
    />
  )
}

export default PageBreadcrumb
