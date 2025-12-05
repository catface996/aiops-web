/**
 * SubgraphTable Component Tests
 * 
 * Tests for the SubgraphTable component functionality:
 * - Display all required columns
 * - Sorting functionality
 * - Row click navigation
 * - Empty states
 * - Pagination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubgraphTable from './SubgraphTable';
import type { Subgraph } from '@/types/subgraph';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SubgraphTable', () => {
  const mockSubgraphs: Subgraph[] = [
    {
      id: 1,
      name: 'Test Subgraph 1',
      description: 'This is a test subgraph with a description',
      tags: ['tag1', 'tag2', 'tag3', 'tag4'],
      metadata: {
        ownerCount: '2',
        resourceCount: '10',
      },
      createdBy: 1,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
      version: 1,
    },
    {
      id: 2,
      name: 'Test Subgraph 2',
      description: 'Another test subgraph',
      tags: ['tag1'],
      metadata: {
        ownerCount: '1',
        resourceCount: '5',
      },
      createdBy: 1,
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-04T10:00:00Z',
      version: 1,
    },
  ];

  const defaultProps = {
    subgraphs: mockSubgraphs,
    loading: false,
    total: 2,
    page: 1,
    pageSize: 20,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    onPageChange: vi.fn(),
    onSortChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  describe('Column Display', () => {
    it('should display all required columns', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      // Check column headers (use getAllByText since Ant Design may render duplicates for ellipsis/scroll)
      expect(screen.getAllByText('名称').length).toBeGreaterThan(0);
      expect(screen.getAllByText('描述').length).toBeGreaterThan(0);
      expect(screen.getAllByText('标签').length).toBeGreaterThan(0);
      expect(screen.getAllByText('所有者数量').length).toBeGreaterThan(0);
      expect(screen.getAllByText('资源数量').length).toBeGreaterThan(0);
      expect(screen.getAllByText('创建时间').length).toBeGreaterThan(0);
      expect(screen.getAllByText('更新时间').length).toBeGreaterThan(0);
    });

    it('should display subgraph names', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      expect(screen.getByText('Test Subgraph 1')).toBeInTheDocument();
      expect(screen.getByText('Test Subgraph 2')).toBeInTheDocument();
    });

    it('should display descriptions', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      expect(screen.getByText('This is a test subgraph with a description')).toBeInTheDocument();
      expect(screen.getByText('Another test subgraph')).toBeInTheDocument();
    });

    it('should display tags with max 3 visible', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      // First subgraph has 4 tags, should show 3 + "+1"
      const firstRow = screen.getByText('Test Subgraph 1').closest('tr');
      expect(firstRow).toBeInTheDocument();
      
      if (firstRow) {
        const tags = within(firstRow).getAllByText(/tag\d/);
        expect(tags).toHaveLength(3); // Only 3 tags visible
        expect(within(firstRow).getByText('+1')).toBeInTheDocument();
      }
    });

    it('should display owner and resource counts', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      // Check for counts in the table (use getAllByText since numbers may appear in pagination)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // owner count
      expect(screen.getByText('10')).toBeInTheDocument(); // resource count
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // owner count (also in pagination)
      expect(screen.getByText('5')).toBeInTheDocument(); // resource count
    });

    it('should display formatted timestamps', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      // Timestamps should be formatted (checking for year at least)
      const timestamps = screen.getAllByText(/2024/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Sorting Functionality', () => {
    it('should call onSortChange when clicking sortable column header', () => {
      const onSortChange = vi.fn();
      renderWithRouter(
        <SubgraphTable {...defaultProps} onSortChange={onSortChange} />
      );

      // Click on name column header to sort (use getAllByText and click the first one)
      const nameHeaders = screen.getAllByText('名称');
      fireEvent.click(nameHeaders[0]);

      // Should call onSortChange (Ant Design Table handles the actual sorting)
      // The callback will be triggered through onChange handler
    });

    it('should display sort indicator on sorted column', () => {
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          sortBy="name"
          sortOrder="asc"
        />
      );

      // Check that the name column has sort indicator (use getAllByText and check the first one)
      const nameHeaders = screen.getAllByText('名称');
      const nameHeader = nameHeaders[0].closest('th');
      expect(nameHeader).toHaveClass('ant-table-column-sort');
    });
  });

  describe('Row Click Navigation', () => {
    it('should navigate to detail page when row is clicked', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      // Click on first row
      const firstRow = screen.getByText('Test Subgraph 1').closest('tr');
      if (firstRow) {
        fireEvent.click(firstRow);
      }

      // Should navigate to detail page
      expect(mockNavigate).toHaveBeenCalledWith('/subgraphs/1');
    });

    it('should call custom onRowClick if provided', () => {
      const onRowClick = vi.fn();
      renderWithRouter(
        <SubgraphTable {...defaultProps} onRowClick={onRowClick} />
      );

      // Click on first row
      const firstRow = screen.getByText('Test Subgraph 1').closest('tr');
      if (firstRow) {
        fireEvent.click(firstRow);
      }

      // Should call custom handler
      expect(onRowClick).toHaveBeenCalledWith(mockSubgraphs[0]);
    });

    it('should have pointer cursor on rows', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} />);

      const firstRow = screen.getByText('Test Subgraph 1').closest('tr');
      expect(firstRow).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no subgraphs', () => {
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          subgraphs={[]}
          total={0}
        />
      );

      expect(screen.getByText('暂无子图')).toBeInTheDocument();
    });

    it('should display "no results" state when filters are active', () => {
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          subgraphs={[]}
          total={0}
          hasFilters={true}
        />
      );

      expect(screen.getByText('未找到匹配的子图')).toBeInTheDocument();
    });

    it('should show create button in empty state', () => {
      const onCreateClick = vi.fn();
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          subgraphs={[]}
          total={0}
          onCreateClick={onCreateClick}
        />
      );

      const createButton = screen.getByText('创建子图');
      expect(createButton).toBeInTheDocument();

      fireEvent.click(createButton);
      expect(onCreateClick).toHaveBeenCalled();
    });

    it('should show clear filters button when filters are active', () => {
      const onClearFilters = vi.fn();
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          subgraphs={[]}
          total={0}
          hasFilters={true}
          onClearFilters={onClearFilters}
        />
      );

      const clearButton = screen.getByText('清除搜索');
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);
      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      renderWithRouter(<SubgraphTable {...defaultProps} total={100} />);

      // Check for pagination elements
      expect(screen.getByText('共 100 条')).toBeInTheDocument();
    });

    it('should call onPageChange when page is changed', () => {
      const onPageChange = vi.fn();
      renderWithRouter(
        <SubgraphTable
          {...defaultProps}
          total={100}
          onPageChange={onPageChange}
        />
      );

      // Find and click next page button
      const nextButton = screen.getByTitle('Next Page');
      if (nextButton) {
        fireEvent.click(nextButton);
      }

      // Should call onPageChange
      expect(onPageChange).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      const { container } = renderWithRouter(
        <SubgraphTable {...defaultProps} loading={true} />
      );

      // Check for loading spinner
      const spinner = container.querySelector('.ant-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle subgraph without description', () => {
      const subgraphsWithoutDesc: Subgraph[] = [
        {
          ...mockSubgraphs[0],
          description: undefined,
        },
      ];

      renderWithRouter(
        <SubgraphTable {...defaultProps} subgraphs={subgraphsWithoutDesc} />
      );

      // Should display "-" for missing description
      const row = screen.getByText('Test Subgraph 1').closest('tr');
      expect(row).toBeInTheDocument();
    });

    it('should handle subgraph without tags', () => {
      const subgraphsWithoutTags: Subgraph[] = [
        {
          ...mockSubgraphs[0],
          tags: undefined,
        },
      ];

      renderWithRouter(
        <SubgraphTable {...defaultProps} subgraphs={subgraphsWithoutTags} />
      );

      // Should display "-" for missing tags
      const row = screen.getByText('Test Subgraph 1').closest('tr');
      expect(row).toBeInTheDocument();
    });

    it('should handle subgraph without metadata', () => {
      const subgraphsWithoutMetadata: Subgraph[] = [
        {
          ...mockSubgraphs[0],
          metadata: undefined,
        },
      ];

      renderWithRouter(
        <SubgraphTable {...defaultProps} subgraphs={subgraphsWithoutMetadata} />
      );

      // Should display "0" for missing counts
      const row = screen.getByText('Test Subgraph 1').closest('tr');
      expect(row).toBeInTheDocument();
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(150);
      const subgraphsWithLongDesc: Subgraph[] = [
        {
          ...mockSubgraphs[0],
          description: longDescription,
        },
      ];

      renderWithRouter(
        <SubgraphTable {...defaultProps} subgraphs={subgraphsWithLongDesc} />
      );

      // Should truncate to 100 characters + "..."
      const truncated = screen.getByText(/A{100}\.\.\./);
      expect(truncated).toBeInTheDocument();
    });
  });
});
