/**
 * 资源筛选栏组件
 * 将资源类型和状态筛选改为下拉复选框形式
 */
import React, { useEffect, useState } from 'react'
import { Select, Space, Button, Input } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getResourceTypes } from '@/services/resource'
import { ResourceTypeIcon } from '@/components/ResourceTypeIcon'
import { ResourceStatus, ResourceStatusDisplay, ResourceStatusColor, type ResourceType, type ResourceListParams } from '@/types'
import listStyles from '@/styles/list-page.module.css'

const { Search } = Input

export interface ResourceFilterBarProps {
  /** 当前过滤条件 */
  filters: ResourceListParams
  /** 过滤条件变更回调 */
  onFilterChange: (filters: Partial<ResourceListParams>) => void
  /** 搜索回调 */
  onSearch: (keyword: string) => void
  /** 搜索关键词 */
  keyword: string
}

/**
 * 状态颜色映射到CSS颜色
 */
const statusColorMap: Record<string, string> = {
  success: '#52c41a',
  default: '#d9d9d9',
  warning: '#faad14',
  error: '#ff4d4f',
}

/**
 * ResourceFilterBar 组件
 * 顶部筛选栏，包含资源类型、状态下拉复选框和搜索框
 */
export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  keyword,
}) => {
  // 资源类型列表
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
  const [loading, setLoading] = useState(false)

  // 加载资源类型
  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true)
      try {
        const types = await getResourceTypes()
        setResourceTypes(types)
      } catch (error) {
        console.error('Failed to load resource types:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTypes()
  }, [])

  // 处理类型过滤变化
  const handleTypeChange = (values: number[]) => {
    onFilterChange({
      resourceTypeIds: values.length > 0 ? values : undefined,
      resourceTypeId: undefined, // 清除单选的值
    })
  }

  // 处理状态过滤变化
  const handleStatusChange = (values: ResourceStatus[]) => {
    onFilterChange({
      statuses: values.length > 0 ? values : undefined,
      status: undefined, // 清除单选的值
    })
  }

  // 重置所有筛选条件
  const handleReset = () => {
    onFilterChange({
      resourceTypeId: undefined,
      resourceTypeIds: undefined,
      status: undefined,
      statuses: undefined,
      keyword: undefined,
    })
    onSearch('')
  }

  // 判断是否有活跃的筛选条件
  const hasActiveFilters =
    (filters.resourceTypeIds && filters.resourceTypeIds.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    filters.resourceTypeId ||
    filters.status ||
    keyword

  // 资源类型选项
  const typeOptions = resourceTypes.map((type) => ({
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ResourceTypeIcon type={type.code} size={16} />
        <span>{type.name}</span>
      </span>
    ),
    value: type.id,
  }))

  // 状态选项
  const statusOptions = Object.entries(ResourceStatus).map(([_key, value]) => ({
    label: (
      <Space size={4}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColorMap[ResourceStatusColor[value]] || '#d9d9d9',
            display: 'inline-block',
          }}
        />
        <span>{ResourceStatusDisplay[value]}</span>
      </Space>
    ),
    value: value,
  }))

  return (
    <div data-testid="resource-filter-bar" className={listStyles.filterControls}>
      {/* 资源类型筛选 */}
      <Select
        mode="multiple"
        allowClear
        placeholder="资源类型"
        className={listStyles.selectWide}
        loading={loading}
        value={filters.resourceTypeIds || []}
        onChange={handleTypeChange}
        options={typeOptions}
        maxTagCount="responsive"
      />

      {/* 资源状态筛选 */}
      <Select
        mode="multiple"
        allowClear
        placeholder="资源状态"
        className={listStyles.selectStandard}
        value={filters.statuses || []}
        onChange={handleStatusChange}
        options={statusOptions}
        maxTagCount="responsive"
      />

      {/* 搜索框 */}
      <Search
        placeholder="搜索资源名称"
        allowClear
        value={keyword}
        onChange={(e) => onSearch(e.target.value)}
        onSearch={onSearch}
        className={listStyles.searchInput}
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      />

      {/* 重置按钮 */}
      {hasActiveFilters && (
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
        >
          重置
        </Button>
      )}
    </div>
  )
}

export default ResourceFilterBar
