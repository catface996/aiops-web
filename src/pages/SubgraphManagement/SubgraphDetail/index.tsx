/**
 * Subgraph Detail Page
 * 
 * This page displays detailed information about a subgraph with tabs.
 * 
 * Features:
 * - Breadcrumb navigation
 * - Page header with action buttons
 * - Tabbed content area (Overview, Resources, Topology, Permissions)
 * - Tab switching with URL synchronization
 * 
 * REQ-FR-021: Detail page layout with breadcrumb, header, and tabs
 * REQ-FR-022: Four tabs (Overview, Resource Nodes, Topology, Permissions)
 * REQ-FR-023: Tab URL synchronization (?tab=xxx)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Spin,
  Result,
  Tooltip,
} from 'antd';
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSubgraphDetail } from '@/hooks/subgraph/useSubgraphDetail';
import { useSubgraphPermission } from '@/hooks/subgraph/useSubgraphPermission';
import { useAuth } from '@/hooks/useAuth';
import OverviewTab from './OverviewTab';
import TopologyTab from './TopologyTab';
import ResourceNodesTab from './ResourceNodesTab';
import PermissionsTab from './PermissionsTab';

const { Title } = Typography;

/**
 * Tab key type
 */
type TabKey = 'overview' | 'resources' | 'topology' | 'permissions';

/**
 * SubgraphDetail Page Component
 * 
 * REQ-FR-021: Display breadcrumb, header, and tabbed content
 * REQ-FR-022: Four tabs with default to Overview
 * REQ-FR-023: URL synchronization with query parameter
 */
const SubgraphDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse subgraph ID
  const subgraphId = id ? parseInt(id, 10) : 0;

  // Get current user
  const { user } = useAuth();

  // Get active tab from URL or default to 'overview'
  // REQ-FR-023: Tab URL synchronization
  const urlTab = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(
    urlTab && ['overview', 'resources', 'topology', 'permissions'].includes(urlTab)
      ? urlTab
      : 'overview'
  );

  // Use custom hook for state management
  // REQ-FR-021: Load subgraph detail
  const {
    subgraph,
    loading,
    resources,
    resourcesLoading,
    topologyData,
    topologyLoading,
    permissions,
    permissionsLoading,
    fetchResources,
    fetchTopology,
    fetchPermissions,
    refetch,
  } = useSubgraphDetail(subgraphId);

  // Use permission hook for access control
  const { canEdit, canDelete, canAddNode, canRemoveNode } = useSubgraphPermission(
    subgraphId,
    subgraph
  );

  /**
   * Handle tab change
   * REQ-FR-023: Update URL query parameter when tab changes
   */
  const handleTabChange = (key: string) => {
    const tabKey = key as TabKey;
    setActiveTab(tabKey);

    // Update URL query parameter
    setSearchParams({ tab: tabKey });

    // Lazy load data for specific tabs
    if (tabKey === 'resources' && resources.length === 0) {
      fetchResources();
    } else if (tabKey === 'topology' && !topologyData) {
      fetchTopology();
    } else if (tabKey === 'permissions' && permissions.length === 0) {
      fetchPermissions();
    }
  };

  /**
   * Handle edit button click
   * TODO: Will be implemented in Task 22
   */
  const handleEdit = () => {
    console.log('Edit subgraph:', subgraphId);
    // TODO: Open edit modal
  };

  /**
   * Handle delete button click
   * TODO: Will be implemented in Task 23
   */
  const handleDelete = () => {
    console.log('Delete subgraph:', subgraphId);
    // TODO: Open delete confirmation modal
  };

  /**
   * Handle add node button click
   * TODO: Will be implemented in Task 24
   */
  const handleAddNode = () => {
    console.log('Add node to subgraph:', subgraphId);
    // TODO: Open add resource modal
  };

  /**
   * Handle breadcrumb navigation
   */
  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  /**
   * Sync URL tab parameter with state on mount
   * REQ-FR-023: Support direct access to specific tabs via URL
   */
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);

      // Lazy load data for the active tab
      if (urlTab === 'resources' && resources.length === 0) {
        fetchResources();
      } else if (urlTab === 'topology' && !topologyData) {
        fetchTopology();
      } else if (urlTab === 'permissions' && permissions.length === 0) {
        fetchPermissions();
      }
    }
  }, [urlTab, activeTab, resources.length, topologyData, permissions.length, fetchResources, fetchTopology, fetchPermissions]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="加载子图详情..." />
      </div>
    );
  }

  // Error state - subgraph not found
  if (!subgraph) {
    return (
      <Result
        status="404"
        title="子图不存在"
        subTitle="您访问的子图不存在或已被删除"
        extra={
          <Button type="primary" onClick={() => navigate('/subgraphs')}>
            返回列表
          </Button>
        }
      />
    );
  }

  /**
   * Tab items configuration
   * REQ-FR-022: Four tabs (Overview, Resource Nodes, Topology, Permissions)
   */
  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: <OverviewTab subgraph={subgraph} />,
    },
    {
      key: 'resources',
      label: `资源节点 (${subgraph.resourceCount || 0})`,
      children: (
        <ResourceNodesTab
          subgraphId={subgraphId}
          resources={resources}
          loading={resourcesLoading}
          canRemoveNode={canRemoveNode}
          onRefresh={fetchResources}
        />
      ),
    },
    {
      key: 'topology',
      label: '拓扑图',
      children: (
        <TopologyTab
          topologyData={topologyData}
          loading={topologyLoading}
          onRefresh={fetchTopology}
          onAddNode={handleAddNode}
          canAddNode={canAddNode}
        />
      ),
    },
    {
      key: 'permissions',
      label: '权限管理',
      children: (
        <PermissionsTab
          subgraphId={subgraphId}
          owners={subgraph.owners}
          viewers={subgraph.viewers}
          loading={permissionsLoading}
          canManagePermissions={canEdit}
          currentUserId={user?.id || 0}
          onRefresh={refetch}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Breadcrumb Navigation - REQ-FR-021 */}
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: (
              <a onClick={() => handleBreadcrumbClick('/dashboard')}>
                <HomeOutlined />
              </a>
            ),
          },
          {
            title: (
              <a onClick={() => handleBreadcrumbClick('/subgraphs')}>
                子图管理
              </a>
            ),
          },
          {
            title: subgraph.name,
          },
        ]}
      />

      {/* Page Header - REQ-FR-021 */}
      <Card
        bordered={false}
        style={{ marginBottom: '16px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
              {subgraph.name}
            </Title>
            {subgraph.description && (
              <Typography.Text type="secondary">
                {subgraph.description}
              </Typography.Text>
            )}
          </div>

          {/* Action Buttons - REQ-FR-021 */}
          <Space>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined />}
                onClick={refetch}
                loading={loading}
              />
            </Tooltip>

            {canEdit && (
              <Tooltip title="编辑子图">
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑
                </Button>
              </Tooltip>
            )}

            {canAddNode && (
              <Tooltip title="添加资源节点">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNode}
                >
                  添加节点
                </Button>
              </Tooltip>
            )}

            {canDelete && (
              <Tooltip title="删除子图">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  删除
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      </Card>

      {/* Tabbed Content Area - REQ-FR-022 */}
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          destroyInactiveTabPane={false}
        />
      </Card>
    </div>
  );
};

export default SubgraphDetail;
