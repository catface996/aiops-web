/**
 * 拓扑关系服务
 * Feature: F04 - 建立资源间的拓扑关系
 */
import { get, post, put, del } from '@/utils/request'
import type {
  RelationDTO,
  CreateRelationRequest,
  UpdateRelationRequest,
  RelationListParams,
  TopologyData,
  TopologyNode,
  TopologyEdge,
} from '@/types/topology'
import type { PageResult, ResourceDTO } from '@/types'

/**
 * 查询关系列表
 */
export async function getRelationList(
  params: RelationListParams
): Promise<PageResult<RelationDTO>> {
  const response = await get<PageResult<RelationDTO>>('/relations', params as Record<string, unknown>)
  return response.data!
}

/**
 * 查询关系详情
 */
export async function getRelationById(id: number): Promise<RelationDTO> {
  const response = await get<RelationDTO>(`/relations/${id}`)
  return response.data!
}

/**
 * 创建关系
 */
export async function createRelation(data: CreateRelationRequest): Promise<RelationDTO> {
  const response = await post<RelationDTO>('/relations', data)
  return response.data!
}

/**
 * 更新关系
 */
export async function updateRelation(
  id: number,
  data: UpdateRelationRequest
): Promise<RelationDTO> {
  const response = await put<RelationDTO>(`/relations/${id}`, data)
  return response.data!
}

/**
 * 删除关系
 */
export async function deleteRelation(id: number): Promise<void> {
  await del<void>(`/relations/${id}`)
}

/**
 * 查询资源的所有关系（上游+下游）
 */
export async function getResourceRelations(resourceId: number): Promise<RelationDTO[]> {
  const response = await get<RelationDTO[]>(`/resources/${resourceId}/relations`)
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
export function relationToEdge(relation: RelationDTO): TopologyEdge {
  return {
    id: `edge-${relation.id}`,
    relationId: relation.id,
    source: `node-${relation.sourceId}`,
    target: `node-${relation.targetId}`,
    sourceAnchor: 'bottom',
    targetAnchor: 'top',
    relationType: relation.relationType,
    direction: relation.direction,
    strength: relation.strength,
    status: relation.status,
    label: relation.description || undefined,
  }
}

/**
 * 拓扑服务类
 */
export class TopologyService {
  /**
   * 查询关系列表
   */
  async listRelations(params: RelationListParams): Promise<PageResult<RelationDTO>> {
    return getRelationList(params)
  }

  /**
   * 查询关系详情
   */
  async getRelation(id: number): Promise<RelationDTO> {
    return getRelationById(id)
  }

  /**
   * 创建关系
   */
  async createRelation(data: CreateRelationRequest): Promise<RelationDTO> {
    return createRelation(data)
  }

  /**
   * 更新关系
   */
  async updateRelation(id: number, data: UpdateRelationRequest): Promise<RelationDTO> {
    return updateRelation(id, data)
  }

  /**
   * 删除关系
   */
  async deleteRelation(id: number): Promise<void> {
    return deleteRelation(id)
  }

  /**
   * 获取资源的所有关系
   */
  async getResourceRelations(resourceId: number): Promise<RelationDTO[]> {
    return getResourceRelations(resourceId)
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
