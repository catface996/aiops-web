/**
 * 拓扑节点组件
 * Feature: F04 - 可拖拽的资源节点，圆角矩形，上下各有连接点
 */
import React, { useCallback, memo } from 'react'
import { Tooltip } from 'antd'
import {
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  AppstoreOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { TopologyNode as TopologyNodeType } from '@/types/topology'
import { NODE_CONSTANTS } from '@/types/topology'
import styles from './TopologyNode.module.css'

// 资源类型图标映射
const typeIconMap: Record<string, React.ReactNode> = {
  SERVER: <CloudServerOutlined />,
  APPLICATION: <AppstoreOutlined />,
  DATABASE: <DatabaseOutlined />,
  API: <ApiOutlined />,
  MIDDLEWARE: <SettingOutlined />,
  REPORT: <FileTextOutlined />,
}

// 状态颜色映射
const statusColorMap: Record<string, string> = {
  RUNNING: '#52c41a',
  STOPPED: '#d9d9d9',
  MAINTENANCE: '#faad14',
  OFFLINE: '#ff4d4f',
}

export interface TopologyNodeProps {
  node: TopologyNodeType
  selected?: boolean
  connecting?: boolean
  onMouseDown?: (e: React.MouseEvent, nodeId: string) => void
  onAnchorMouseDown?: (e: React.MouseEvent, nodeId: string, anchor: 'top' | 'bottom') => void
  onAnchorMouseUp?: (e: React.MouseEvent, nodeId: string, anchor: 'top' | 'bottom') => void
  onClick?: (nodeId: string) => void
  onDoubleClick?: (nodeId: string) => void
}

/**
 * 拓扑节点组件
 * - 圆角矩形样式
 * - 上下边框中间有连接点
 * - 可拖拽
 */
export const TopologyNode: React.FC<TopologyNodeProps> = memo(({
  node,
  selected = false,
  connecting = false,
  onMouseDown,
  onAnchorMouseDown,
  onAnchorMouseUp,
  onClick,
  onDoubleClick,
}) => {
  const { WIDTH, HEIGHT, BORDER_RADIUS, ANCHOR_RADIUS } = NODE_CONSTANTS
  const statusColor = statusColorMap[node.status] || '#d9d9d9'
  const icon = typeIconMap[node.typeCode] || <AppstoreOutlined />

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMouseDown?.(e, node.id)
  }, [node.id, onMouseDown])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(node.id)
  }, [node.id, onClick])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(node.id)
  }, [node.id, onDoubleClick])

  const handleAnchorMouseDown = useCallback((e: React.MouseEvent, anchor: 'top' | 'bottom') => {
    e.stopPropagation()
    e.preventDefault()
    onAnchorMouseDown?.(e, node.id, anchor)
  }, [node.id, onAnchorMouseDown])

  const handleAnchorMouseUp = useCallback((e: React.MouseEvent, anchor: 'top' | 'bottom') => {
    e.stopPropagation()
    onAnchorMouseUp?.(e, node.id, anchor)
  }, [node.id, onAnchorMouseUp])

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      className={styles.nodeGroup}
      data-node-id={node.id}
    >
      {/* 节点主体 - 圆角矩形 */}
      <rect
        x={0}
        y={0}
        width={WIDTH}
        height={HEIGHT}
        rx={BORDER_RADIUS}
        ry={BORDER_RADIUS}
        className={`${styles.nodeRect} ${selected ? styles.selected : ''}`}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          cursor: 'move',
        }}
      />

      {/* 状态指示条 */}
      <rect
        x={0}
        y={0}
        width={4}
        height={HEIGHT}
        rx={2}
        fill={statusColor}
        style={{ pointerEvents: 'none' }}
      />

      {/* 节点内容 */}
      <foreignObject
        x={12}
        y={8}
        width={WIDTH - 24}
        height={HEIGHT - 16}
        style={{ pointerEvents: 'none' }}
      >
        <div className={styles.nodeContent}>
          <div className={styles.nodeIcon} style={{ color: statusColor }}>
            {icon}
          </div>
          <div className={styles.nodeInfo}>
            <Tooltip title={node.name}>
              <div className={styles.nodeName}>{node.name}</div>
            </Tooltip>
            <div className={styles.nodeType}>{node.type}</div>
          </div>
        </div>
      </foreignObject>

      {/* 上方连接点 */}
      <circle
        cx={WIDTH / 2}
        cy={0}
        r={ANCHOR_RADIUS}
        className={`${styles.anchor} ${connecting ? styles.anchorActive : ''}`}
        onMouseDown={(e) => handleAnchorMouseDown(e, 'top')}
        onMouseUp={(e) => handleAnchorMouseUp(e, 'top')}
        data-anchor="top"
      />

      {/* 下方连接点 */}
      <circle
        cx={WIDTH / 2}
        cy={HEIGHT}
        r={ANCHOR_RADIUS}
        className={`${styles.anchor} ${connecting ? styles.anchorActive : ''}`}
        onMouseDown={(e) => handleAnchorMouseDown(e, 'bottom')}
        onMouseUp={(e) => handleAnchorMouseUp(e, 'bottom')}
        data-anchor="bottom"
      />
    </g>
  )
})

TopologyNode.displayName = 'TopologyNode'

export default TopologyNode
