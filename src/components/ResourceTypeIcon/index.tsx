/**
 * 资源类型图标组件
 * 需求: REQ-FR-003, REQ-FR-014
 */
import React from 'react'
import {
  CloudServerOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ClusterOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

export interface ResourceTypeIconProps {
  /** 资源类型编码 */
  type: string
  /** 图标大小 */
  size?: number
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
}

/**
 * 资源类型图标映射
 */
const iconMap: Record<string, React.ReactNode> = {
  SERVER: <CloudServerOutlined />,
  APPLICATION: <AppstoreOutlined />,
  DATABASE: <DatabaseOutlined />,
  API: <ApiOutlined />,
  MIDDLEWARE: <ClusterOutlined />,
  REPORT: <FileTextOutlined />,
}

/**
 * ResourceTypeIcon 组件
 * 根据资源类型显示对应的图标
 */
export const ResourceTypeIcon: React.FC<ResourceTypeIconProps> = ({
  type,
  size = 16,
  style,
  className,
}) => {
  const icon = iconMap[type?.toUpperCase()] || <QuestionCircleOutlined />

  return (
    <span
      data-testid="resource-type-icon"
      className={className}
      style={{
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {icon}
    </span>
  )
}

export default ResourceTypeIcon
