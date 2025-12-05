/**
 * SubgraphList Component Tests
 * 
 * Tests for the SubgraphList page component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubgraphList from './index';
import * as useSubgraphListHook from '@/hooks/subgraph/useSubgraphList';

// Mock the useSubgraphList hook
vi.mock('@/hooks/subgraph/useSubgraphList');

// Mock Ant Design components that use portals
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

describe('SubgraphList Component', () => {
  const mockUseSubgraphList = {
    subgraphs: [],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 20,
    keyword: '',
    selectedTags: [],
    selectedOwnerId: null,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    handleSearch: vi.fn(),
    handleFilterChange: vi.fn(),
    handlePageChange: vi.fn(),
    handleSortChange: vi.fn(),
    fetchSubgraphs: vi.fn(),
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSubgraphListHook.useSubgraphList).mockReturnValue(mockUseSubgraphList);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SubgraphList />
      </BrowserRouter>
    );
  };

  it('should render the page title', () => {
    renderComponent();
    expect(screen.getByText('子图管理')).toBeInTheDocument();
  });

  it('should render the create button', () => {
    renderComponent();
    const createButtons = screen.getAllByText('创建子图');
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it('should render the search input', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText('搜索子图名称或描述');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render empty state when no subgraphs', () => {
    renderComponent();
    expect(screen.getByText('暂无子图')).toBeInTheDocument();
  });

  it('should render subgraphs table when data is available', async () => {
    const mockSubgraphs = [
      {
        id: 1,
        name: 'Test Subgraph',
        description: 'Test description',
        tags: ['tag1', 'tag2'],
        metadata: { ownerCount: '2', resourceCount: '5' },
        createdBy: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        version: 1,
      },
    ];

    vi.mocked(useSubgraphListHook.useSubgraphList).mockReturnValue({
      ...mockUseSubgraphList,
      subgraphs: mockSubgraphs,
      total: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Subgraph')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(useSubgraphListHook.useSubgraphList).mockReturnValue({
      ...mockUseSubgraphList,
      loading: true,
    });

    renderComponent();
    
    // Ant Design Spin component should be present
    const spinners = document.querySelectorAll('.ant-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should render filter panel', () => {
    renderComponent();
    expect(screen.getByText('筛选条件')).toBeInTheDocument();
    // Check for filter panel sections (using getAllByText since table also has "标签")
    const tagElements = screen.getAllByText('标签');
    expect(tagElements.length).toBeGreaterThan(0);
    expect(screen.getByText('所有者')).toBeInTheDocument();
  });
});
