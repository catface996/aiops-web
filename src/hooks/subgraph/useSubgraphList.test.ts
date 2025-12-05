/**
 * useSubgraphList Hook Unit Tests
 * 
 * Tests for the useSubgraphList custom hook.
 * Validates state management and method calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSubgraphList } from './useSubgraphList';
import SubgraphService from '@/services/subgraph';
import CacheService from '@/services/cache';
import type { SubgraphListResponse } from '@/types/subgraph';

// Mock dependencies
vi.mock('@/services/subgraph');
vi.mock('@/services/cache');
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useSubgraphList', () => {
  // Mock data
  const mockSubgraphs: SubgraphListResponse = {
    items: [
      {
        id: 1,
        name: 'Subgraph A',
        description: 'Test subgraph A',
        tags: ['tag1', 'tag2'],
        metadata: {},
        createdBy: 1,
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
        version: 1,
      },
      {
        id: 2,
        name: 'Subgraph B',
        description: 'Test subgraph B',
        tags: ['tag2', 'tag3'],
        metadata: {},
        createdBy: 2,
        createdAt: '2024-12-02T10:00:00Z',
        updatedAt: '2024-12-02T10:00:00Z',
        version: 1,
      },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(CacheService.get).mockReturnValue(null);
    vi.mocked(CacheService.set).mockImplementation(() => {});
    vi.mocked(CacheService.invalidatePattern).mockImplementation(() => {});
    vi.mocked(SubgraphService.listSubgraphs).mockResolvedValue(mockSubgraphs);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useSubgraphList());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subgraphs).toEqual(mockSubgraphs.items);
      expect(result.current.total).toBe(2);
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.keyword).toBe('');
      expect(result.current.selectedTags).toEqual([]);
      expect(result.current.selectedOwnerId).toBe(null);
      expect(result.current.sortBy).toBe('updatedAt');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('fetchSubgraphs', () => {
    it('should fetch subgraphs from API when cache is empty', async () => {
      const { result } = renderHook(() => useSubgraphList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith({
        keyword: undefined,
        tags: undefined,
        ownerId: undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20,
      });

      expect(result.current.subgraphs).toEqual(mockSubgraphs.items);
      expect(result.current.total).toBe(2);
    });

    it('should use cached data when available', async () => {
      vi.mocked(CacheService.get).mockReturnValue({
        items: mockSubgraphs.items,
        total: mockSubgraphs.total,
      });

      const { result } = renderHook(() => useSubgraphList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(SubgraphService.listSubgraphs).not.toHaveBeenCalled();
      expect(result.current.subgraphs).toEqual(mockSubgraphs.items);
      expect(result.current.total).toBe(2);
    });

    it('should cache API response with 5-minute TTL', async () => {
      const { result } = renderHook(() => useSubgraphList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(CacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('subgraph:list'),
        {
          items: mockSubgraphs.items,
          total: mockSubgraphs.total,
        },
        5 * 60 * 1000 // 5 minutes
      );
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      vi.mocked(SubgraphService.listSubgraphs).mockRejectedValue(error);

      const { result } = renderHook(() => useSubgraphList());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subgraphs).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should set loading state correctly during fetch', async () => {
      const { result } = renderHook(() => useSubgraphList());

      // Initially loading should be true (triggered by useEffect)
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // After fetch completes, loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('handleSearch', () => {
    it('should update keyword and reset page to 1', async () => {
      const { result } = renderHook(() => useSubgraphList());

      // Wait for initial fetch
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSearch('test keyword');
      });

      // State should update immediately
      expect(result.current.keyword).toBe('test keyword');
      expect(result.current.page).toBe(1);
    });

    it('should debounce search by 300ms', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleSearch('test');
      });

      // Should not call API immediately (debounced)
      expect(SubgraphService.listSubgraphs).not.toHaveBeenCalled();

      // Wait for debounce to complete (300ms + buffer)
      await waitFor(
        () => {
          expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
            expect.objectContaining({
              keyword: 'test',
            })
          );
        },
        { timeout: 1000 }
      );
    });

    it('should cancel previous debounced search when new search is triggered', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      // Trigger multiple searches in quick succession
      act(() => {
        result.current.handleSearch('test1');
        result.current.handleSearch('test2');
        result.current.handleSearch('test3');
      });

      // Wait for debounce to complete
      await waitFor(
        () => {
          expect(SubgraphService.listSubgraphs).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      // Should only call once with the latest keyword
      expect(SubgraphService.listSubgraphs).toHaveBeenCalledTimes(1);
      expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'test3',
        })
      );
    });
  });

  describe('handleFilterChange', () => {
    it('should update tags filter and reset page to 1', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleFilterChange({ tags: ['tag1', 'tag2'] });
      });

      expect(result.current.selectedTags).toEqual(['tag1', 'tag2']);
      expect(result.current.page).toBe(1);
    });

    it('should update owner filter and reset page to 1', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleFilterChange({ ownerId: 123 });
      });

      expect(result.current.selectedOwnerId).toBe(123);
      expect(result.current.page).toBe(1);
    });

    it('should update both filters simultaneously', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleFilterChange({
          tags: ['tag1'],
          ownerId: 456,
        });
      });

      expect(result.current.selectedTags).toEqual(['tag1']);
      expect(result.current.selectedOwnerId).toBe(456);
      expect(result.current.page).toBe(1);
    });

    it('should trigger API call with updated filters', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleFilterChange({ tags: ['tag1'] });
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['tag1'],
          })
        );
      });
    });
  });

  describe('handlePageChange', () => {
    it('should update page and pageSize', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handlePageChange(2, 50);
      });

      expect(result.current.page).toBe(2);
      expect(result.current.pageSize).toBe(50);
    });

    it('should trigger API call with new pagination', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handlePageChange(3, 10);
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 3,
            pageSize: 10,
          })
        );
      });
    });
  });

  describe('handleSortChange', () => {
    it('should update sortBy and sortOrder', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleSortChange('name', 'asc');
      });

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should trigger API call with new sort parameters', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleSortChange('createdAt', 'asc');
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'createdAt',
            sortOrder: 'asc',
          })
        );
      });
    });
  });

  describe('refetch', () => {
    it('should invalidate cache and fetch fresh data', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      await act(async () => {
        await result.current.refetch();
      });

      expect(CacheService.invalidatePattern).toHaveBeenCalledWith('subgraph:list');
      expect(SubgraphService.listSubgraphs).toHaveBeenCalled();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple state changes correctly', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleSearch('test');
        result.current.handleFilterChange({ tags: ['tag1'] });
        result.current.handleSortChange('name', 'asc');
      });

      expect(result.current.keyword).toBe('test');
      expect(result.current.selectedTags).toEqual(['tag1']);
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should build correct query with all parameters', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleSearch('search term');
        result.current.handleFilterChange({
          tags: ['tag1', 'tag2'],
          ownerId: 789,
        });
        result.current.handleSortChange('name', 'asc');
        result.current.handlePageChange(2, 50);
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith({
          keyword: 'search term',
          tags: ['tag1', 'tag2'],
          ownerId: 789,
          sortBy: 'name',
          sortOrder: 'asc',
          page: 2,
          pageSize: 50,
        });
      });
    });

    it('should generate unique cache keys for different queries', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const firstCacheKey = vi.mocked(CacheService.set).mock.calls[0]?.[0];

      vi.clearAllMocks();

      act(() => {
        result.current.handleSearch('different');
      });

      await waitFor(() => {
        expect(CacheService.set).toHaveBeenCalled();
      });

      const secondCacheKey = vi.mocked(CacheService.set).mock.calls[0]?.[0];

      expect(firstCacheKey).not.toBe(secondCacheKey);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search keyword', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      // First set a keyword
      act(() => {
        result.current.handleSearch('test');
      });

      await waitFor(() => expect(result.current.keyword).toBe('test'));

      vi.clearAllMocks();

      // Then clear it
      act(() => {
        result.current.handleSearch('');
      });

      // Empty keyword should trigger immediate fetch (not debounced)
      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            keyword: undefined,
          })
        );
      });
    });

    it('should handle empty tags array', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.clearAllMocks();

      act(() => {
        result.current.handleFilterChange({ tags: [] });
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: undefined,
          })
        );
      });
    });

    it('should handle null ownerId', async () => {
      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.handleFilterChange({ ownerId: 123 });
      });

      vi.clearAllMocks();

      act(() => {
        result.current.handleFilterChange({ ownerId: null });
      });

      await waitFor(() => {
        expect(SubgraphService.listSubgraphs).toHaveBeenCalledWith(
          expect.objectContaining({
            ownerId: undefined,
          })
        );
      });
    });

    it('should handle empty API response', async () => {
      vi.mocked(SubgraphService.listSubgraphs).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

      const { result } = renderHook(() => useSubgraphList());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.subgraphs).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });
});
