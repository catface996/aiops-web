/**
 * 资源管理服务
 * 需求: REQ-FR-009, REQ-FR-014, REQ-FR-029, REQ-FR-040, REQ-FR-051, REQ-FR-057
 */
import { get, post, put, del } from '@/utils/request'
import request from '@/utils/request'
import type {
  ResourceDTO,
  ResourceType,
  ResourceAuditLogDTO,
  CreateResourceRequest,
  UpdateResourceRequest,
  UpdateResourceStatusRequest,
  DeleteResourceRequest,
  ResourceListParams,
  PageResult,
} from '@/types'

/**
 * 查询资源列表
 * 需求: REQ-FR-014 - 资源表格展示
 */
export async function getResourceList(
  params: ResourceListParams
): Promise<PageResult<ResourceDTO>> {
  const response = await get<PageResult<ResourceDTO>>('/resources', params as Record<string, unknown>)
  return response.data!
}

/**
 * 查询资源详情
 * 需求: REQ-FR-029 - 概览Tab内容
 */
export async function getResourceById(id: number): Promise<ResourceDTO> {
  const response = await get<ResourceDTO>(`/resources/${id}`)
  return response.data!
}

/**
 * 创建资源
 * 需求: REQ-FR-009 - 创建提交处理
 */
export async function createResource(data: CreateResourceRequest): Promise<ResourceDTO> {
  const response = await post<ResourceDTO>('/resources', data)
  return response.data!
}

/**
 * 更新资源
 * 需求: REQ-FR-040 - 编辑保存处理
 */
export async function updateResource(
  id: number,
  data: UpdateResourceRequest
): Promise<ResourceDTO> {
  const response = await put<ResourceDTO>(`/resources/${id}`, data)
  return response.data!
}

/**
 * 更新资源状态
 * 需求: REQ-FR-057 - 状态切换提交
 */
export async function updateResourceStatus(
  id: number,
  data: UpdateResourceStatusRequest
): Promise<ResourceDTO> {
  const response = await request.patch<{ code: number; data: ResourceDTO; message: string }>(
    `/resources/${id}/status`,
    data
  )
  return response.data.data
}

/**
 * 删除资源
 * 需求: REQ-FR-051 - 删除执行
 */
export async function deleteResource(
  id: number,
  data: DeleteResourceRequest
): Promise<void> {
  await del<void>(`/resources/${id}?confirmName=${encodeURIComponent(data.confirmName)}`)
}

/**
 * 查询资源类型列表
 * 需求: REQ-FR-003 - 资源类型卡片展示
 */
export async function getResourceTypes(): Promise<ResourceType[]> {
  const response = await get<ResourceType[]>('/resource-types')
  return response.data!
}

/**
 * 查询资源审计日志
 * 需求: REQ-FR-034 - 操作历史展示
 */
export async function getResourceAuditLogs(
  resourceId: number,
  params?: { page?: number; size?: number }
): Promise<PageResult<ResourceAuditLogDTO>> {
  const response = await get<PageResult<ResourceAuditLogDTO>>(
    `/resources/${resourceId}/audit-logs`,
    params as Record<string, unknown>
  )
  return response.data!
}

/**
 * 资源服务类（可选，提供面向对象的API）
 */
export class ResourceService {
  /**
   * 查询资源列表
   */
  async list(params: ResourceListParams): Promise<PageResult<ResourceDTO>> {
    return getResourceList(params)
  }

  /**
   * 查询资源详情
   */
  async getById(id: number): Promise<ResourceDTO> {
    return getResourceById(id)
  }

  /**
   * 创建资源
   */
  async create(data: CreateResourceRequest): Promise<ResourceDTO> {
    return createResource(data)
  }

  /**
   * 更新资源
   */
  async update(id: number, data: UpdateResourceRequest): Promise<ResourceDTO> {
    return updateResource(id, data)
  }

  /**
   * 更新资源状态
   */
  async updateStatus(id: number, data: UpdateResourceStatusRequest): Promise<ResourceDTO> {
    return updateResourceStatus(id, data)
  }

  /**
   * 删除资源
   */
  async delete(id: number, data: DeleteResourceRequest): Promise<void> {
    return deleteResource(id, data)
  }

  /**
   * 查询资源类型列表
   */
  async getTypes(): Promise<ResourceType[]> {
    return getResourceTypes()
  }

  /**
   * 查询审计日志
   */
  async getAuditLogs(
    resourceId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResult<ResourceAuditLogDTO>> {
    return getResourceAuditLogs(resourceId, params)
  }
}

// 导出单例
export const resourceService = new ResourceService()
