/**
 * Subgraph Service
 * 
 * This service handles all API calls related to subgraph management.
 * Implements REQ-FR-005, REQ-FR-010, REQ-FR-043, REQ-FR-053, REQ-FR-065, REQ-FR-075, REQ-NFR-027
 */

import request from '@/utils/request';
import type {
  Subgraph,
  SubgraphDetail,
  SubgraphListResponse,
  SubgraphListQuery,
  CreateSubgraphRequest,
  UpdateSubgraphRequest,
  AddResourcesRequest,
  RemoveResourcesRequest,
  UpdatePermissionsRequest,
  ResourceInfo,
} from '@/types/subgraph';
import type { TopologyData } from '@/types/topology';

class SubgraphService {
  /**
   * List subgraphs with query parameters
   * REQ-FR-010: Fetch subgraph list from API
   */
  async listSubgraphs(query: SubgraphListQuery): Promise<SubgraphListResponse> {
    const params: Record<string, unknown> = {
      page: query.page,
      pageSize: query.pageSize,
    };

    if (query.keyword) {
      params.keyword = query.keyword;
    }

    if (query.tags && query.tags.length > 0) {
      params.tags = query.tags.join(',');
    }

    if (query.ownerId) {
      params.ownerId = query.ownerId;
    }

    if (query.sortBy) {
      params.sortBy = query.sortBy;
    }

    if (query.sortOrder) {
      params.sortOrder = query.sortOrder;
    }

    // Backend returns Spring pagination format: { content, page, size, totalElements, totalPages }
    // Frontend expects: { items, page, pageSize, total }
    interface BackendPageResponse {
      content: Subgraph[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
    }
    const response = await request.get<{ data: BackendPageResponse }>('/subgraphs', { params });
    const backendData = response.data.data;

    // Map backend response to frontend format
    return {
      items: backendData.content || [],
      total: backendData.totalElements || 0,
      page: backendData.page || 1,
      pageSize: backendData.size || 20,
    };
  }

  /**
   * Get subgraph detail by ID
   * REQ-FR-021: Load subgraph detail
   */
  async getSubgraphDetail(id: number): Promise<SubgraphDetail> {
    // Backend returns permissions array, frontend expects owners/viewers arrays
    interface BackendSubgraphDetail {
      id: number;
      name: string;
      description: string | null;
      tags: string[];
      metadata: Record<string, string>;
      createdBy: number;
      createdAt: string;
      updatedAt: string;
      version: number;
      permissions: Array<{
        id: number;
        subgraphId: number;
        userId: number;
        role: 'OWNER' | 'VIEWER';
        grantedAt: string;
        grantedBy: number;
      }>;
      resourceIds: number[];
      resourceCount: number;
    }

    const response = await request.get<{ data: BackendSubgraphDetail }>(`/subgraphs/${id}`);
    const backendData = response.data.data;

    // Convert permissions to owners/viewers arrays
    const permissions = backendData.permissions || [];
    const owners = permissions
      .filter(p => p.role === 'OWNER')
      .map(p => ({
        userId: p.userId,
        username: `用户${p.userId}`, // Placeholder, ideally fetch from user service
        email: `user${p.userId}@example.com`, // Placeholder
      }));
    const viewers = permissions
      .filter(p => p.role === 'VIEWER')
      .map(p => ({
        userId: p.userId,
        username: `用户${p.userId}`,
        email: `user${p.userId}@example.com`,
      }));

    return {
      ...backendData,
      description: backendData.description || '',
      owners,
      viewers,
      resources: [], // Resources loaded separately
    };
  }

  /**
   * Create a new subgraph
   * REQ-FR-005: Submit creation request
   */
  async createSubgraph(data: CreateSubgraphRequest): Promise<Subgraph> {
    const response = await request.post<{ data: Subgraph }>('/subgraphs', data);
    return response.data.data;
  }

  /**
   * Update an existing subgraph
   * REQ-FR-043: Submit update request with version for optimistic locking
   */
  async updateSubgraph(id: number, data: UpdateSubgraphRequest): Promise<Subgraph> {
    const response = await request.put<{ data: Subgraph }>(`/subgraphs/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a subgraph
   * REQ-FR-053: Execute delete operation
   */
  async deleteSubgraph(id: number): Promise<void> {
    await request.delete(`/subgraphs/${id}`);
  }

  /**
   * Get resources list for a subgraph
   * REQ-FR-025: Load resource nodes for subgraph
   */
  async getResources(id: number): Promise<ResourceInfo[]> {
    // Backend returns: { content: ResourceInfo[], totalElements: number, ... }
    interface BackendResourceResponse {
      content: Array<{
        id: number;
        resourceId: number;
        subgraphId: number;
        resourceName: string;
        resourceType: string;
        resourceStatus: string;
        addedAt: string;
        addedBy: number;
      }>;
      totalElements: number;
    }

    const response = await request.get<{ data: BackendResourceResponse }>(
      `/subgraphs/${id}/resources`
    );
    const backendData = response.data.data;

    // Map backend response to frontend ResourceInfo format
    return (backendData.content || []).map((item) => ({
      resourceId: item.resourceId,
      name: item.resourceName,
      type: item.resourceType,
      status: item.resourceStatus,
      addedAt: item.addedAt,
      addedBy: item.addedBy,
    }));
  }

  /**
   * Add resources to a subgraph
   * REQ-FR-065: Submit add resources request
   */
  async addResources(id: number, resourceIds: number[]): Promise<void> {
    const data: AddResourcesRequest = { resourceIds };
    await request.post(`/subgraphs/${id}/resources`, data);
  }

  /**
   * Remove resources from a subgraph
   * REQ-FR-075: Execute remove resources operation
   */
  async removeResources(id: number, resourceIds: number[]): Promise<void> {
    const data: RemoveResourcesRequest = { resourceIds };
    await request.delete(`/subgraphs/${id}/resources`, { data });
  }

  /**
   * Get topology data for a subgraph
   * REQ-FR-028: Load topology data
   * Uses the new resources-with-relations API for complete data in one request
   */
  async getTopology(id: number): Promise<TopologyData> {
    // Backend returns complete resources and relationships data
    interface BackendResourceWithRelationsResponse {
      subgraphId: number;
      subgraphName: string;
      resources: Array<{
        id: number;
        resourceId: number;
        subgraphId: number;
        resourceName: string;
        resourceType: string;
        resourceStatus: string;
        addedAt: string;
        addedBy: number;
      }>;
      relationships: Array<{
        id: number;
        sourceResourceId: number;
        sourceResourceName: string;
        targetResourceId: number;
        targetResourceName: string;
        relationshipType: string;
        relationshipTypeDesc: string;
        direction: string;
        directionDesc: string;
        strength: string;
        strengthDesc: string;
        status: string;
        statusDesc: string;
        description: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      nodeCount: number;
      edgeCount: number;
    }

    const response = await request.get<{ data: BackendResourceWithRelationsResponse }>(
      `/subgraphs/${id}/resources-with-relations`
    );
    const backendData = response.data.data;

    // Generate positions in a grid layout for visualization
    const gridColumns = 4;
    const nodeSpacingX = 200;
    const nodeSpacingY = 120;
    const startX = 50;
    const startY = 50;

    return {
      nodes: (backendData.resources || []).map((resource, index) => ({
        id: String(resource.resourceId),
        resourceId: resource.resourceId,
        name: resource.resourceName,
        type: resource.resourceType,
        typeCode: resource.resourceType,
        status: resource.resourceStatus,
        // Generate grid positions for nodes
        position: {
          x: startX + (index % gridColumns) * nodeSpacingX,
          y: startY + Math.floor(index / gridColumns) * nodeSpacingY,
        },
      })),
      edges: (backendData.relationships || []).map((rel) => ({
        id: `edge-${rel.id}`,
        relationId: rel.id,
        source: String(rel.sourceResourceId),
        target: String(rel.targetResourceId),
        sourceAnchor: 'bottom' as const,
        targetAnchor: 'top' as const,
        relationType: (rel.relationshipType || 'ASSOCIATION') as 'DEPENDENCY' | 'CALL' | 'DEPLOYMENT' | 'OWNERSHIP' | 'ASSOCIATION',
        direction: (rel.direction || 'UNIDIRECTIONAL') as 'UNIDIRECTIONAL' | 'BIDIRECTIONAL',
        strength: (rel.strength || 'WEAK') as 'STRONG' | 'WEAK',
        status: (rel.status || 'NORMAL') as 'NORMAL' | 'ABNORMAL',
        label: rel.relationshipTypeDesc,
      })),
    };
  }

  /**
   * Update subgraph permissions
   * REQ-FR-039, REQ-FR-040, REQ-FR-041: Manage owners and viewers
   */
  async updatePermissions(id: number, data: UpdatePermissionsRequest): Promise<void> {
    await request.put(`/subgraphs/${id}/permissions`, data);
  }

  /**
   * Check if a subgraph name is unique
   * REQ-FR-004: Async name uniqueness validation
   * 
   * @param name - The name to check
   * @param excludeId - Optional ID to exclude from check (for edit scenarios)
   * @returns true if name is unique, false otherwise
   */
  async checkNameUnique(name: string, excludeId?: number): Promise<boolean> {
    try {
      const response = await this.listSubgraphs({
        keyword: name,
        page: 1,
        pageSize: 10,
      });

      // Check if any subgraph has exact name match
      const items = response.items || [];
      const exists = items.some(
        (s) => s.name === name && s.id !== excludeId
      );

      return !exists;
    } catch (error) {
      // On error, assume unique to avoid blocking user
      console.error('Error checking name uniqueness:', error);
      return true;
    }
  }
}

// Export singleton instance
export default new SubgraphService();
