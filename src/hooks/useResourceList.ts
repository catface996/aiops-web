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
    setFiltersState((prev) => {
      // 如果明确传入了 page，使用传入的值；否则检查是否有其他过滤条件变化
      const hasFilterChange = Object.keys(newFilters).some(
        (key) => key !== 'page' && key !== 'size'
      )
      return {
        ...prev,
        ...newFilters,
        // 只有当过滤条件变化且没有明确传入 page 时才重置页码
        page: newFilters.page !== undefined ? newFilters.page : (hasFilterChange ? 1 : prev.page),
      }
    })
  }, [])

  /**
   * 更新分页
   */
  const setPagination = useCallback(
    (newPagination: { current?: number; pageSize?: number }) => {
      // 只更新 filtersState，paginationState 会在 loadResources 成功后根据后端返回更新
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
