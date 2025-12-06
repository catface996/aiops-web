/**
 * useSubgraphDetail Hook
 * 
 * Custom hook for managing subgraph detail state and operations.
 * Implements REQ-FR-021, REQ-FR-024, REQ-FR-025, REQ-FR-028, REQ-FR-032, REQ-NFR-029-E
 */

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import SubgraphService from '@/services/subgraph';
import CacheService, { CACHE_KEYS, CACHE_TTL } from '@/services/cache';
import type {
  SubgraphDetail,
  ResourceInfo,
  TopologyData,
  SubgraphPermission,
} from '@/types/subgraph';
import type { Position } from '@/types/topology';

/**
 * Hook state interface
 */
interface UseSubgraphDetailState {
  subgraph: SubgraphDetail | null;
  loading: boolean;
  resources: ResourceInfo[];
  resourcesLoading: boolean;
  topologyData: TopologyData | null;
  topologyLoading: boolean;
  permissions: SubgraphPermission[];
  permissionsLoading: boolean;
}

/**
 * Hook return interface
 */
export interface UseSubgraphDetailReturn extends UseSubgraphDetailState {
  fetchDetail: () => Promise<void>;
  fetchResources: () => Promise<void>;
  fetchTopology: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  updateNodePosition: (nodeId: string, position: Position) => void;
  refetch: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

/**
 * Custom hook for managing subgraph detail
 * 
 * Features:
 * - Fetch subgraph detail (REQ-FR-021)
 * - Fetch resource nodes (REQ-FR-025)
 * - Fetch topology data (REQ-FR-028)
 * - Fetch permissions (REQ-FR-032)
 * - Cache with 2-minute TTL (REQ-NFR-029-E)
 * - Independent loading states for each data type
 * 
 * @param subgraphId - The ID of the subgraph to fetch
 * @returns Hook state and methods
 */
export function useSubgraphDetail(subgraphId: number): UseSubgraphDetailReturn {
  // State management
  const [state, setState] = useState<UseSubgraphDetailState>({
    subgraph: null,
    loading: false,
    resources: [],
    resourcesLoading: false,
    topologyData: null,
    topologyLoading: false,
    permissions: [],
    permissionsLoading: false,
  });

  /**
   * Fetch subgraph detail
   * REQ-FR-021: Load subgraph detail
   * REQ-FR-024: Display basic information in Overview tab
   * REQ-NFR-029-E: Cache detail data for 2 minutes
   */
  const fetchDetail = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const cacheKey = CACHE_KEYS.SUBGRAPH_DETAIL(subgraphId);

      // Try to get from cache first
      const cachedData = CacheService.get<SubgraphDetail>(cacheKey);

      if (cachedData) {
        setState((prev) => ({
          ...prev,
          subgraph: cachedData,
          loading: false,
        }));
        return;
      }

      // Fetch from API if not in cache
      const data = await SubgraphService.getSubgraphDetail(subgraphId);

      // Cache the response
      CacheService.set(cacheKey, data, CACHE_TTL.DETAIL);

      setState((prev) => ({
        ...prev,
        subgraph: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching subgraph detail:', error);
      message.error('Failed to load subgraph detail');
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [subgraphId]);

  /**
   * Fetch resource nodes
   * REQ-FR-025: Display resource nodes in Resource Nodes tab
   * REQ-NFR-029-E: Cache resources data for 2 minutes
   */
  const fetchResources = useCallback(async () => {
    setState((prev) => ({ ...prev, resourcesLoading: true }));

    try {
      const cacheKey = CACHE_KEYS.SUBGRAPH_RESOURCES(subgraphId);

      // Try to get from cache first
      const cachedData = CacheService.get<ResourceInfo[]>(cacheKey);

      if (cachedData) {
        setState((prev) => ({
          ...prev,
          resources: cachedData,
          resourcesLoading: false,
        }));
        return;
      }

      // Fetch from dedicated resources API
      const resources = await SubgraphService.getResources(subgraphId);

      // Cache the response
      CacheService.set(cacheKey, resources, CACHE_TTL.RESOURCES);

      setState((prev) => ({
        ...prev,
        resources,
        resourcesLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching resources:', error);
      message.error('Failed to load resource nodes');
      setState((prev) => ({ ...prev, resourcesLoading: false }));
    }
  }, [subgraphId]);

  /**
   * Apply saved positions from localStorage to topology nodes
   */
  const applySavedPositions = useCallback((data: TopologyData): TopologyData => {
    const storageKey = `subgraph-topology-positions-${subgraphId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const positions = JSON.parse(saved) as Record<string, Position>;
        const nodesWithPositions = data.nodes.map((node) => {
          if (positions[node.id]) {
            return { ...node, position: positions[node.id] };
          }
          return node;
        });
        return { ...data, nodes: nodesWithPositions };
      }
    } catch (e) {
      console.error('Failed to load saved positions:', e);
    }
    return data;
  }, [subgraphId]);

  /**
   * Fetch topology data
   * REQ-FR-028: Load topology data for visualization
   * REQ-NFR-029-E: Cache topology data for 2 minutes
   */
  const fetchTopology = useCallback(async () => {
    setState((prev) => ({ ...prev, topologyLoading: true }));

    try {
      const cacheKey = CACHE_KEYS.SUBGRAPH_TOPOLOGY(subgraphId);

      // Try to get from cache first
      const cachedData = CacheService.get<TopologyData>(cacheKey);

      if (cachedData) {
        // Apply saved positions from localStorage
        const dataWithPositions = applySavedPositions(cachedData);
        setState((prev) => ({
          ...prev,
          topologyData: dataWithPositions,
          topologyLoading: false,
        }));
        return;
      }

      // Fetch from API if not in cache
      const data = await SubgraphService.getTopology(subgraphId);

      // Cache the response
      CacheService.set(cacheKey, data, CACHE_TTL.TOPOLOGY);

      // Apply saved positions from localStorage
      const dataWithPositions = applySavedPositions(data);

      setState((prev) => ({
        ...prev,
        topologyData: dataWithPositions,
        topologyLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching topology:', error);
      message.error('Failed to load topology data');
      setState((prev) => ({ ...prev, topologyLoading: false }));
    }
  }, [subgraphId, applySavedPositions]);

  /**
   * Fetch permissions
   * REQ-FR-032: Display permissions in Permissions tab
   * REQ-NFR-029-E: Cache permissions data for 2 minutes
   */
  const fetchPermissions = useCallback(async () => {
    setState((prev) => ({ ...prev, permissionsLoading: true }));

    try {
      const cacheKey = CACHE_KEYS.SUBGRAPH_PERMISSIONS(subgraphId);

      // Try to get from cache first
      const cachedData = CacheService.get<SubgraphPermission[]>(cacheKey);

      if (cachedData) {
        setState((prev) => ({
          ...prev,
          permissions: cachedData,
          permissionsLoading: false,
        }));
        return;
      }

      // Fetch from API if not in cache
      // Note: Permissions are included in detail response (owners/viewers)
      // We convert them to SubgraphPermission format
      const detail = await SubgraphService.getSubgraphDetail(subgraphId);
      const permissions: SubgraphPermission[] = [
        ...(detail.owners || []).map((owner) => ({
          userId: owner.userId,
          role: 'OWNER' as const,
          grantedAt: detail.createdAt, // Placeholder
          grantedBy: detail.createdBy,
        })),
        ...(detail.viewers || []).map((viewer) => ({
          userId: viewer.userId,
          role: 'VIEWER' as const,
          grantedAt: detail.createdAt, // Placeholder
          grantedBy: detail.createdBy,
        })),
      ];

      // Cache the response
      CacheService.set(cacheKey, permissions, CACHE_TTL.PERMISSIONS);

      setState((prev) => ({
        ...prev,
        permissions,
        permissionsLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      message.error('Failed to load permissions');
      setState((prev) => ({ ...prev, permissionsLoading: false }));
    }
  }, [subgraphId]);

  /**
   * Update node position locally
   * This is for drag-and-drop interactions, positions are stored in localStorage
   */
  const updateNodePosition = useCallback((nodeId: string, position: Position) => {
    setState((prev) => {
      if (!prev.topologyData) return prev;

      const newNodes = prev.topologyData.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      );

      const newTopologyData = {
        ...prev.topologyData,
        nodes: newNodes,
      };

      // Save position to localStorage for persistence
      const storageKey = `subgraph-topology-positions-${subgraphId}`;
      try {
        const saved = localStorage.getItem(storageKey);
        const positions = saved ? JSON.parse(saved) : {};
        positions[nodeId] = position;
        localStorage.setItem(storageKey, JSON.stringify(positions));
      } catch (e) {
        console.error('Failed to save node position:', e);
      }

      return {
        ...prev,
        topologyData: newTopologyData,
      };
    });
  }, [subgraphId]);

  /**
   * Force refetch detail (bypass cache)
   * REQ-NFR-029-F: Cache invalidation on operations
   */
  const refetch = useCallback(async () => {
    // Invalidate detail cache
    CacheService.invalidate(CACHE_KEYS.SUBGRAPH_DETAIL(subgraphId));
    await fetchDetail();
  }, [subgraphId, fetchDetail]);

  /**
   * Force refetch all data (bypass cache)
   * REQ-NFR-029-F: Cache invalidation on operations
   */
  const refetchAll = useCallback(async () => {
    // Invalidate all caches for this subgraph
    CacheService.invalidate(CACHE_KEYS.SUBGRAPH_DETAIL(subgraphId));
    CacheService.invalidate(CACHE_KEYS.SUBGRAPH_RESOURCES(subgraphId));
    CacheService.invalidate(CACHE_KEYS.SUBGRAPH_TOPOLOGY(subgraphId));
    CacheService.invalidate(CACHE_KEYS.SUBGRAPH_PERMISSIONS(subgraphId));

    // Fetch all data
    await Promise.all([
      fetchDetail(),
      fetchResources(),
      fetchTopology(),
      fetchPermissions(),
    ]);
  }, [subgraphId, fetchDetail, fetchResources, fetchTopology, fetchPermissions]);

  /**
   * Fetch detail on mount and when subgraphId changes
   * REQ-FR-021: Load subgraph detail when page loads
   * REQ-NFR-002: Detail page load performance
   */
  useEffect(() => {
    if (subgraphId) {
      fetchDetail();
    }
  }, [subgraphId, fetchDetail]);

  return {
    ...state,
    fetchDetail,
    fetchResources,
    fetchTopology,
    fetchPermissions,
    updateNodePosition,
    refetch,
    refetchAll,
  };
}

export default useSubgraphDetail;
