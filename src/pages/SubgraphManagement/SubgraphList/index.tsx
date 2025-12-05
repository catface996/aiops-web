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

import React from 'react';
import {
  Button,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSubgraphList } from '@/hooks/subgraph/useSubgraphList';
import { PageContainer } from '@/components';
import SubgraphFilterBar from './SubgraphFilterBar';
import SubgraphTable from './SubgraphTable';
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

      {/* TODO: Create Modal will be implemented in Task 18 */}
    </div>
  );
};

export default SubgraphList;
