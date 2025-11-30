/**
 * 资源过滤器组件
 * 需求: REQ-FR-018, REQ-FR-019, REQ-FR-020
 */
import React, { useEffect, useState } from 'react'
import { Card, Radio, Checkbox, Space, Typography, Spin } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { getResourceTypes } from '@/services/resource'
import { ResourceTypeIcon } from '@/components/ResourceTypeIcon'
import { ResourceStatus, ResourceStatusDisplay, type ResourceType, type ResourceListParams } from '@/types'
import { FILTER_PANEL_WIDTH } from '@/utils/resourceConstants'

const { Title } = Typography

export interface ResourceFiltersProps {
  /** 当前过滤条件 */
  filters: ResourceListParams
  /** 过滤条件变更回调 */
  onFilterChange: (filters: Partial<ResourceListParams>) => void
}

/**
 * ResourceFilters 组件
 * 左侧过滤器面板
 */
export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  onFilterChange,
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
  const handleTypeChange = (e: RadioChangeEvent) => {
    const value = e.target.value
    onFilterChange({
      resourceTypeId: value === 'all' ? undefined : value,
    })
  }

  // 处理状态过滤变化
  const handleStatusChange = (checkedValues: (string | number | boolean)[]) => {
    // 如果选中多个状态，只取第一个（需求是单选）
    const status = checkedValues.length > 0 ? (checkedValues[0] as ResourceStatus) : undefined
    onFilterChange({ status })
  }

  return (
    <div
      data-testid="resource-filters"
      style={{
        width: FILTER_PANEL_WIDTH,
        flexShrink: 0,
      }}
    >
      {/* 资源类型过滤器 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
          资源类型
        </Title>
        {loading ? (
          <Spin size="small" />
        ) : (
          <Radio.Group
            value={filters.resourceTypeId ?? 'all'}
            onChange={handleTypeChange}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Radio value="all">全部</Radio>
            {resourceTypes.map((type) => (
              <Radio key={type.id} value={type.id}>
                <Space size={4}>
                  <ResourceTypeIcon type={type.code} size={14} />
                  <span>{type.name}</span>
                </Space>
              </Radio>
            ))}
          </Radio.Group>
        )}
      </Card>

      {/* 状态过滤器 */}
      <Card size="small">
        <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
          资源状态
        </Title>
        <Checkbox.Group
          value={filters.status ? [filters.status] : []}
          onChange={handleStatusChange}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {Object.entries(ResourceStatus).map(([_key, value]) => (
            <Checkbox key={value} value={value}>
              {ResourceStatusDisplay[value]}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Card>
    </div>
  )
}

export default ResourceFilters
