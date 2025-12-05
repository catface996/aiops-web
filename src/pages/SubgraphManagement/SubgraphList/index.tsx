/**
 * Subgraph List Page
 *
 * This page displays a list of subgraphs with search, filter, and pagination.
 *
 * Features:
 * - Top filter bar with dropdown multi-select
 * - Search with 300ms debounce
 * - Tag and owner filters
 * - Sorting and pagination
 * - Empty states
 *
 * REQ-FR-009, REQ-FR-010, REQ-FR-012, REQ-FR-013
 */

import React, { useState } from 'react';
import {
  Button,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSubgraphList } from '@/hooks/subgraph/useSubgraphList';
import { PageContainer } from '@/components';
import CreateSubgraphModal from '@/components/SubgraphManagement/CreateSubgraphModal';
import SubgraphFilterBar from './SubgraphFilterBar';
import SubgraphTable from './SubgraphTable';
import type { Subgraph } from '@/types/subgraph';
import listStyles from '@/styles/list-page.module.css';

/**
 * SubgraphList Page Component
 *
 * REQ-FR-009: Top filter bar layout with filters, table
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

  // Create modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);

  /**
   * Handle create button click
   * REQ-FR-001: Create button in top-right corner
   */
  const handleCreateClick = () => {
    setCreateModalVisible(true);
  };

  /**
   * Handle create modal close
   */
  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
  };

  /**
   * Handle create success
   */
  const handleCreateSuccess = (subgraph: Subgraph) => {
    setCreateModalVisible(false);
    // Navigate to the newly created subgraph detail page
    navigate(`/subgraphs/${subgraph.id}`);
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
    <div data-testid="subgraph-list-page">
      <PageContainer>
        {/* 筛选栏和操作按钮 */}
        <div className={listStyles.filterBar}>
          <SubgraphFilterBar
            keyword={keyword}
            selectedTags={selectedTags}
            selectedOwnerId={selectedOwnerId}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onRefresh={refetch}
            loading={loading}
          />
          <div className={listStyles.actionButtons}>
            {/* Refresh Button - REQ-FR-020-B */}
            <Tooltip title="刷新列表">
              <Button
                icon={<ReloadOutlined />}
                onClick={refetch}
                loading={loading}
                className={listStyles.primaryButton}
              />
            </Tooltip>

            {/* Create Button - REQ-FR-001 */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
              className={listStyles.primaryButton}
            >
              创建子图
            </Button>
          </div>
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
      </PageContainer>

      {/* Create Subgraph Modal */}
      <CreateSubgraphModal
        visible={createModalVisible}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default SubgraphList;
