/**
 * SubgraphFilterPanel Component Tests
 * 
 * Tests for the SubgraphFilterPanel component.
 * 
 * REQ-FR-015: Tag filter with AND logic
 * REQ-FR-016: Owner filter with OR logic
 * REQ-FR-020-A: Reset filters functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubgraphFilterPanel from './SubgraphFilterPanel';
import SubgraphService from '@/services/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    listSubgraphs: vi.fn(),
  },
}));

// Mock Ant Design message
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

describe('SubgraphFilterPanel Component', () => {
  const mockOnFilterChange = vi.fn();

  const mockSubgraphsResponse = {
    items: [
      {
        id: 1,
        name: 'Subgraph 1',
        tags: ['tag1', 'tag2'],
        createdBy: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: 2,
        name: 'Subgraph 2',
        tags: ['tag2', 'tag3'],
        createdBy: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        version: 1,
      },
    ],
    total: 2,
    page: 1,
    pageSize: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SubgraphService.listSubgraphs).mockResolvedValue(mockSubgraphsResponse);
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      selectedTags: [],
      selectedOwnerId: null,
      onFilterChange: mockOnFilterChange,
      ...props,
    };

    return render(<SubgraphFilterPanel {...defaultProps} />);
  };

  it('should render filter panel with title', () => {
    renderComponent();
    expect(screen.getByText('筛选条件')).toBeInTheDocument();
  });

  it('should render tag filter section', () => {
    renderComponent();
    expect(screen.getByText('标签')).toBeInTheDocument();
  });

  it('should render owner filter section', () => {
    renderComponent();
    expect(screen.getByText('所有者')).toBeInTheDocument();
  });

  it('should load and display available tags', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });
  });

  it('should load and display available owners', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  it('should call onFilterChange when tag is selected', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
    });

    const tag1Checkbox = screen.getByText('tag1').closest('label')?.querySelector('input');
    expect(tag1Checkbox).toBeInTheDocument();

    if (tag1Checkbox) {
      fireEvent.click(tag1Checkbox);
    }

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tags: ['tag1'],
    });
  });

  it('should call onFilterChange when multiple tags are selected (AND logic)', async () => {
    renderComponent({ selectedTags: ['tag1'] });

    await waitFor(() => {
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });

    const tag2Checkbox = screen.getByText('tag2').closest('label')?.querySelector('input');
    expect(tag2Checkbox).toBeInTheDocument();

    if (tag2Checkbox) {
      fireEvent.click(tag2Checkbox);
    }

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tags: ['tag1', 'tag2'],
    });
  });

  it('should call onFilterChange when tag is deselected', async () => {
    renderComponent({ selectedTags: ['tag1', 'tag2'] });

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
    });

    const tag1Checkbox = screen.getByText('tag1').closest('label')?.querySelector('input');
    expect(tag1Checkbox).toBeInTheDocument();

    if (tag1Checkbox) {
      fireEvent.click(tag1Checkbox);
    }

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tags: ['tag2'],
    });
  });

  it('should call onFilterChange when owner is selected', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const owner1Checkbox = screen.getByText('User 1').closest('label')?.querySelector('input');
    expect(owner1Checkbox).toBeInTheDocument();

    if (owner1Checkbox) {
      fireEvent.click(owner1Checkbox);
    }

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ownerId: 1,
    });
  });

  it('should call onFilterChange when owner is deselected', async () => {
    renderComponent({ selectedOwnerId: 1 });

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const owner1Checkbox = screen.getByText('User 1').closest('label')?.querySelector('input');
    expect(owner1Checkbox).toBeInTheDocument();

    if (owner1Checkbox) {
      fireEvent.click(owner1Checkbox);
    }

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ownerId: null,
    });
  });

  it('should display reset button when filters are active', async () => {
    renderComponent({ selectedTags: ['tag1'] });

    await waitFor(() => {
      expect(screen.getByText('重置')).toBeInTheDocument();
    });
  });

  it('should not display reset button when no filters are active', () => {
    renderComponent();

    expect(screen.queryByText('重置')).not.toBeInTheDocument();
  });

  it('should reset all filters when reset button is clicked', async () => {
    renderComponent({ selectedTags: ['tag1'], selectedOwnerId: 1 });

    await waitFor(() => {
      expect(screen.getByText('重置')).toBeInTheDocument();
    });

    const resetButton = screen.getByText('重置');
    fireEvent.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tags: [],
      ownerId: null,
    });
  });

  it('should display selected tags count', async () => {
    renderComponent({ selectedTags: ['tag1', 'tag2'] });

    await waitFor(() => {
      expect(screen.getByText('(2 已选)')).toBeInTheDocument();
    });
  });

  it('should display selected owner count', async () => {
    renderComponent({ selectedOwnerId: 1 });

    await waitFor(() => {
      expect(screen.getByText('(1 已选)')).toBeInTheDocument();
    });
  });

  it('should display filter summary when filters are active', async () => {
    renderComponent({ selectedTags: ['tag1'], selectedOwnerId: 1 });

    await waitFor(() => {
      expect(screen.getByText('当前筛选:')).toBeInTheDocument();
      expect(screen.getByText('• 标签: 1 个 (AND)')).toBeInTheDocument();
      expect(screen.getByText('• 所有者: 1 个 (OR)')).toBeInTheDocument();
    });
  });

  it('should display selected tags in summary', async () => {
    renderComponent({ selectedTags: ['tag1', 'tag2'] });

    await waitFor(() => {
      expect(screen.getByText('已选标签: tag1, tag2')).toBeInTheDocument();
    });
  });

  it('should display empty state when no tags available', async () => {
    vi.mocked(SubgraphService.listSubgraphs).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 1000,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('暂无标签')).toBeInTheDocument();
      expect(screen.getByText('暂无所有者')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(SubgraphService.listSubgraphs).mockRejectedValue(
      new Error('API Error')
    );

    renderComponent();

    // Component should still render without crashing
    expect(screen.getByText('筛选条件')).toBeInTheDocument();
  });
});
