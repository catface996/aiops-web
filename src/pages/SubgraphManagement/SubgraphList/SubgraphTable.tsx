/**
 * SubgraphTable Component
 * 
 * Displays subgraph list in a table format with sorting and row click navigation.
 * 
 * Features:
 * - Display all required columns (name, description, tags, owner count, resource count, timestamps)
 * - Sorting by createdAt, updatedAt, name
 * - Row click navigation to detail page
 * - Pagination support
 * 
 * Performance:
 * - REQ-NFR-001: Optimized with React.memo to prevent unnecessary re-renders
 * - REQ-NFR-007: Ant Design Table handles virtual scrolling for large datasets
 * 
 * REQ-FR-010: Display subgraph table with all required columns
 * REQ-FR-017: Sorting functionality
 * REQ-FR-027: Row click navigation to detail page
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Space, Typography, Tooltip } from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Subgraph } from '@/types/subgraph';
import { EmptyState } from '@/components';

const { Text } = Typography;

/**
 * SubgraphTable Props
 */
export interface SubgraphTableProps {
  /** Subgraph data to display */
  subgraphs: Subgraph[];
  /** Loading state */
  loading: boolean;
  /** Total number of subgraphs (for pagination) */
  total: number;
  /** Current page number */
  page: number;
  /** Page size */
  pageSize: number;
  /** Current sort field */
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  /** Callback when pagination changes */
  onPageChange: (page: number, pageSize: number) => void;
  /** Callback when sort changes */
  onSortChange: (
    sortBy: 'createdAt' | 'updatedAt' | 'name',
    sortOrder: 'asc' | 'desc'
  ) => void;
  /** Callback when row is clicked */
  onRowClick?: (record: Subgraph) => void;
  /** Whether there are active filters/search */
  hasFilters?: boolean;
  /** Callback to clear filters */
  onClearFilters?: () => void;
  /** Callback to create new subgraph */
  onCreateClick?: () => void;
}

/**
 * SubgraphTable Component
 * 
 * Optimized with React.memo to prevent unnecessary re-renders.
 * 
 * REQ-FR-010: Display subgraph table with all required columns
 * REQ-FR-017: Sorting functionality (createdAt, updatedAt, name)
 * REQ-FR-027: Row click navigation to detail page
 * REQ-NFR-001: Performance optimization with React.memo
 */
const SubgraphTable: React.FC<SubgraphTableProps> = memo(({
  subgraphs,
  loading,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
  onRowClick,
  hasFilters = false,
  onClearFilters,
  onCreateClick,
}) => {
  const navigate = useNavigate();

  /**
   * Handle row click - navigate to detail page
   * REQ-FR-027: Navigate to detail on row click
   */
  const handleRowClick = (record: Subgraph) => {
    if (onRowClick) {
      onRowClick(record);
    } else {
      // Default behavior: navigate to detail page
      navigate(`/subgraphs/${record.id}`);
    }
  };

  /**
   * Handle table change (pagination, sorting)
   */
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Subgraph> | SorterResult<Subgraph>[]
  ) => {
    // Handle pagination
    if (pagination.current && pagination.pageSize) {
      onPageChange(pagination.current, pagination.pageSize);
    }

    // Handle sorting
    if (!Array.isArray(sorter) && sorter.field && sorter.order) {
      const field = sorter.field as 'createdAt' | 'updatedAt' | 'name';
      const order = sorter.order === 'ascend' ? 'asc' : 'desc';
      onSortChange(field, order);
    }
  };

  /**
   * Format date string to readable format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Truncate description to max length
   */
  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Table columns definition
   * REQ-FR-010: Display all required columns
   * - name (clickable)
   * - description (truncated to 100 characters)
   * - tags (max 3 visible)
   * - owner count
   * - resource count
   * - created time
   * - updated time
   */
  const columns: ColumnsType<Subgraph> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
      sortOrder: sortBy === 'name' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff', cursor: 'pointer' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string | undefined) => (
        <Tooltip title={text || '-'}>
          <Text type="secondary">{truncateText(text, 100)}</Text>
        </Tooltip>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[] | undefined) => {
        if (!tags || tags.length === 0) return <Text type="secondary">-</Text>;
        const displayTags = tags.slice(0, 3);
        const remainingCount = tags.length - 3;
        return (
          <Space size={4} wrap>
            {displayTags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
            {remainingCount > 0 && (
              <Tag color="default">+{remainingCount}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: '所有者数量',
      dataIndex: 'ownerCount',
      key: 'ownerCount',
      width: 120,
      align: 'center',
      render: (_: unknown, record: Subgraph) => (
        <Space>
          <UserOutlined />
          <Text>{record.metadata?.ownerCount || 0}</Text>
        </Space>
      ),
    },
    {
      title: '资源数量',
      dataIndex: 'resourceCount',
      key: 'resourceCount',
      width: 120,
      align: 'center',
      render: (_: unknown, record: Subgraph) => (
        <Space>
          <DatabaseOutlined />
          <Text>{record.metadata?.resourceCount || 0}</Text>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: true,
      sortOrder:
        sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text: string) => <Text type="secondary">{formatDate(text)}</Text>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      sorter: true,
      sortOrder:
        sortBy === 'updatedAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text: string) => <Text type="secondary">{formatDate(text)}</Text>,
    },
  ];

  /**
   * Render empty state
   * REQ-FR-019: Empty state when no data
   * REQ-FR-020: Empty state when no search results
   */
  const renderEmptyState = () => {
    if (hasFilters) {
      // Search/filter has no results - REQ-FR-020
      return (
        <EmptyState
          type="no-results"
          title="未找到匹配的子图"
          description="尝试调整搜索条件或过滤器"
          actionText="清除搜索"
          onAction={onClearFilters}
          showAction={!!onClearFilters}
        />
      );
    }

    // No subgraphs at all - REQ-FR-019
    return (
      <EmptyState
        type="empty"
        title="暂无子图"
        description="开始创建您的第一个子图"
        actionText="创建子图"
        onAction={onCreateClick}
        showAction={!!onCreateClick}
      />
    );
  };

  return (
    <Table<Subgraph>
      columns={columns}
      dataSource={subgraphs}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={handleTableChange}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: 'pointer' },
      })}
      locale={{
        emptyText: renderEmptyState(),
      }}
      scroll={{ x: 1400 }}
    />
  );
});

SubgraphTable.displayName = 'SubgraphTable';

export default SubgraphTable;
