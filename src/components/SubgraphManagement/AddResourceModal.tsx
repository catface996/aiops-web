/**
 * AddResourceModal Component
 * 
 * Modal dialog for adding resource nodes to a subgraph with search, filtering, and batch selection.
 * 
 * Requirements:
 * - REQ-FR-057: Display "Add Node" button (visible only to Owners)
 * - REQ-FR-059: Display resource node selection interface with search, type filter, and node list
 * - REQ-FR-060: Display available resource nodes in a table with pagination
 * - REQ-FR-061: Implement node search functionality with fuzzy matching
 * - REQ-FR-062: Provide type filter dropdown to filter nodes by resource type
 * - REQ-FR-063: Disable checkboxes and display "Already Added" badge for nodes already in subgraph
 * - REQ-FR-064: Support selecting multiple nodes using checkboxes and display selected count
 * - REQ-FR-064-A: Limit batch selection to maximum 50 nodes with warning message
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal, Table, Input, Select, Space, Badge, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getResourceList, getResourceTypes } from '@/services/resource';
import type { ResourceDTO, ResourceType } from '@/types/resource';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const { Option } = Select;

/**
 * Simple debounce utility function
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface AddResourceModalProps {
  visible: boolean;
  subgraphId: number;
  existingResourceIds: number[];
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
}

/**
 * AddResourceModal - Modal component for adding resource nodes to subgraph
 */
const AddResourceModal: React.FC<AddResourceModalProps> = ({
  visible,
  subgraphId,
  existingResourceIds,
  onClose,
  onSuccess,
}) => {
  // State management
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch resource types on mount
  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
        const types = await getResourceTypes();
        setResourceTypes(types);
      } catch (error) {
        console.error('Failed to fetch resource types:', error);
      }
    };

    if (visible) {
      fetchResourceTypes();
    }
  }, [visible]);

  // Fetch resources with current filters
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        keyword?: string;
        resourceTypeId?: number;
      } = {
        page: page - 1, // Backend uses 0-based pagination
        size: pageSize,
      };

      if (keyword) {
        params.keyword = keyword;
      }

      if (typeFilter) {
        params.resourceTypeId = typeFilter;
      }

      const response = await getResourceList(params);
      setResources(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      message.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, typeFilter]);

  // Fetch resources when filters change
  useEffect(() => {
    if (visible) {
      fetchResources();
    }
  }, [visible, fetchResources]);

  // Debounced search handler (REQ-FR-061)
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setKeyword(value);
        setPage(1); // Reset to first page on search
      }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  // Handle type filter change (REQ-FR-062)
  const handleTypeFilterChange = useCallback((value: number | null) => {
    setTypeFilter(value);
    setPage(1); // Reset to first page on filter change
  }, []);

  // Handle pagination change
  const handleTableChange = useCallback((pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  }, []);

  // Handle row selection (REQ-FR-064)
  const handleSelectionChange = useCallback(
    (selectedRowKeys: React.Key[]) => {
      const newSelectedIds = selectedRowKeys as number[];

      // Check batch selection limit (REQ-FR-064-A)
      if (newSelectedIds.length > 50) {
        message.warning(
          'You can add up to 50 nodes at once. Please reduce your selection.'
        );
        return;
      }

      setSelectedIds(newSelectedIds);
    },
    []
  );

  // Handle submit (REQ-FR-065)
  const handleSubmit = useCallback(async () => {
    if (selectedIds.length === 0) {
      message.warning('Please select at least one resource node');
      return;
    }

    setSubmitting(true);
    try {
      // Import SubgraphService dynamically to avoid circular dependency
      const { default: SubgraphService } = await import('@/services/subgraph');
      
      await SubgraphService.addResources(subgraphId, selectedIds);

      // Show success message (REQ-FR-066)
      message.success(`${selectedIds.length} node(s) added successfully`, 3);

      // Reset state
      setSelectedIds([]);
      setKeyword('');
      setTypeFilter(null);
      setPage(1);

      // Call success callback
      onSuccess(selectedIds.length);
    } catch (error: unknown) {
      // Handle errors (REQ-FR-067, REQ-FR-068)
      console.error('Failed to add resources:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError.response?.data?.message || 'Failed to add resources';
        message.error(errorMessage);
      } else {
        message.error('Failed to add resources. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [selectedIds, subgraphId, onSuccess]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelectedIds([]);
    setKeyword('');
    setTypeFilter(null);
    setPage(1);
    onClose();
  }, [onClose]);

  // Table columns definition (REQ-FR-060)
  const columns: ColumnsType<ResourceDTO> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        ellipsis: true,
      },
      {
        title: 'Type',
        dataIndex: 'resourceTypeName',
        key: 'resourceTypeName',
        width: '20%',
        render: (text: string, record: ResourceDTO) => (
          <Space>
            <span>{record.resourceTypeCode}</span>
            <span>{text}</span>
          </Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'statusDisplay',
        key: 'statusDisplay',
        width: '15%',
        render: (text: string, record: ResourceDTO) => {
          const colorMap: Record<string, string> = {
            RUNNING: 'success',
            STOPPED: 'default',
            MAINTENANCE: 'warning',
            OFFLINE: 'error',
          };
          return <Badge status={colorMap[record.status] as any} text={text} />;
        },
      },
      {
        title: 'Owner',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: '15%',
        render: (createdBy: number) => `User ${createdBy}`,
      },
      {
        title: '',
        key: 'badge',
        width: '20%',
        render: (_: unknown, record: ResourceDTO) => {
          // Display "Already Added" badge for existing resources (REQ-FR-063)
          if (existingResourceIds.includes(record.id)) {
            return <Tag color="default">Already Added</Tag>;
          }
          return null;
        },
      },
    ],
    [existingResourceIds]
  );

  // Row selection configuration (REQ-FR-064)
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedIds,
      onChange: handleSelectionChange,
      // Disable selection for already added resources (REQ-FR-063)
      getCheckboxProps: (record: ResourceDTO) => ({
        disabled: existingResourceIds.includes(record.id),
      }),
    }),
    [selectedIds, existingResourceIds, handleSelectionChange]
  );

  return (
    <Modal
      title="Add Resource Nodes"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Add"
      cancelText="Cancel"
      width={900}
      okButtonProps={{
        disabled: selectedIds.length === 0 || selectedIds.length > 50,
      }}
      destroyOnClose
    >
      {/* Search and Filter Section (REQ-FR-061, REQ-FR-062) */}
      <Space style={{ marginBottom: 16, width: '100%' }} size="middle">
        <Input
          placeholder="Search resource name"
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filter by type"
          style={{ width: 200 }}
          onChange={handleTypeFilterChange}
          value={typeFilter}
          allowClear
        >
          {resourceTypes.map((type) => (
            <Option key={type.id} value={type.id}>
              {type.name}
            </Option>
          ))}
        </Select>
      </Space>

      {/* Resource Table (REQ-FR-060) */}
      <Table<ResourceDTO>
        columns={columns}
        dataSource={resources}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} resources`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ y: 400 }}
      />

      {/* Selected Count Display (REQ-FR-064) */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <span>
            Selected: <strong>{selectedIds.length}</strong> node(s)
          </span>
          {selectedIds.length > 50 && (
            <Tag color="error">Maximum 50 nodes allowed</Tag>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default AddResourceModal;
