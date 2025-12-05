/**
 * SubgraphFilterBar Component
 *
 * 子图筛选栏组件，将标签和所有者筛选改为下拉复选框形式
 * 遵循列表页设计规范
 */
import React, { useState, useEffect, memo } from 'react'
import { Select, Space, Button, Input, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import SubgraphService from '@/services/subgraph'
import type { SubgraphUserInfo } from '@/types/subgraph'
import listStyles from '@/styles/list-page.module.css'

const { Search } = Input

export interface SubgraphFilterBarProps {
  /** 搜索关键词 */
  keyword: string
  /** 已选标签 */
  selectedTags: string[]
  /** 已选所有者ID */
  selectedOwnerId: number | null
  /** 搜索回调 */
  onSearch: (keyword: string) => void
  /** 筛选变更回调 */
  onFilterChange: (filters: {
    tags?: string[]
    ownerId?: number | null
  }) => void
  /** 刷新回调 */
  onRefresh?: () => void
  /** 是否正在加载 */
  loading?: boolean
}

/**
 * SubgraphFilterBar 组件
 * 顶部筛选栏，包含标签、所有者下拉复选框和搜索框
 */
const SubgraphFilterBar: React.FC<SubgraphFilterBarProps> = memo(({
  keyword,
  selectedTags,
  selectedOwnerId,
  onSearch,
  onFilterChange,
  onRefresh,
  loading = false,
}) => {
  // 可用标签列表
  const [availableTags, setAvailableTags] = useState<string[]>([])
  // 可用所有者列表
  const [availableOwners, setAvailableOwners] = useState<SubgraphUserInfo[]>([])
  // 加载状态
  const [optionsLoading, setOptionsLoading] = useState(false)

  // 加载筛选选项
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setOptionsLoading(true)
      try {
        const response = await SubgraphService.listSubgraphs({
          page: 1,
          pageSize: 1000,
        })

        const items = response.items || []

        // 提取唯一标签
        const tagsSet = new Set<string>()
        items.forEach((subgraph) => {
          subgraph.tags?.forEach((tag) => tagsSet.add(tag))
        })
        setAvailableTags(Array.from(tagsSet).sort())

        // 提取唯一所有者
        const ownersMap = new Map<number, SubgraphUserInfo>()
        items.forEach((subgraph) => {
          if (subgraph.createdBy && !ownersMap.has(subgraph.createdBy)) {
            ownersMap.set(subgraph.createdBy, {
              userId: subgraph.createdBy,
              username: `User ${subgraph.createdBy}`,
              email: `user${subgraph.createdBy}@example.com`,
            })
          }
        })
        setAvailableOwners(Array.from(ownersMap.values()))
      } catch (error) {
        console.error('Error fetching filter options:', error)
      } finally {
        setOptionsLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // 处理标签筛选变化
  const handleTagsChange = (values: string[]) => {
    onFilterChange({ tags: values })
  }

  // 处理所有者筛选变化
  const handleOwnerChange = (value: number | undefined) => {
    onFilterChange({ ownerId: value ?? null })
  }

  // 重置所有筛选条件
  const handleReset = () => {
    onFilterChange({
      tags: [],
      ownerId: null,
    })
    onSearch('')
  }

  // 判断是否有活跃的筛选条件
  const hasActiveFilters = keyword || selectedTags.length > 0 || selectedOwnerId !== null

  // 标签选项
  const tagOptions = availableTags.map((tag) => ({
    label: (
      <Tag color="blue" style={{ marginRight: 0 }}>
        {tag}
      </Tag>
    ),
    value: tag,
  }))

  // 所有者选项
  const ownerOptions = availableOwners.map((owner) => ({
    label: owner.username,
    value: owner.userId,
  }))

  return (
    <div data-testid="subgraph-filter-bar" className={listStyles.filterControls}>
      {/* 标签筛选 */}
      <Select
        mode="multiple"
        allowClear
        placeholder="标签筛选"
        className={listStyles.selectWide}
        loading={optionsLoading}
        value={selectedTags}
        onChange={handleTagsChange}
        options={tagOptions}
        maxTagCount="responsive"
      />

      {/* 所有者筛选 */}
      <Select
        allowClear
        placeholder="所有者"
        className={listStyles.selectStandard}
        loading={optionsLoading}
        value={selectedOwnerId ?? undefined}
        onChange={handleOwnerChange}
        options={ownerOptions}
      />

      {/* 搜索框 */}
      <Search
        placeholder="搜索子图名称或描述"
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
})

SubgraphFilterBar.displayName = 'SubgraphFilterBar'

export default SubgraphFilterBar
