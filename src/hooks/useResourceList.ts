/**
 * 资源列表Hook
 * 需求: REQ-FR-013, REQ-FR-014, REQ-FR-015, REQ-FR-016
 */
import { useState, useCallback, useEffect } from 'react'
import { message } from 'antd'
import { getResourceList } from '@/services/resource'
import type {
  ResourceDTO,
  ResourceListParams,
  UseResourceListReturn,
} from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/utils/resourceConstants'

/**
 * useResourceList Hook
 * 管理资源列表的数据和操作
 */
export function useResourceList(): UseResourceListReturn {
  // 资源数据
  const [resources, setResources] = useState<ResourceDTO[]>([])
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 错误状态
  const [error, setError] = useState<Error | null>(null)
  // 过滤参数
  const [filters, setFiltersState] = useState<ResourceListParams>({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
  })
  // 分页信息
  const [pagination, setPaginationState] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  })

  /**
   * 加载资源列表
   */
  const loadResources = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getResourceList(filters)
      setResources(result.content)
      setPaginationState({
        current: result.page,
        pageSize: result.size,
        total: result.totalElements,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('加载资源列表失败')
      setError(error)
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * 初始加载和过滤条件变化时加载数据
   */
  useEffect(() => {
    loadResources()
  }, [loadResources])

  /**
   * 刷新列表
   */
  const refresh = useCallback(async () => {
    await loadResources()
  }, [loadResources])

  /**
   * 更新过滤条件
   */
  const setFilters = useCallback((newFilters: Partial<ResourceListParams>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // 更新过滤条件时重置页码
      page: newFilters.page ?? 1,
    }))
  }, [])

  /**
   * 更新分页
   */
  const setPagination = useCallback(
    (newPagination: { current?: number; pageSize?: number }) => {
      setPaginationState((prev) => ({
        ...prev,
        ...newPagination,
      }))
      setFiltersState((prev) => ({
        ...prev,
        page: newPagination.current ?? prev.page,
        size: newPagination.pageSize ?? prev.size,
      }))
    },
    []
  )

  return {
    resources,
    loading,
    error,
    pagination,
    filters,
    refresh,
    setFilters,
    setPagination,
  }
}

export default useResourceList
