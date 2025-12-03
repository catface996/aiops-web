/**
 * 拓扑关系服务
 * Feature: F04 - 建立资源间的拓扑关系
 */
import { get, post, put, del } from '@/utils/request'
import type {
  RelationshipDTO,
  CreateRelationshipRequest,
  UpdateRelationshipRequest,
  RelationshipListParams,
  ResourceRelationshipsDTO,
  TopologyData,
  TopologyNode,
  TopologyEdge,
} from '@/types/topology'
import type { PageResult, ResourceDTO } from '@/types'

/**
 * 查询关系列表
 */
export async function getRelationshipList(
  params: RelationshipListParams
): Promise<PageResult<RelationshipDTO>> {
  const response = await get<PageResult<RelationshipDTO>>('/relationships', params as Record<string, unknown>)
  return response.data!
}

/**
 * 查询关系详情
 */
export async function getRelationshipById(id: number): Promise<RelationshipDTO> {
  const response = await get<RelationshipDTO>(`/relationships/${id}`)
  return response.data!
}

/**
 * 创建关系
 */
export async function createRelationship(data: CreateRelationshipRequest): Promise<RelationshipDTO> {
  const response = await post<RelationshipDTO>('/relationships', data)
  return response.data!
}

/**
 * 更新关系
 */
export async function updateRelationship(
  id: number,
  data: UpdateRelationshipRequest
): Promise<RelationshipDTO> {
  const response = await put<RelationshipDTO>(`/relationships/${id}`, data)
  return response.data!
}

/**
 * 删除关系
 */
export async function deleteRelationship(id: number): Promise<void> {
  await del<void>(`/relationships/${id}`)
}

/**
 * 查询资源的所有关系（上游+下游）
 */
export async function getResourceRelationships(resourceId: number): Promise<ResourceRelationshipsDTO> {
  const response = await get<ResourceRelationshipsDTO>(`/relationships/resource/${resourceId}`)
  return response.data!
}

/**
 * 遍历资源关系
 */
export async function traverseResourceRelationships(
  resourceId: number,
  params?: { direction?: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH'; maxDepth?: number }
): Promise<RelationshipDTO[]> {
  const response = await get<RelationshipDTO[]>(
    `/relationships/resource/${resourceId}/traverse`,
    params as Record<string, unknown>
  )
  return response.data!
}

/**
 * 检测循环依赖
 */
export async function detectCyclicRelationships(resourceId: number): Promise<boolean> {
  const response = await get<boolean>(`/relationships/resource/${resourceId}/cycle-detection`)
  return response.data!
}

/**
 * 获取拓扑数据（用于画布展示）
 * 这是一个组合接口，后端可能提供，也可能需要前端组装
 */
export async function getTopologyData(): Promise<TopologyData> {
  const response = await get<TopologyData>('/topology')
  return response.data!
}

/**
 * 保存拓扑节点位置
 */
export async function saveNodePositions(
  positions: Array<{ resourceId: number; x: number; y: number }>
): Promise<void> {
  await post<void>('/topology/positions', { positions })
}

// ==================== 前端数据转换工具 ====================

/**
 * 将资源DTO转换为拓扑节点
 */
export function resourceToNode(
  resource: ResourceDTO,
  position?: { x: number; y: number }
): TopologyNode {
  return {
    id: `node-${resource.id}`,
    resourceId: resource.id,
    name: resource.name,
    type: resource.resourceTypeName,
    typeCode: resource.resourceTypeCode,
    status: resource.status,
    position: position || { x: 100, y: 100 },
  }
}

/**
 * 将关系DTO转换为拓扑边
 */
export function relationshipToEdge(relation: RelationshipDTO): TopologyEdge {
  return {
    id: `edge-${relation.id}`,
    relationId: relation.id,
    source: `node-${relation.sourceResourceId}`,
    target: `node-${relation.targetResourceId}`,
    sourceAnchor: 'bottom',
    targetAnchor: 'top',
    relationType: relation.relationshipType as TopologyEdge['relationType'],
    direction: relation.direction as TopologyEdge['direction'],
    strength: relation.strength as TopologyEdge['strength'],
    status: relation.status as TopologyEdge['status'],
    label: relation.description || undefined,
  }
}

// 兼容旧函数名
export const relationToEdge = relationshipToEdge

/**
 * 拓扑服务类
 */
export class TopologyService {
  /**
   * 查询关系列表
   */
  async listRelationships(params: RelationshipListParams): Promise<PageResult<RelationshipDTO>> {
    return getRelationshipList(params)
  }

  /**
   * 查询关系详情
   */
  async getRelationship(id: number): Promise<RelationshipDTO> {
    return getRelationshipById(id)
  }

  /**
   * 创建关系
   */
  async createRelationship(data: CreateRelationshipRequest): Promise<RelationshipDTO> {
    return createRelationship(data)
  }

  /**
   * 更新关系
   */
  async updateRelationship(id: number, data: UpdateRelationshipRequest): Promise<RelationshipDTO> {
    return updateRelationship(id, data)
  }

  /**
   * 删除关系
   */
  async deleteRelationship(id: number): Promise<void> {
    return deleteRelationship(id)
  }

  /**
   * 获取资源的所有关系
   */
  async getResourceRelationships(resourceId: number): Promise<ResourceRelationshipsDTO> {
    return getResourceRelationships(resourceId)
  }

  /**
   * 遍历资源关系
   */
  async traverseRelationships(
    resourceId: number,
    params?: { direction?: 'UPSTREAM' | 'DOWNSTREAM' | 'BOTH'; maxDepth?: number }
  ): Promise<RelationshipDTO[]> {
    return traverseResourceRelationships(resourceId, params)
  }

  /**
   * 检测循环依赖
   */
  async detectCycles(resourceId: number): Promise<boolean> {
    return detectCyclicRelationships(resourceId)
  }

  /**
   * 获取拓扑数据
   */
  async getTopologyData(): Promise<TopologyData> {
    return getTopologyData()
  }

  /**
   * 保存节点位置
   */
  async saveNodePositions(
    positions: Array<{ resourceId: number; x: number; y: number }>
  ): Promise<void> {
    return saveNodePositions(positions)
  }
}

// 导出单例
export const topologyService = new TopologyService()
