/**
 * Permission Utility
 *
 * Unified permission checking utilities for resources and subgraphs.
 * This module provides a centralized way to check user permissions.
 */


import type { User } from '@/types';
import type { SubgraphDetail, SubgraphUserInfo } from '@/types/subgraph';
import type { ResourceDTO } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * User role constants
 */
export const UserRole = {
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_USER: 'ROLE_USER',
} as const;

/**
 * Permission result for any entity
 */
export interface PermissionResult {
  isOwner: boolean;
  isViewer: boolean;
  isAdmin: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Extended permission result for resources
 */
export interface ResourcePermissionResult extends PermissionResult {
  canChangeStatus: boolean;
  canViewSensitive: boolean;
}

/**
 * Extended permission result for subgraphs
 */
export interface SubgraphPermissionResult extends PermissionResult {
  canAddNode: boolean;
  canRemoveNode: boolean;
  canManagePermissions: boolean;
}

// ============================================================================
// Core Permission Functions
// ============================================================================

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === UserRole.ROLE_ADMIN;
}

/**
 * Check if user is the creator/owner by createdBy field
 */
export function isCreator(createdBy: number | undefined, userId: number | undefined): boolean {
  if (createdBy === undefined || userId === undefined) return false;
  return createdBy === userId;
}

/**
 * Check if user is in the owners list
 */
export function isInOwnersList(
  owners: SubgraphUserInfo[] | undefined,
  userId: number | undefined
): boolean {
  if (!owners || !userId) return false;
  return owners.some((owner) => owner.userId === userId);
}

/**
 * Check if user is in the viewers list
 */
export function isInViewersList(
  viewers: SubgraphUserInfo[] | undefined,
  userId: number | undefined
): boolean {
  if (!viewers || !userId) return false;
  return viewers.some((viewer) => viewer.userId === userId);
}

// ============================================================================
// Resource Permission
// ============================================================================

/**
 * Get permission result for a resource
 *
 * @param resource - The resource to check permissions for
 * @param user - The current user
 * @returns Permission result for the resource
 *
 * @example
 * ```tsx
 * const permission = getResourcePermission(resource, user);
 * if (permission.canEdit) {
 *   // Show edit button
 * }
 * ```
 */
export function getResourcePermission(
  resource: ResourceDTO | null,
  user: User | null
): ResourcePermissionResult {
  const defaultResult: ResourcePermissionResult = {
    isOwner: false,
    isViewer: false,
    isAdmin: false,
    canView: false,
    canEdit: false,
    canDelete: false,
    canChangeStatus: false,
    canViewSensitive: false,
  };

  if (!resource || !user) {
    return defaultResult;
  }

  const userIsAdmin = isAdmin(user);
  const userIsOwner = isCreator(resource.createdBy, user.userId);

  return {
    isOwner: userIsOwner,
    isViewer: true, // All authenticated users can view resources
    isAdmin: userIsAdmin,
    canView: true,
    canEdit: userIsOwner || userIsAdmin,
    canDelete: userIsOwner || userIsAdmin,
    canChangeStatus: userIsOwner || userIsAdmin,
    canViewSensitive: userIsOwner || userIsAdmin,
  };
}

// ============================================================================
// Subgraph Permission
// ============================================================================

/**
 * Get permission result for a subgraph
 *
 * @param subgraph - The subgraph to check permissions for
 * @param user - The current user
 * @returns Permission result for the subgraph
 *
 * @example
 * ```tsx
 * const permission = getSubgraphPermission(subgraph, user);
 * if (permission.canAddNode) {
 *   // Show add node button
 * }
 * ```
 */
export function getSubgraphPermission(
  subgraph: SubgraphDetail | null,
  user: User | null
): SubgraphPermissionResult {
  const defaultResult: SubgraphPermissionResult = {
    isOwner: false,
    isViewer: false,
    isAdmin: false,
    canView: false,
    canEdit: false,
    canDelete: false,
    canAddNode: false,
    canRemoveNode: false,
    canManagePermissions: false,
  };

  if (!subgraph || !user) {
    return defaultResult;
  }

  const userIsAdmin = isAdmin(user);
  const userIsOwner = isInOwnersList(subgraph.owners, user.userId);
  const userIsViewer = isInViewersList(subgraph.viewers, user.userId);

  // Owners and admins have full permissions
  const hasFullAccess = userIsOwner || userIsAdmin;

  return {
    isOwner: userIsOwner,
    isViewer: userIsViewer,
    isAdmin: userIsAdmin,
    canView: hasFullAccess || userIsViewer,
    canEdit: hasFullAccess,
    canDelete: hasFullAccess,
    canAddNode: hasFullAccess,
    canRemoveNode: hasFullAccess,
    canManagePermissions: hasFullAccess,
  };
}

// ============================================================================
// React Hooks
// ============================================================================

import { useMemo } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for checking resource permissions
 *
 * @param resource - The resource to check permissions for
 * @returns Permission result for the resource
 *
 * @example
 * ```tsx
 * const { canEdit, canDelete } = useResourcePermission(resource);
 * ```
 */
export function useResourcePermission(resource: ResourceDTO | null): ResourcePermissionResult {
  const { user } = useAuthContext();

  return useMemo(
    () => getResourcePermission(resource, user),
    [resource, user]
  );
}

/**
 * Hook for checking subgraph permissions
 *
 * @param subgraph - The subgraph to check permissions for
 * @returns Permission result for the subgraph
 *
 * @example
 * ```tsx
 * const { canEdit, canAddNode, canRemoveNode } = useSubgraphPermission(subgraph);
 * ```
 */
export function useSubgraphPermission(subgraph: SubgraphDetail | null): SubgraphPermissionResult {
  const { user } = useAuthContext();

  return useMemo(
    () => getSubgraphPermission(subgraph, user),
    [subgraph, user]
  );
}

// ============================================================================
// Permission Guard Component
// ============================================================================

import React from 'react';

export type PermissionLevel = 'owner' | 'viewer' | 'admin';

export interface PermissionGuardProps {
  /** Children to render when permission is granted */
  children: React.ReactNode;
  /** Whether the user has the required permission */
  hasPermission: boolean;
  /** Fallback content when permission is denied */
  fallback?: React.ReactNode;
}

/**
 * Permission Guard Component
 *
 * Conditionally renders children based on permission check result.
 *
 * @example
 * ```tsx
 * const { canEdit } = useSubgraphPermission(subgraph);
 *
 * <PermissionGuard hasPermission={canEdit}>
 *   <Button onClick={handleEdit}>Edit</Button>
 * </PermissionGuard>
 * ```
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  hasPermission,
  fallback = null,
}) => {
  if (hasPermission) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};

export default {
  getResourcePermission,
  getSubgraphPermission,
  useResourcePermission,
  useSubgraphPermission,
  isAdmin,
  isCreator,
  isInOwnersList,
  isInViewersList,
  PermissionGuard,
};
