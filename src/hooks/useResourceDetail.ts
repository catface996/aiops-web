/**
 * 资源详情Hook
 * 需求: REQ-FR-026, REQ-FR-029, REQ-FR-040, REQ-FR-051, REQ-FR-057
 */
import { useState, useCallback, useEffect } from 'react'
import { message } from 'antd'
import {
  getResourceById,
  updateResource,
  updateResourceStatus,
  deleteResource,
} from '@/services/resource'
import type {
  ResourceDTO,
  ResourceStatus,
  UpdateResourceRequest,
  UseResourceDetailReturn,
} from '@/types'

/**
 * useResourceDetail Hook
 * 管理资源详情的数据和操作
 */
export function useResourceDetail(resourceId: number | null): UseResourceDetailReturn {
  // 资源数据
  const [resource, setResource] = useState<ResourceDTO | null>(null)
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 错误状态
  const [error, setError] = useState<Error | null>(null)

  /**
   * 加载资源详情
   */
  const loadResource = useCallback(async () => {
    if (!resourceId) {
      setResource(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getResourceById(resourceId)
      setResource(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('加载资源详情失败')
      setError(error)
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  /**
   * 初始加载和resourceId变化时加载数据
   */
  useEffect(() => {
    loadResource()
  }, [loadResource])

  /**
   * 刷新资源详情
   */
  const refresh = useCallback(async () => {
    await loadResource()
  }, [loadResource])

  /**
   * 更新资源
   */
  const update = useCallback(
    async (data: UpdateResourceRequest) => {
      if (!resourceId) {
        throw new Error('资源ID不存在')
      }

      try {
        await updateResource(resourceId, data)
        message.success('资源更新成功')
        await loadResource()
      } catch (err) {
        const error = err instanceof Error ? err : new Error('更新资源失败')
        // 检查是否为版本冲突
        if (error.message.includes('version') || error.message.includes('冲突')) {
          message.error('资源已被其他人修改，请刷新后重试')
        } else {
          message.error(error.message)
        }
        throw error
      }
    },
    [resourceId, loadResource]
  )

  /**
   * 更新资源状态
   */
  const handleUpdateStatus = useCallback(
    async (status: ResourceStatus) => {
      if (!resourceId || !resource) {
        throw new Error('资源不存在')
      }

      try {
        await updateResourceStatus(resourceId, {
          status,
          version: resource.version,
        })
        message.success('状态更新成功')
        await loadResource()
      } catch (err) {
        const error = err instanceof Error ? err : new Error('更新状态失败')
        message.error(error.message)
        throw error
      }
    },
    [resourceId, resource, loadResource]
  )

  /**
   * 删除资源
   */
  const handleDelete = useCallback(
    async (confirmName: string) => {
      if (!resourceId) {
        throw new Error('资源ID不存在')
      }

      try {
        await deleteResource(resourceId, { confirmName })
        message.success('资源删除成功')
      } catch (err) {
        const error = err instanceof Error ? err : new Error('删除资源失败')
        message.error(error.message)
        throw error
      }
    },
    [resourceId]
  )

  return {
    resource,
    loading,
    error,
    refresh,
    update,
    updateStatus: handleUpdateStatus,
    deleteResource: handleDelete,
  }
}

export default useResourceDetail
