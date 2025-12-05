/**
 * Subgraph Type Definitions
 * 
 * This module contains TypeScript interfaces and types for subgraph management.
 * Aligned with backend OpenAPI specification 100%.
 */

// ============================================================================
// Core Subgraph Types
// ============================================================================

/**
 * Subgraph entity - basic subgraph information
 */
export interface Subgraph {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  createdBy: number;
  createdAt: string; // ISO8601 format
  updatedAt: string; // ISO8601 format
  version: number; // For optimistic locking
}

/**
 * Subgraph detail - extends Subgraph with additional information
 */
export interface SubgraphDetail extends Subgraph {
  owners: SubgraphUserInfo[];
  viewers: SubgraphUserInfo[];
  resources: ResourceInfo[];
  resourceCount: number;
}

// ============================================================================
// User and Resource Types
// ============================================================================

/**
 * Subgraph user information (simplified user data for subgraph context)
 */
export interface SubgraphUserInfo {
  userId: number;
  username: string;
  email: string;
}

/**
 * Resource node information
 */
export interface ResourceInfo {
  resourceId: number;
  name: string;
  type: string;
  status: string;
  addedAt: string; // ISO8601 format
  addedBy: number;
}

// ============================================================================
// Topology Types
// ============================================================================

/**
 * Topology data containing nodes and edges
 */
export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

/**
 * Topology node
 */
export interface TopologyNode {
  id: number;
  name: string;
  type: string;
  status: string;
}

/**
 * Topology edge (relationship between nodes)
 */
export interface TopologyEdge {
  source: number;
  target: number;
  type: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated list response
 */
export interface SubgraphListResponse {
  items: Subgraph[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Standard API error response
 */
export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path: string;
  traceId: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create subgraph request payload
 */
export interface CreateSubgraphRequest {
  name: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

/**
 * Update subgraph request payload
 */
export interface UpdateSubgraphRequest {
  name?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, string>;
  version: number; // Required for optimistic locking
}

/**
 * Add resources to subgraph request payload
 */
export interface AddResourcesRequest {
  resourceIds: number[];
}

/**
 * Remove resources from subgraph request payload
 */
export interface RemoveResourcesRequest {
  resourceIds: number[];
}

/**
 * Update subgraph permissions request payload
 */
export interface UpdatePermissionsRequest {
  addOwners?: number[];
  removeOwners?: number[];
  addViewers?: number[];
  removeViewers?: number[];
}

// ============================================================================
// Component State Types
// ============================================================================

/**
 * Subgraph form state (for create/edit modals)
 */
export interface SubgraphFormState {
  name: string;
  description: string;
  tags: string[];
  metadata: {
    businessDomain?: string;
    environment?: string;
    team?: string;
  };
}

/**
 * Subgraph list query parameters
 */
export interface SubgraphListQuery {
  keyword?: string;
  tags?: string[];
  ownerId?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

/**
 * Permission role constants
 */
export const PermissionRole = {
  OWNER: 'OWNER',
  VIEWER: 'VIEWER',
} as const;

export type PermissionRole = (typeof PermissionRole)[keyof typeof PermissionRole];

/**
 * Subgraph permission information
 */
export interface SubgraphPermission {
  userId: number;
  role: PermissionRole;
  grantedAt: string; // ISO8601 format
  grantedBy: number;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Subgraph list state
 */
export interface SubgraphListState {
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
 * Subgraph detail state
 */
export interface SubgraphDetailState {
  subgraph: SubgraphDetail | null;
  loading: boolean;
  activeTab: 'overview' | 'resources' | 'topology' | 'permissions';
  resources: ResourceInfo[];
  topologyData: TopologyData | null;
  permissions: SubgraphPermission[];
}

/**
 * Create/Edit subgraph form state
 */
export interface CreateSubgraphFormState {
  name: string;
  description: string;
  tags: string[];
  metadata: {
    businessDomain?: string;
    environment?: string;
    team?: string;
  };
  submitting: boolean;
  errors: Record<string, string>;
}

/**
 * Add resource modal state
 */
export interface AddResourceModalState {
  resources: ResourceInfo[];
  loading: boolean;
  selectedIds: number[];
  keyword: string;
  typeFilter: string | null;
  page: number;
  pageSize: number;
  total: number;
}
