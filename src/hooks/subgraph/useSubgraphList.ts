/**
 * useSubgraphList Hook
 * 
 * Custom hook for managing subgraph list state and operations.
 * Implements REQ-FR-009, REQ-FR-013, REQ-FR-015, REQ-FR-016, REQ-FR-017, REQ-NFR-029-D
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import SubgraphService from '@/services/subgraph';
import CacheService, { CACHE_KEYS, CACHE_TTL } from '@/services/cache';
import type { Subgraph, SubgraphListQuery } from '@/types/subgraph';

/**
 * Debounce utility function
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Hook state interface
 */
interface UseSubgraphListState {
  subgraphs: Subgraph[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  keyword: string;
  selectedTags: string[];
  selectedOwnerId: number | null;
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

/**
 * Hook return interface
 */
export interface UseSubgraphListReturn extends UseSubgraphListState {
  fetchSubgraphs: () => Promise<void>;
  handleSearch: (keyword: string) => void;
  handleFilterChange: (filters: {
    tags?: string[];
    ownerId?: number | null;
  }) => void;
  handlePageChange: (page: number, pageSize: number) => void;
  handleSortChange: (
    sortBy: 'createdAt' | 'updatedAt' | 'name',
    sortOrder: 'asc' | 'desc'
  ) => void;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing subgraph list
 * 
 * Features:
 * - Fetch subgraphs with query parameters
 * - Search with 300ms debounce (REQ-FR-013)
 * - Filter by tags and owner (REQ-FR-015, REQ-FR-016)
 * - Sort by multiple fields (REQ-FR-017)
 * - Pagination support (REQ-FR-012)
 * - Cache with 5-minute TTL (REQ-NFR-029-D)
 * 
 * @returns Hook state and methods
 */
export function useSubgraphList(): UseSubgraphListReturn {
  // State management
  const [state, setState] = useState<UseSubgraphListState>({
    subgraphs: [],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 20,
    keyword: '',
    selectedTags: [],
    selectedOwnerId: null,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  /**
   * Build query parameters from current state
   */
  const buildQuery = useCallback((): SubgraphListQuery => {
    return {
      keyword: state.keyword || undefined,
      tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
      ownerId: state.selectedOwnerId || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      page: state.page,
      pageSize: state.pageSize,
    };
  }, [
    state.keyword,
    state.selectedTags,
    state.selectedOwnerId,
    state.sortBy,
    state.sortOrder,
    state.page,
    state.pageSize,
  ]);

  /**
   * Generate cache key based on query parameters
   */
  const getCacheKey = useCallback((query: SubgraphListQuery): string => {
    const keyParts = [
      CACHE_KEYS.SUBGRAPH_LIST,
      query.keyword || '',
      query.tags?.join(',') || '',
      query.ownerId || '',
      query.sortBy || '',
      query.sortOrder || '',
      query.page,
      query.pageSize,
    ];
    return keyParts.join(':');
  }, []);

  /**
   * Fetch subgraphs from API or cache
   * REQ-FR-009: Load subgraph list
   * REQ-NFR-029-D: Cache list data for 5 minutes
   */
  const fetchSubgraphs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const query = buildQuery();
      const cacheKey = getCacheKey(query);

      // Try to get from cache first
      const cachedData = CacheService.get<{
        items: Subgraph[];
        total: number;
      }>(cacheKey);

      if (cachedData) {
        setState((prev) => ({
          ...prev,
          subgraphs: cachedData.items,
          total: cachedData.total,
          loading: false,
        }));
        return;
      }

      // Fetch from API if not in cache
      const response = await SubgraphService.listSubgraphs(query);

      // Cache the response
      CacheService.set(
        cacheKey,
        {
          items: response.items,
          total: response.total,
        },
        CACHE_TTL.LIST
      );

      setState((prev) => ({
        ...prev,
        subgraphs: response.items,
        total: response.total,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching subgraphs:', error);
      message.error('Failed to load subgraphs');
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [buildQuery, getCacheKey]);

  /**
   * Handle search with debounce
   * REQ-FR-013: Search with 300ms debounce
   * REQ-NFR-005: Search response performance
   */
  const debouncedFetch = useMemo(
    () =>
      debounce(() => {
        fetchSubgraphs();
      }, 300),
    [fetchSubgraphs]
  );

  const handleSearch = useCallback(
    (keyword: string) => {
      setState((prev) => ({
        ...prev,
        keyword,
        page: 1, // Reset to first page on search
      }));
      // Debounced fetch will be triggered by useEffect
    },
    []
  );

  /**
   * Handle filter changes
   * REQ-FR-015: Tag filter (AND logic)
   * REQ-FR-016: Owner filter (OR logic)
   */
  const handleFilterChange = useCallback(
    (filters: { tags?: string[]; ownerId?: number | null }) => {
      setState((prev) => ({
        ...prev,
        selectedTags: filters.tags !== undefined ? filters.tags : prev.selectedTags,
        selectedOwnerId:
          filters.ownerId !== undefined ? filters.ownerId : prev.selectedOwnerId,
        page: 1, // Reset to first page on filter change
      }));
    },
    []
  );

  /**
   * Handle pagination changes
   * REQ-FR-012: Table pagination
   */
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setState((prev) => ({
      ...prev,
      page,
      pageSize,
    }));
  }, []);

  /**
   * Handle sort changes
   * REQ-FR-017: Sorting functionality
   */
  const handleSortChange = useCallback(
    (
      sortBy: 'createdAt' | 'updatedAt' | 'name',
      sortOrder: 'asc' | 'desc'
    ) => {
      setState((prev) => ({
        ...prev,
        sortBy,
        sortOrder,
      }));
    },
    []
  );

  /**
   * Force refetch (bypass cache)
   * REQ-FR-020-B: List refresh functionality
   */
  const refetch = useCallback(async () => {
    // Invalidate cache
    CacheService.invalidatePattern(CACHE_KEYS.SUBGRAPH_LIST);
    await fetchSubgraphs();
  }, [fetchSubgraphs]);

  /**
   * Fetch subgraphs when query parameters change
   * Use debounced fetch for keyword changes, immediate fetch for others
   */
  useEffect(() => {
    if (state.keyword) {
      // Debounce search
      debouncedFetch();
    } else {
      // Immediate fetch for non-search changes
      fetchSubgraphs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.keyword,
    state.selectedTags,
    state.selectedOwnerId,
    state.sortBy,
    state.sortOrder,
    state.page,
    state.pageSize,
  ]);

  return {
    ...state,
    fetchSubgraphs,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    refetch,
  };
}

export default useSubgraphList;
