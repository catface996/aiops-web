/**
 * Subgraph Detail Page
 *
 * This page displays detailed information about a subgraph with tabs.
 *
 * Features:
 * - Page header with action buttons
 * - Tabbed content area (Overview, Resources, Topology, Permissions)
 * - Tab switching with URL synchronization
 *
 * REQ-FR-021: Detail page layout with header and tabs
 * REQ-FR-022: Four tabs (Overview, Resource Nodes, Topology, Permissions)
 * REQ-FR-023: Tab URL synchronization (?tab=xxx)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
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
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSubgraphDetail } from '@/hooks/subgraph/useSubgraphDetail';
import { useSubgraphPermission } from '@/utils/permission';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components';
import AddResourceModal from '@/components/SubgraphManagement/AddResourceModal';
import OverviewTab from './OverviewTab';
import TopologyTab from './TopologyTab';
import ResourceNodesTab from './ResourceNodesTab';
import PermissionsTab from './PermissionsTab';

const { Title, Text } = Typography;

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
    updateNodePosition,
    refetch,
  } = useSubgraphDetail(subgraphId);

  // Use permission hook for access control
  const { canEdit, canDelete, canAddNode, canRemoveNode } = useSubgraphPermission(
    subgraph
  );

  // Add resource modal state
  const [addResourceModalVisible, setAddResourceModalVisible] = useState(false);

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
   * Opens the add resource modal
   */
  const handleAddNode = () => {
    setAddResourceModalVisible(true);
  };

  /**
   * Handle add resource modal close
   */
  const handleAddResourceModalClose = () => {
    setAddResourceModalVisible(false);
  };

  /**
   * Handle add resource success
   */
  const handleAddResourceSuccess = () => {
    setAddResourceModalVisible(false);
    // Refresh resources list
    fetchResources();
    // Also refresh the main detail to update resource count
    refetch();
  };

  /**
   * Handle back button click
   */
  const handleBack = () => {
    navigate('/subgraphs');
  };

  /**
   * Load data for the active tab on mount or when tab changes via URL
   * REQ-FR-023: Support direct access to specific tabs via URL
   */
  useEffect(() => {
    // Sync activeTab with URL parameter
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }

    // Determine which tab to load data for
    const currentTab = urlTab || activeTab;

    // Lazy load data for the current tab
    if (currentTab === 'resources' && resources.length === 0) {
      fetchResources();
    } else if (currentTab === 'topology' && !topologyData) {
      fetchTopology();
    } else if (currentTab === 'permissions' && permissions.length === 0) {
      fetchPermissions();
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
          canAddNode={canAddNode}
          onRefresh={fetchResources}
          onAddNode={handleAddNode}
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
          onNodeMove={updateNodePosition}
        />
      ),
    },
    {
      key: 'permissions',
      label: '权限',
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
    <PageContainer>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Tooltip title="返回列表">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginTop: '4px' }}
            />
          </Tooltip>
          <div>
            <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
              {subgraph.name}
            </Title>
            {subgraph.description && (
              <Text type="secondary">{subgraph.description}</Text>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <Space>
          <Tooltip title="刷新">
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
            />
          </Tooltip>

          {canEdit && (
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
          )}

          {canDelete && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          )}
        </Space>
      </div>

      {/* Tabbed Content Area - REQ-FR-022 */}
      <Card variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          destroyOnHidden={false}
        />
      </Card>

      {/* Add Resource Modal */}
      <AddResourceModal
        visible={addResourceModalVisible}
        subgraphId={subgraphId}
        existingResourceIds={resources.map((r) => r.resourceId)}
        onClose={handleAddResourceModalClose}
        onSuccess={handleAddResourceSuccess}
      />
    </PageContainer>
  );
};

export default SubgraphDetail;
