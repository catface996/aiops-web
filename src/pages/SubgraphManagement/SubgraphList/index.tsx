/**
 * Subgraph List Page
 * 
 * This page displays a list of subgraphs with search, filter, and pagination.
 * 
 * Features:
 * - Three-column layout (filter panel, table, toolbar)
 * - Search with 300ms debounce
 * - Tag and owner filters
 * - Sorting and pagination
 * - Empty states
 * 
 * REQ-FR-009, REQ-FR-010, REQ-FR-012, REQ-FR-013
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSubgraphList } from '@/hooks/subgraph/useSubgraphList';
import SubgraphFilterPanel from './SubgraphFilterPanel';
import SubgraphTable from './SubgraphTable';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Search } = Input;

/**
 * SubgraphList Page Component
 * 
 * REQ-FR-009: Three-column layout with filters, table, and toolbar
 * REQ-FR-010: Display subgraph table with all required columns
 * REQ-FR-012: Pagination support
 * REQ-FR-013: Search functionality with debounce
 */
const SubgraphList: React.FC = () => {
  const navigate = useNavigate();

  // Use custom hook for state management
  const {
    subgraphs,
    loading,
    total,
    page,
    pageSize,
    keyword,
    selectedTags,
    selectedOwnerId,
    sortBy,
    sortOrder,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    refetch,
  } = useSubgraphList();

  /**
   * Handle create button click
   * REQ-FR-001: Create button in top-right corner
   */
  const handleCreateClick = () => {
    // TODO: Open create modal (will be implemented in Task 18)
    console.log('Create subgraph clicked');
  };

  /**
   * Handle clear filters
   */
  const handleClearFilters = () => {
    handleSearch('');
    handleFilterChange({ tags: [], ownerId: null });
  };

  /**
   * Check if there are active filters
   */
  const hasActiveFilters = keyword || selectedTags.length > 0 || selectedOwnerId;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Filter Panel - Left Sidebar */}
      {/* REQ-FR-015: Tag filter, REQ-FR-016: Owner filter, REQ-FR-020-A: Reset filters */}
      <Sider
        width={240}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <SubgraphFilterPanel
          selectedTags={selectedTags}
          selectedOwnerId={selectedOwnerId}
          onFilterChange={handleFilterChange}
        />
      </Sider>

      {/* Main Content Area */}
      <Content style={{ padding: '24px' }}>
        <Card
          bordered={false}
          style={{ minHeight: 'calc(100vh - 48px)' }}
        >
          {/* Toolbar - Top Section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              子图管理
            </Title>

            <Space>
              {/* Search Box - REQ-FR-013 */}
              <Search
                placeholder="搜索子图名称或描述"
                allowClear
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />

              {/* Refresh Button - REQ-FR-020-B */}
              <Tooltip title="刷新列表">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refetch}
                  loading={loading}
                />
              </Tooltip>

              {/* Create Button - REQ-FR-001 */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateClick}
              >
                创建子图
              </Button>
            </Space>
          </div>

          {/* Subgraph Table - REQ-FR-010 */}
          <SubgraphTable
            subgraphs={subgraphs}
            loading={loading}
            total={total}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onCreateClick={handleCreateClick}
          />
        </Card>
      </Content>

      {/* TODO: Create Modal will be implemented in Task 18 */}
    </Layout>
  );
};

export default SubgraphList;
