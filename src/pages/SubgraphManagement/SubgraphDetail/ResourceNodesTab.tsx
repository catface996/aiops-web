/**
 * ResourceNodesTab Component
 * 
 * Displays the resource nodes table in the subgraph detail page.
 * 
 * Features:
 * - Display resource nodes in a table
 * - Search functionality
 * - Remove button (visible only to Owners)
 * - Empty state handling
 * 
 * REQ-FR-025: Display resource nodes table with all required columns
 * REQ-FR-026: Implement search functionality
 * REQ-FR-071: Display remove button for Owners
 * REQ-FR-074: Show confirmation dialog before removing
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Empty,
  Tooltip,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ResourceInfo } from '@/types/subgraph';
import SubgraphService from '@/services/subgraph';

const { Text } = Typography;

/**
 * Props for ResourceNodesTab component
 */
interface ResourceNodesTabProps {
  subgraphId: number;
  resources: ResourceInfo[];
  loading: boolean;
  canRemoveNode: boolean;
  onRefresh: () => void;
}

/**
 * Get status badge color based on status
 */
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    running: 'success',
    stopped: 'default',
    error: 'error',
    warning: 'warning',
  };
  return statusMap[status.toLowerCase()] || 'default';
};

/**
 * Get status display text
 */
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '错误',
    warning: '警告',
  };
  return statusMap[status.toLowerCase()] || status;
};

/**
 * ResourceNodesTab Component
 * 
 * REQ-FR-025: Display resource nodes table
 * REQ-FR-026: Implement search functionality
 * REQ-FR-071: Show remove button for Owners
 */
const ResourceNodesTab: React.FC<ResourceNodesTabProps> = ({
  subgraphId,
  resources,
  loading,
  canRemoveNode,
  onRefresh,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [removing, setRemoving] = useState(false);

  /**
   * Filter resources by search keyword
   * REQ-FR-026: Fuzzy search by node name
   */
  const filteredResources = useMemo(() => {
    if (!searchKeyword.trim()) {
      return resources;
    }

    const keyword = searchKeyword.toLowerCase();
    return resources.filter((resource) =>
      resource.name.toLowerCase().includes(keyword)
    );
  }, [resources, searchKeyword]);

  /**
   * Handle remove resource node
   * REQ-FR-074: Show confirmation dialog
   * REQ-FR-075: Execute remove operation
   */
  const handleRemove = (resource: ResourceInfo) => {
    Modal.confirm({
      title: '移除资源节点',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>确定要从子图中移除此资源节点吗？</p>
          <p>
            <Text strong>{resource.name}</Text>
          </p>
          <p>
            <Text type="secondary">
              注意：资源节点本身不会被删除，只是从当前子图中移除关联。
            </Text>
          </p>
        </div>
      ),
      okText: '确认移除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setRemoving(true);
          await SubgraphService.removeResources(subgraphId, [resource.resourceId]);
          message.success('资源节点移除成功');
          onRefresh();
        } catch (error: any) {
          console.error('Failed to remove resource:', error);
          message.error(error.message || '移除资源节点失败');
        } finally {
          setRemoving(false);
        }
      },
    });
  };

  /**
   * Table columns configuration
   * REQ-FR-025: Display all required columns
   */
  const columns: ColumnsType<ResourceInfo> = [
    {
      title: '节点名称',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (name: string, record: ResourceInfo) => (
        <Tooltip title="点击查看资源详情">
          <a
            onClick={() => {
              // TODO: Navigate to resource detail page
              // This will be implemented when resource detail page is available
              console.log('Navigate to resource detail:', record.resourceId);
            }}
          >
            {name}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '添加时间',
      dataIndex: 'addedAt',
      key: 'addedAt',
      width: '20%',
      render: (addedAt: string) => {
        const date = new Date(addedAt);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
    },
    {
      title: '添加者',
      dataIndex: 'addedBy',
      key: 'addedBy',
      width: '15%',
      render: (addedBy: number) => `用户 ${addedBy}`,
    },
    {
      title: '操作',
      key: 'actions',
      width: '10%',
      render: (_: any, record: ResourceInfo) => (
        <Space size="small">
          {canRemoveNode && (
            <Tooltip title="从子图中移除">
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(record)}
                loading={removing}
              >
                移除
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  /**
   * Empty state when no resources
   */
  if (!loading && resources.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty
          description="此子图暂无资源节点"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {canRemoveNode && (
            <Button type="primary">添加资源节点</Button>
          )}
        </Empty>
      </div>
    );
  }

  /**
   * Empty state when search has no results
   */
  const showEmptySearch = !loading && filteredResources.length === 0 && searchKeyword.trim();

  return (
    <div style={{ padding: '24px' }}>
      {/* Search Bar - REQ-FR-026 */}
      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder="搜索资源节点名称"
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ width: '300px' }}
        />
        <Text type="secondary" style={{ marginLeft: '16px' }}>
          共 {filteredResources.length} 个资源节点
        </Text>
      </div>

      {/* Resource Nodes Table - REQ-FR-025 */}
      {showEmptySearch ? (
        <Empty
          description={`未找到包含 "${searchKeyword}" 的资源节点`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button onClick={() => setSearchKeyword('')}>清除搜索</Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredResources}
          loading={loading}
          rowKey="resourceId"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      )}
    </div>
  );
};

export default ResourceNodesTab;
