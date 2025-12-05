/**
 * 资源表格组件
 * 需求: REQ-FR-014, REQ-FR-021, REQ-FR-024
 */
import React from 'react'
import { Table, Space, Button, Tooltip, Typography, Empty } from 'antd'
import type { TableProps, ColumnType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { EditOutlined, DeleteOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons'
import { ResourceTypeIcon } from '@/components/ResourceTypeIcon'
import { StatusBadge } from '@/components/StatusBadge'
import type { ResourceDTO, ResourceStatus } from '@/types'
import { formatDateTime, highlightKeyword } from '@/utils/resourceFormat'
import { TABLE_COLUMN_WIDTHS, PAGE_SIZE_OPTIONS } from '@/utils/resourceConstants'

const { Text } = Typography

export interface ResourceTableProps {
  /** 资源数据 */
  resources: ResourceDTO[]
  /** 加载状态 */
  loading: boolean
  /** 分页配置 */
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  /** 分页变更回调 */
  onPaginationChange: (page: number, pageSize: number) => void
  /** 搜索关键词（用于高亮） */
  keyword?: string
  /** 选中的行keys */
  selectedRowKeys?: number[]
  /** 行选择变更回调 */
  onSelectionChange?: (keys: number[]) => void
  /** 编辑资源回调 */
  onEdit?: (resource: ResourceDTO) => void
  /** 删除资源回调 */
  onDelete?: (resource: ResourceDTO) => void
  /** 状态变更回调 */
  onStatusChange?: (resource: ResourceDTO, status: ResourceStatus) => void
  /** 是否可以编辑 */
  canEdit?: (resource: ResourceDTO) => boolean
  /** 是否可以删除 */
  canDelete?: (resource: ResourceDTO) => boolean
  /** 创建资源回调（用于空状态） */
  onCreate?: () => void
}

/**
 * ResourceTable 组件
 * 资源列表表格
 */
export const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  loading,
  pagination,
  onPaginationChange,
  keyword,
  selectedRowKeys = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit = () => true,
  canDelete = () => true,
  onCreate,
}) => {
  // 表格列定义
  const columns: ColumnType<ResourceDTO>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: TABLE_COLUMN_WIDTHS.name,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: ResourceDTO) => (
        <Link to={`/resources/${record.id}`}>
          {keyword ? (
            <span dangerouslySetInnerHTML={{ __html: highlightKeyword(name, keyword) }} />
          ) : (
            name
          )}
        </Link>
      ),
    },
    {
      title: '类型',
      dataIndex: 'resourceTypeCode',
      key: 'resourceTypeCode',
      width: TABLE_COLUMN_WIDTHS.type,
      render: (code: string, record: ResourceDTO) => (
        <Space size={4}>
          <ResourceTypeIcon type={code} size={14} />
          <span>{record.resourceTypeName}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: TABLE_COLUMN_WIDTHS.status,
      render: (status: ResourceStatus, record: ResourceDTO) => (
        <StatusBadge
          status={status}
          showDropdown={canEdit(record) && !!onStatusChange}
          onStatusChange={(newStatus) => onStatusChange?.(record, newStatus)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: TABLE_COLUMN_WIDTHS.createdAt,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => <Text type="secondary">{formatDateTime(date)}</Text>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: TABLE_COLUMN_WIDTHS.updatedAt,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (date: string) => <Text type="secondary">{formatDateTime(date)}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: TABLE_COLUMN_WIDTHS.actions,
      render: (_: unknown, record: ResourceDTO) => (
        <Space size={0}>
          {canEdit(record) && onEdit && (
            <Tooltip title="编辑">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}
          {canDelete(record) && onDelete && (
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // 行选择配置
  const rowSelection: TableProps<ResourceDTO>['rowSelection'] = onSelectionChange
    ? {
        selectedRowKeys,
        onChange: (keys) => onSelectionChange(keys as number[]),
      }
    : undefined

  return (
    <Table<ResourceDTO>
      data-testid="resource-table"
      rowKey="id"
      columns={columns}
      dataSource={resources}
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
        onChange: onPaginationChange,
      }}
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText: (
          <Empty
            image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
            description={
              <div style={{ color: '#8c8c8c' }}>
                {keyword ? '没有找到匹配的资源' : '暂无资源数据'}
              </div>
            }
          >
            {!keyword && onCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                创建资源
              </Button>
            )}
          </Empty>
        ),
      }}
    />
  )
}

export default ResourceTable
