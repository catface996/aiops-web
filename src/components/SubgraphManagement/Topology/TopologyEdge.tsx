/**
 * 拓扑连线组件 - 子图管理专用
 * Feature: F08 - 子图管理拓扑可视化
 * Adapted from: F04 TopologyEdge
 */
import React, { memo, useMemo } from 'react'
import type { TopologyEdge as TopologyEdgeType, TopologyNode, Position } from '@/types/topology'
import { RelationTypeColor, NODE_CONSTANTS } from '@/types/topology'
import styles from './TopologyEdge.module.css'

export interface TopologyEdgeProps {
  edge: TopologyEdgeType
  sourceNode: TopologyNode
  targetNode: TopologyNode
  selected?: boolean
  onClick?: (edgeId: string) => void
  onDoubleClick?: (edgeId: string) => void
}

/**
 * 计算连接点的实际坐标
 */
function getAnchorPosition(
  node: TopologyNode,
  anchor: 'top' | 'bottom'
): Position {
  const { WIDTH, HEIGHT } = NODE_CONSTANTS
  return {
    x: node.position.x + WIDTH / 2,
    y: node.position.y + (anchor === 'top' ? 0 : HEIGHT),
  }
}

/**
 * 生成贝塞尔曲线路径
 */
function generatePath(
  source: Position,
  target: Position,
  sourceAnchor: 'top' | 'bottom',
  targetAnchor: 'top' | 'bottom'
): string {
  // 计算控制点偏移量（使曲线更平滑）
  const dy = Math.abs(target.y - source.y)
  const controlOffset = Math.max(50, dy * 0.5)

  // 根据连接点位置调整控制点方向
  const sourceControlY = sourceAnchor === 'bottom' ? source.y + controlOffset : source.y - controlOffset
  const targetControlY = targetAnchor === 'top' ? target.y - controlOffset : target.y + controlOffset

  return `M ${source.x} ${source.y} C ${source.x} ${sourceControlY}, ${target.x} ${targetControlY}, ${target.x} ${target.y}`
}

/**
 * 拓扑连线组件
 * - 贝塞尔曲线样式（高速公路风格）
 * - 箭头流动动画效果
 * - 根据关系类型显示不同颜色
 */
export const TopologyEdge: React.FC<TopologyEdgeProps> = memo(({
  edge,
  sourceNode,
  targetNode,
  selected = false,
  onClick,
  onDoubleClick,
}) => {
  const color = RelationTypeColor[edge.relationType] || '#1890ff'

  // 计算路径
  const { path, sourcePos, targetPos } = useMemo(() => {
    const sourcePos = getAnchorPosition(sourceNode, edge.sourceAnchor)
    const targetPos = getAnchorPosition(targetNode, edge.targetAnchor)
    const path = generatePath(sourcePos, targetPos, edge.sourceAnchor, edge.targetAnchor)
    return { path, sourcePos, targetPos }
  }, [sourceNode, targetNode, edge.sourceAnchor, edge.targetAnchor])

  // 计算标签位置（路径中点）
  const labelPosition = useMemo(() => {
    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
    }
  }, [sourcePos, targetPos])

  // 计算流动箭头的位置（3个箭头，均匀分布）
  const flowArrows = useMemo(() => {
    const arrows = []
    for (let i = 0; i < 3; i++) {
      arrows.push({
        id: i,
        startOffset: i * 33.33, // 0%, 33.33%, 66.66%
      })
    }
    return arrows
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(edge.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(edge.id)
  }

  // 唯一ID用于标记和动画
  const markerId = `arrow-marker-${edge.id}`
  const flowMarkerId = `flow-arrow-${edge.id}`
  const pathId = `path-${edge.id}`

  return (
    <g className={styles.edgeGroup} data-edge-id={edge.id}>
      <defs>
        {/* 终点箭头标记 */}
        <marker
          id={markerId}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 L 3 6 Z"
            fill={color}
          />
        </marker>

        {/* 流动箭头标记 */}
        <marker
          id={flowMarkerId}
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 8 4 L 0 8 L 2 4 Z"
            fill={color}
            opacity="0.9"
          />
        </marker>
      </defs>

      {/* 高速公路外边框 */}
      <path
        d={path}
        className={styles.edgeOutline}
        style={{
          stroke: color,
        }}
      />

      {/* 高速公路主路径 */}
      <path
        id={pathId}
        d={path}
        className={`${styles.edgePath} ${selected ? styles.selected : ''}`}
        style={{
          stroke: color,
        }}
        markerEnd={`url(#${markerId})`}
      />

      {/* 高速公路中线（装饰） */}
      <path
        d={path}
        className={styles.edgeCenterLine}
      />

      {/* 流动箭头动画 */}
      {flowArrows.map((arrow) => (
        <g key={arrow.id} className={styles.flowArrowGroup}>
          <circle r="0">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              begin={`${arrow.startOffset / 100 * 2}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          <g className={styles.flowArrow}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              rotate="auto"
              begin={`${arrow.startOffset / 100 * 2}s`}
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <path
              d="M -6 -4 L 6 0 L -6 4 L -3 0 Z"
              fill="#ffffff"
              stroke={color}
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        </g>
      ))}

      {/* 关系标签 */}
      {edge.label && (
        <g
          transform={`translate(${labelPosition.x}, ${labelPosition.y})`}
          style={{ pointerEvents: 'none' }}
        >
          <rect
            x={-40}
            y={-12}
            width={80}
            height={24}
            rx={12}
            className={styles.labelBackground}
            style={{ stroke: color }}
          />
          <text
            className={styles.labelText}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {edge.label}
          </text>
        </g>
      )}

      {/* 点击区域放在最上层 */}
      <path
        d={path}
        className={styles.edgeHitArea}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
    </g>
  )
})

TopologyEdge.displayName = 'TopologyEdge'

/**
 * 临时连线（拖拽时显示）
 */
export interface TempEdgeProps {
  sourcePosition: Position
  targetPosition: Position
  sourceAnchor: 'top' | 'bottom'
}

export const TempEdge: React.FC<TempEdgeProps> = memo(({
  sourcePosition,
  targetPosition,
  sourceAnchor,
}) => {
  // 估算目标锚点（简化处理）
  const targetAnchor = sourceAnchor === 'bottom' ? 'top' : 'bottom'
  const path = generatePath(sourcePosition, targetPosition, sourceAnchor, targetAnchor)

  return (
    <path
      d={path}
      className={styles.tempEdge}
    />
  )
})

TempEdge.displayName = 'TempEdge'

export default TopologyEdge
