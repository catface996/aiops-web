/**
 * useSubgraphDetail Hook Unit Tests
 * 
 * Tests for the useSubgraphDetail custom hook.
 * Validates REQ-FR-021, REQ-FR-024, REQ-FR-025, REQ-FR-028, REQ-FR-032, REQ-NFR-029-E
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSubgraphDetail } from './useSubgraphDetail';
import SubgraphService from '@/services/subgraph';
import CacheService from '@/services/cache';
import type { SubgraphDetail, TopologyData } from '@/types/subgraph';

// Mock dependencies
vi.mock('@/services/subgraph');
vi.mock('@/services/cache');
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

describe('useSubgraphDetail', () => {
  // Mock data
  const mockSubgraphId = 1;
  const mockSubgraphDetail: SubgraphDetail = {
    id: 1,
    name: 'Test Subgraph',
    description: 'Test description',
    tags: ['test', 'demo'],
    metadata: { env: 'test' },
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    version: 1,
    owners: [
      { userId: 1, username: 'owner1', email: 'owner1@test.com' },
    ],
    viewers: [
      { userId: 2, username: 'viewer1', email: 'viewer1@test.com' },
    ],
    resources: [
      {
        resourceId: 1,
        name: 'Resource 1',
        type: 'server',
        status: 'active',
        addedAt: '2024-01-01T00:00:00Z',
        addedBy: 1,
      },
    ],
    resourceCount: 1,
  };

  const mockTopologyData: TopologyData = {
    nodes: [
      { id: 1, name: 'Node 1', type: 'server', status: 'active' },
      { id: 2, name: 'Node 2', type: 'database', status: 'active' },
    ],
    edges: [
      { source: 1, target: 2, type: 'connects_to' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(CacheService.get).mockReturnValue(null);
    vi.mocked(CacheService.set).mockImplementation(() => {});
    vi.mocked(CacheService.invalidate).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);
      
      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subgraph).toEqual(mockSubgraphDetail);
      expect(result.current.resources).toEqual([]);
      expect(result.current.resourcesLoading).toBe(false);
      expect(result.current.topologyData).toBeNull();
      expect(result.current.topologyLoading).toBe(false);
      expect(result.current.permissions).toEqual([]);
      expect(result.current.permissionsLoading).toBe(false);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      expect(typeof result.current.fetchDetail).toBe('function');
      expect(typeof result.current.fetchResources).toBe('function');
      expect(typeof result.current.fetchTopology).toBe('function');
      expect(typeof result.current.fetchPermissions).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.refetchAll).toBe('function');
    });
  });

  describe('fetchDetail - REQ-FR-021, REQ-FR-024', () => {
    it('should fetch subgraph detail from API when cache is empty', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(SubgraphService.getSubgraphDetail).toHaveBeenCalledWith(mockSubgraphId);
      expect(result.current.subgraph).toEqual(mockSubgraphDetail);
      expect(CacheService.set).toHaveBeenCalled();
    });

    it('should use cached data when available - REQ-NFR-029-E', async () => {
      vi.mocked(CacheService.get).mockReturnValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(CacheService.get).toHaveBeenCalled();
      expect(SubgraphService.getSubgraphDetail).not.toHaveBeenCalled();
      expect(result.current.subgraph).toEqual(mockSubgraphDetail);
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSubgraphDetail), 100))
      );

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Should finish loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const error = new Error('Network error');
      vi.mocked(SubgraphService.getSubgraphDetail).mockRejectedValue(error);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subgraph).toBeNull();
    });
  });

  describe('fetchResources - REQ-FR-025', () => {
    it('should fetch resources from API when cache is empty', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.fetchResources();

      await waitFor(() => {
        expect(result.current.resourcesLoading).toBe(false);
      });

      expect(result.current.resources).toEqual(mockSubgraphDetail.resources);
      expect(CacheService.set).toHaveBeenCalled();
    });

    it('should use cached resources when available - REQ-NFR-029-E', async () => {
      // Mock cache to return resources when requested
      vi.mocked(CacheService.get).mockImplementation((key) => {
        const keyStr = String(key);
        if (keyStr.includes('resources')) {
          return mockSubgraphDetail.resources;
        }
        // Return mockSubgraphDetail for detail cache
        if (keyStr.includes('detail')) {
          return mockSubgraphDetail;
        }
        return null;
      });

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch to complete (should use cache)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.fetchResources();

      await waitFor(() => {
        expect(result.current.resourcesLoading).toBe(false);
      });

      expect(result.current.resources).toEqual(mockSubgraphDetail.resources);
      // Cache should be used for resources
      expect(CacheService.get).toHaveBeenCalled();
    });

    it('should handle empty resources list', async () => {
      const emptyDetail = { ...mockSubgraphDetail, resources: [] };
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(emptyDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.fetchResources();

      await waitFor(() => {
        expect(result.current.resourcesLoading).toBe(false);
      });

      expect(result.current.resources).toEqual([]);
    });
  });

  describe('fetchTopology - REQ-FR-028', () => {
    it('should fetch topology data from API when cache is empty', async () => {
      vi.mocked(SubgraphService.getTopology).mockResolvedValue(mockTopologyData);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.fetchTopology();

      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(false);
      });

      expect(SubgraphService.getTopology).toHaveBeenCalledWith(mockSubgraphId);
      expect(result.current.topologyData).toEqual(mockTopologyData);
      expect(CacheService.set).toHaveBeenCalled();
    });

    it('should use cached topology when available - REQ-NFR-029-E', async () => {
      // Mock cache to return topology when requested
      vi.mocked(CacheService.get).mockImplementation((key) => {
        const keyStr = String(key);
        if (keyStr.includes('topology')) {
          return mockTopologyData;
        }
        // Return mockSubgraphDetail for detail cache
        if (keyStr.includes('detail')) {
          return mockSubgraphDetail;
        }
        return null;
      });

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.fetchTopology();

      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(false);
      });

      // Should use cache
      expect(result.current.topologyData).toEqual(mockTopologyData);
      expect(CacheService.get).toHaveBeenCalled();
    });

    it('should handle topology fetch errors', async () => {
      const error = new Error('Topology error');
      vi.mocked(SubgraphService.getTopology).mockRejectedValue(error);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.fetchTopology();

      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(false);
      });

      expect(result.current.topologyData).toBeNull();
    });
  });

  describe('fetchPermissions - REQ-FR-032', () => {
    it('should fetch and convert permissions from detail', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.fetchPermissions();

      await waitFor(() => {
        expect(result.current.permissionsLoading).toBe(false);
      });

      expect(result.current.permissions).toHaveLength(2);
      expect(result.current.permissions[0].role).toBe('OWNER');
      expect(result.current.permissions[1].role).toBe('VIEWER');
    });

    it('should use cached permissions when available - REQ-NFR-029-E', async () => {
      const mockPermissions = [
        {
          userId: 1,
          role: 'OWNER' as const,
          grantedAt: '2024-01-01T00:00:00Z',
          grantedBy: 1,
        },
        {
          userId: 2,
          role: 'VIEWER' as const,
          grantedAt: '2024-01-01T00:00:00Z',
          grantedBy: 1,
        },
      ];

      // Mock cache to return permissions when requested
      vi.mocked(CacheService.get).mockImplementation((key) => {
        const keyStr = String(key);
        if (keyStr.includes('permissions')) {
          return mockPermissions;
        }
        // Return mockSubgraphDetail for detail cache
        if (keyStr.includes('detail')) {
          return mockSubgraphDetail;
        }
        return null;
      });

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch to complete (should use cache)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.fetchPermissions();

      await waitFor(() => {
        expect(result.current.permissionsLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual(mockPermissions);
      // Cache should be used for permissions
      expect(CacheService.get).toHaveBeenCalled();
    });
  });

  describe('refetch - REQ-NFR-029-F', () => {
    it('should invalidate cache and refetch detail', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(CacheService.invalidate).toHaveBeenCalled();
      expect(SubgraphService.getSubgraphDetail).toHaveBeenCalled();
    });
  });

  describe('refetchAll - REQ-NFR-029-F', () => {
    it('should invalidate all caches and refetch all data', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);
      vi.mocked(SubgraphService.getTopology).mockResolvedValue(mockTopologyData);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await result.current.refetchAll();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.resourcesLoading).toBe(false);
        expect(result.current.topologyLoading).toBe(false);
        expect(result.current.permissionsLoading).toBe(false);
      });

      expect(CacheService.invalidate).toHaveBeenCalledTimes(4);
      expect(SubgraphService.getSubgraphDetail).toHaveBeenCalled();
      expect(SubgraphService.getTopology).toHaveBeenCalled();
    });
  });

  describe('Auto-fetch on mount', () => {
    it('should automatically fetch detail when hook is mounted', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(SubgraphService.getSubgraphDetail).toHaveBeenCalledWith(mockSubgraphId);
      expect(result.current.subgraph).toEqual(mockSubgraphDetail);
    });

    it('should refetch when subgraphId changes', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result, rerender } = renderHook(
        ({ id }) => useSubgraphDetail(id),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(SubgraphService.getSubgraphDetail).toHaveBeenCalledWith(1);

      // Change subgraphId
      rerender({ id: 2 });

      await waitFor(() => {
        expect(SubgraphService.getSubgraphDetail).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('Independent loading states', () => {
    it('should manage independent loading states for each data type', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);
      
      let resolveTopology: (value: TopologyData) => void;
      const topologyPromise = new Promise<TopologyData>((resolve) => {
        resolveTopology = resolve;
      });
      vi.mocked(SubgraphService.getTopology).mockReturnValue(topologyPromise);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for initial detail fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start fetching topology
      const fetchPromise = result.current.fetchTopology();

      // Check that topology is loading but detail is not
      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(true);
      }, { timeout: 100 });
      
      expect(result.current.loading).toBe(false);

      // Resolve topology
      resolveTopology!(mockTopologyData);
      await fetchPromise;

      // Wait for topology to finish
      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(false);
      });
    });
  });

  describe('Cache TTL - REQ-NFR-029-E', () => {
    it('should cache detail with 2-minute TTL', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify cache.set was called
      expect(CacheService.set).toHaveBeenCalled();
      
      // Find the call with detail data and verify TTL
      const calls = vi.mocked(CacheService.set).mock.calls;
      const detailCall = calls.find(call => call[1] === mockSubgraphDetail);
      
      expect(detailCall).toBeDefined();
      expect(detailCall![2]).toBe(2 * 60 * 1000); // 2 minutes
    });

    it('should cache topology with 2-minute TTL', async () => {
      vi.mocked(SubgraphService.getSubgraphDetail).mockResolvedValue(mockSubgraphDetail);
      vi.mocked(SubgraphService.getTopology).mockResolvedValue(mockTopologyData);

      const { result } = renderHook(() => useSubgraphDetail(mockSubgraphId));

      // Wait for auto-fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.fetchTopology();

      await waitFor(() => {
        expect(result.current.topologyLoading).toBe(false);
      });

      // Verify cache.set was called with topology data
      const calls = vi.mocked(CacheService.set).mock.calls;
      const topologyCall = calls.find(call => call[1] === mockTopologyData);
      
      expect(topologyCall).toBeDefined();
      expect(topologyCall![2]).toBe(2 * 60 * 1000); // 2 minutes
    });
  });
});
