/**
 * 资源列表页面
 * 需求: REQ-FR-001, REQ-FR-013, REQ-FR-014, REQ-FR-015, REQ-FR-016, REQ-FR-025
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Button, Space, message, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useResourceList } from '@/hooks/useResourceList'
import { useResourceForm } from '@/hooks/useResourceForm'
import { createResource, updateResourceStatus, deleteResource } from '@/services/resource'
import { PageContainer } from '@/components'
import { ResourceFilterBar } from './components/ResourceFilterBar'
import { ResourceTable } from './components/ResourceTable'
import { ResourceTypeSelector } from './components/ResourceTypeSelector'
import { ResourceForm } from './components/ResourceForm'
import type { ResourceDTO, ResourceType, ResourceStatus, ResourceFormData } from '@/types'
import { isResourceOwner, isAdmin } from '@/components/PermissionGuard'
import { stringifyResourceAttributes } from '@/utils/resourceFormat'
import { debounce, SEARCH_DEBOUNCE_DELAY } from '@/utils/debounce'
import listStyles from '@/styles/list-page.module.css'

/**
 * ResourceListPage 组件
 * 资源列表页面
 */
const ResourceListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 资源列表数据
  const {
    resources,
    loading,
    pagination,
    filters,
    refresh,
    setFilters,
    setPagination,
  } = useResourceList()

  // 表单Hook
  const { submitting } = useResourceForm()

  // 类型选择器状态
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false)
  // 选中的资源类型
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)
  // 表单对话框状态
  const [formOpen, setFormOpen] = useState(false)
  // 搜索关键词
  const [keyword, setKeyword] = useState('')
  // 选中的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  // 创建防抖搜索引用
  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      setFilters({ keyword: value || undefined })
    }, SEARCH_DEBOUNCE_DELAY)
  )

  // 清理防抖函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理
    }
  }, [])

  // 搜索处理
  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value)
      debouncedSearchRef.current(value)
    },
    []
  )

  // 分页变更
  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize })
    },
    [setPagination]
  )

  // 打开类型选择器
  const handleOpenTypeSelector = () => {
    setTypeSelectorOpen(true)
  }

  // 选择资源类型
  const handleSelectType = (type: ResourceType) => {
    setSelectedType(type)
    setTypeSelectorOpen(false)
    setFormOpen(true)
  }

  // 提交创建表单
  const handleSubmitCreate = async (data: ResourceFormData) => {
    try {
      await createResource({
        name: data.name,
        description: data.description || undefined,
        resourceTypeId: data.resourceTypeId,
        attributes: stringifyResourceAttributes(data.attributes),
      })
      message.success('资源创建成功')
      setFormOpen(false)
      setSelectedType(null)
      refresh()
    } catch (error) {
      // 错误已在服务层处理
    }
  }

  // 状态变更
  const handleStatusChange = async (resource: ResourceDTO, status: ResourceStatus) => {
    try {
      await updateResourceStatus(resource.id, { status, version: resource.version })
      message.success('状态更新成功')
      refresh()
    } catch (error) {
      // 错误已在服务层处理
    }
  }

  // 编辑资源
  const handleEdit = (resource: ResourceDTO) => {
    navigate(`/resources/${resource.id}?tab=overview&edit=true`)
  }

  // 删除资源
  const handleDelete = (resource: ResourceDTO) => {
    Modal.confirm({
      title: '确认删除',
      content: (
        <div>
          <p>确定要删除资源 <strong>{resource.name}</strong> 吗？</p>
          <p style={{ color: '#ff4d4f' }}>此操作不可恢复。</p>
        </div>
      ),
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteResource(resource.id, { confirmName: resource.name })
          message.success('资源删除成功')
          refresh()
        } catch (error) {
          // 错误已在服务层处理
        }
      },
    })
  }

  // 批量删除
  const handleBatchDelete = () => {
    const selectedResources = resources.filter((r) => selectedRowKeys.includes(r.id))
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedResources.length} 个资源吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          for (const resource of selectedResources) {
            await deleteResource(resource.id, { confirmName: resource.name })
          }
          message.success(`成功删除 ${selectedResources.length} 个资源`)
          setSelectedRowKeys([])
          refresh()
        } catch (error) {
          // 部分可能已删除，刷新列表
          refresh()
        }
      },
    })
  }

  // 权限检查函数
  const canEdit = useCallback(
    (resource: ResourceDTO) => {
      if (!user) return false
      return isResourceOwner(resource, user.userId) || isAdmin(user.role)
    },
    [user]
  )

  const canDelete = useCallback(
    (resource: ResourceDTO) => {
      if (!user) return false
      return isResourceOwner(resource, user.userId) || isAdmin(user.role)
    },
    [user]
  )

  // 是否可以批量删除
  const canBatchDelete = useMemo(() => {
    if (selectedRowKeys.length === 0) return false
    const selectedResources = resources.filter((r) => selectedRowKeys.includes(r.id))
    return selectedResources.every((r) => canDelete(r))
  }, [selectedRowKeys, resources, canDelete])

  return (
    <div data-testid="resource-list-page">
      <PageContainer>
        {/* 筛选栏和操作按钮 */}
        <div className={listStyles.filterBar}>
          <ResourceFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            keyword={keyword}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenTypeSelector}
            className={listStyles.primaryButton}
          >
            创建资源
          </Button>
        </div>

        {/* 批量操作栏 */}
        {selectedRowKeys.length > 0 && (
          <div className={listStyles.batchActionBar}>
            <Space>
              <span className={listStyles.batchActionText}>
                已选择 {selectedRowKeys.length} 项
              </span>
              {canBatchDelete && (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  className={listStyles.smallButton}
                >
                  批量删除
                </Button>
              )}
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
                className={listStyles.smallButton}
              >
                取消选择
              </Button>
            </Space>
          </div>
        )}

        {/* 资源表格 */}
        <ResourceTable
          resources={resources}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          keyword={keyword}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          canEdit={canEdit}
          canDelete={canDelete}
          onCreate={handleOpenTypeSelector}
        />
      </PageContainer>

      {/* 类型选择器 */}
      <ResourceTypeSelector
        open={typeSelectorOpen}
        onClose={() => setTypeSelectorOpen(false)}
        onSelect={handleSelectType}
      />

      {/* 创建表单 */}
      <ResourceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedType(null)
        }}
        onSubmit={handleSubmitCreate}
        resourceType={selectedType}
        submitting={submitting}
      />
    </div>
  )
}

export default ResourceListPage
