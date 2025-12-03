/**
 * 拓扑关系类型定义
 * Feature: F04 - 建立资源间的拓扑关系
 */

// ==================== 关系类型定义 ====================

/**
 * 关系类型枚举（与后端一致）
 */
export const RelationType = {
  DEPENDENCY: 'DEPENDENCY', // 依赖
  CALL: 'CALL', // 调用
  DEPLOYMENT: 'DEPLOYMENT', // 部署
  OWNERSHIP: 'OWNERSHIP', // 归属
  ASSOCIATION: 'ASSOCIATION', // 关联
} as const

export type RelationType = (typeof RelationType)[keyof typeof RelationType]

/**
 * 关系类型显示映射
 */
export const RelationTypeDisplay: Record<RelationType, string> = {
  DEPENDENCY: '依赖',
  CALL: '调用',
  DEPLOYMENT: '部署',
  OWNERSHIP: '归属',
  ASSOCIATION: '关联',
}

/**
 * 关系类型颜色映射
 */
export const RelationTypeColor: Record<RelationType, string> = {
  DEPENDENCY: '#1890ff', // 蓝色
  CALL: '#52c41a', // 绿色
  DEPLOYMENT: '#722ed1', // 紫色
  OWNERSHIP: '#fa8c16', // 橙色
  ASSOCIATION: '#eb2f96', // 粉色
}

/**
 * 关系方向
 */
export const RelationDirection = {
  UNIDIRECTIONAL: 'UNIDIRECTIONAL', // 单向
  BIDIRECTIONAL: 'BIDIRECTIONAL', // 双向
} as const

export type RelationDirection = (typeof RelationDirection)[keyof typeof RelationDirection]

/**
 * 关系方向显示映射
 */
export const RelationDirectionDisplay: Record<RelationDirection, string> = {
  UNIDIRECTIONAL: '单向',
  BIDIRECTIONAL: '双向',
}

/**
 * 关系强度
 */
export const RelationStrength = {
  STRONG: 'STRONG', // 强依赖
  WEAK: 'WEAK', // 弱依赖
} as const

export type RelationStrength = (typeof RelationStrength)[keyof typeof RelationStrength]

/**
 * 关系强度显示映射
 */
export const RelationStrengthDisplay: Record<RelationStrength, string> = {
  STRONG: '强依赖',
  WEAK: '弱依赖',
}

/**
 * 关系状态
 */
export const RelationStatus = {
  NORMAL: 'NORMAL', // 正常
  ABNORMAL: 'ABNORMAL', // 异常
} as const

export type RelationStatus = (typeof RelationStatus)[keyof typeof RelationStatus]

/**
 * 关系状态显示映射
 */
export const RelationStatusDisplay: Record<RelationStatus, string> = {
  NORMAL: '正常',
  ABNORMAL: '异常',
}

// ==================== 关系DTO定义（与后端API完全一致）====================

/**
 * 关系DTO（与后端 RelationshipDTO 一致）
 */
export interface RelationshipDTO {
  id: number
  sourceResourceId: number
  sourceResourceName: string
  targetResourceId: number
  targetResourceName: string
  relationshipType: string
  relationshipTypeDesc: string
  direction: string
  directionDesc: string
  strength: string
  strengthDesc: string
  status: string
  statusDesc: string
  description: string | null
  createdAt: string
  updatedAt: string
}

/**
 * 创建关系请求（与后端 CreateRelationshipRequest 一致）
 */
export interface CreateRelationshipRequest {
  sourceResourceId: number
  targetResourceId: number
  relationshipType: string
  direction: string
  strength: string
  description?: string
}

/**
 * 更新关系请求（与后端 UpdateRelationshipRequest 一致）
 */
export interface UpdateRelationshipRequest {
  relationshipType?: string
  strength?: string
  status?: string
  description?: string
}

/**
 * 关系查询参数
 */
export interface RelationshipListParams {
  sourceResourceId?: number
  targetResourceId?: number
  relationshipType?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 资源关系响应（上游+下游）
 */
export interface ResourceRelationshipsDTO {
  resourceId: number
  resourceName: string
  upstreamRelationships: RelationshipDTO[]
  downstreamRelationships: RelationshipDTO[]
}

// 兼容旧类型名（别名）
export type RelationDTO = RelationshipDTO
export type CreateRelationRequest = CreateRelationshipRequest
export type UpdateRelationRequest = UpdateRelationshipRequest
export type RelationListParams = RelationshipListParams

// ==================== 拓扑画布类型定义 ====================

/**
 * 拓扑节点位置
 */
export interface Position {
  x: number
  y: number
}

/**
 * 拓扑节点（画布中的资源）
 */
export interface TopologyNode {
  id: string
  resourceId: number
  name: string
  type: string
  typeCode: string
  status: string
  position: Position
  width?: number
  height?: number
}

/**
 * 拓扑边（节点间的连线）
 */
export interface TopologyEdge {
  id: string
  relationId: number
  source: string // 源节点 id
  target: string // 目标节点 id
  sourceAnchor: 'top' | 'bottom' // 连接点位置
  targetAnchor: 'top' | 'bottom'
  relationType: RelationType
  direction: RelationDirection
  strength: RelationStrength
  status: RelationStatus
  label?: string
}

/**
 * 拓扑数据
 */
export interface TopologyData {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
}

/**
 * 节点连接点信息
 */
export interface ConnectionPoint {
  nodeId: string
  anchor: 'top' | 'bottom'
  position: Position
}

/**
 * 拖拽状态
 */
export interface DragState {
  isDragging: boolean
  nodeId: string | null
  startPosition: Position | null
  offset: Position
}

/**
 * 连线状态
 */
export interface ConnectingState {
  isConnecting: boolean
  sourcePoint: ConnectionPoint | null
  currentPosition: Position | null
}

/**
 * 画布视口状态
 */
export interface ViewportState {
  zoom: number
  offset: Position
}

/**
 * 节点尺寸常量
 */
export const NODE_CONSTANTS = {
  WIDTH: 160,
  HEIGHT: 60,
  BORDER_RADIUS: 8,
  ANCHOR_RADIUS: 6,
  ANCHOR_OFFSET: 0, // 连接点在边框上
} as const

/**
 * 动画常量
 */
export const ANIMATION_CONSTANTS = {
  FLOW_DURATION: 1500, // 流动动画时长(ms)
  DASH_ARRAY: [10, 5], // 虚线样式
  FLOW_SPEED: 30, // 流动速度
} as const
