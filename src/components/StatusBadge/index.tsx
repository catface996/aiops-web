/**
 * 状态徽章组件
 * 需求: REQ-FR-054, REQ-FR-055, REQ-FR-056
 */
import React from 'react'
import { Badge, Dropdown, type MenuProps } from 'antd'
import { ResourceStatus, ResourceStatusDisplay, ResourceStatusColor } from '@/types'

export interface StatusBadgeProps {
  /** 资源状态 */
  status: ResourceStatus | string
  /** 点击回调（非下拉模式） */
  onClick?: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示下拉菜单 */
  showDropdown?: boolean
  /** 状态变更回调（下拉模式） */
  onStatusChange?: (status: ResourceStatus) => void
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 获取Badge的status类型
 */
const getBadgeStatus = (status: string): 'success' | 'error' | 'default' | 'warning' | 'processing' => {
  const colorMap: Record<string, 'success' | 'error' | 'default' | 'warning' | 'processing'> = {
    success: 'success',
    error: 'error',
    default: 'default',
    warning: 'warning',
    processing: 'processing',
  }
  const color = ResourceStatusColor[status as ResourceStatus] || 'default'
  return colorMap[color] || 'default'
}

/**
 * StatusBadge 组件
 * 显示资源状态徽章，支持下拉菜单切换状态
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onClick,
  disabled = false,
  showDropdown = false,
  onStatusChange,
  style,
}) => {
  const statusText = ResourceStatusDisplay[status as ResourceStatus] || status
  const badgeStatus = getBadgeStatus(status)

  // 下拉菜单选项
  const menuItems: MenuProps['items'] = showDropdown
    ? Object.entries(ResourceStatus).map(([_key, value]) => ({
        key: value,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge status={getBadgeStatus(value)} />
            {ResourceStatusDisplay[value]}
            {status === value && ' ✓'}
          </span>
        ),
      }))
    : []

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (onStatusChange) {
      onStatusChange(key as ResourceStatus)
    }
  }

  const badge = (
    <Badge
      data-testid="status-badge"
      status={badgeStatus}
      text={statusText}
      style={{
        cursor: onClick && !disabled ? 'pointer' : showDropdown && !disabled ? 'pointer' : 'default',
        ...style,
      }}
      onClick={!disabled && onClick ? onClick : undefined}
    />
  )

  // 如果需要显示下拉菜单且未禁用
  if (showDropdown && !disabled) {
    return (
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        disabled={disabled}
      >
        {badge}
      </Dropdown>
    )
  }

  return badge
}

export default StatusBadge
