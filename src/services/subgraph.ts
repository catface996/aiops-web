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
  TopologyData,
} from '@/types/subgraph';

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

    const response = await request.get<SubgraphListResponse>('/subgraphs', { params });
    return response.data;
  }

  /**
   * Get subgraph detail by ID
   * REQ-FR-021: Load subgraph detail
   */
  async getSubgraphDetail(id: number): Promise<SubgraphDetail> {
    const response = await request.get<SubgraphDetail>(`/subgraphs/${id}`);
    return response.data;
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
    const response = await request.put<Subgraph>(`/subgraphs/${id}`, data);
    return response.data;
  }

  /**
   * Delete a subgraph
   * REQ-FR-053: Execute delete operation
   */
  async deleteSubgraph(id: number): Promise<void> {
    await request.delete(`/subgraphs/${id}`);
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
   */
  async getTopology(id: number): Promise<TopologyData> {
    const response = await request.get<TopologyData>(`/subgraphs/${id}/topology`);
    return response.data;
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
