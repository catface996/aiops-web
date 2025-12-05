/**
 * useSubgraphPermission Hook
 * 
 * Custom hook for checking subgraph-specific permissions.
 * Implements REQ-FR-034, REQ-FR-035, REQ-FR-047, REQ-FR-048, REQ-FR-057, REQ-FR-058, REQ-NFR-028
 */

import { useMemo } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import type { SubgraphDetail } from '@/types/subgraph';

/**
 * Permission check result interface
 */
export interface SubgraphPermissionResult {
  /**
   * Whether the current user is an owner of the subgraph
   * REQ-FR-034, REQ-FR-035: Owner can edit
   */
  isOwner: boolean;

  /**
   * Whether the current user is a viewer of the subgraph
   */
  isViewer: boolean;

  /**
   * Whether the user can edit the subgraph
   * REQ-FR-034: Owner can edit
   * REQ-FR-035: Non-owner cannot edit
   */
  canEdit: boolean;

  /**
   * Whether the user can delete the subgraph
   * REQ-FR-047: Owner can delete
   * REQ-FR-048: Non-owner cannot delete
   */
  canDelete: boolean;

  /**
   * Whether the user can add nodes to the subgraph
   * REQ-FR-057: Owner can add nodes
   * REQ-FR-058: Non-owner cannot add nodes
   */
  canAddNode: boolean;

  /**
   * Whether the user can remove nodes from the subgraph
   * REQ-FR-071: Owner can remove nodes
   * REQ-FR-072: Non-owner cannot remove nodes
   */
  canRemoveNode: boolean;

  /**
   * Whether the user can view the subgraph
   * Both owners and viewers can view
   */
  canView: boolean;

  /**
   * Whether the user can manage permissions
   * Only owners can manage permissions
   */
  canManagePermissions: boolean;
}

/**
 * Custom hook for checking subgraph permissions
 * 
 * Features:
 * - Check if user is owner (REQ-FR-034, REQ-FR-035)
 * - Check if user is viewer
 * - Check edit permission (REQ-FR-034, REQ-FR-035)
 * - Check delete permission (REQ-FR-047, REQ-FR-048)
 * - Check add node permission (REQ-FR-057, REQ-FR-058)
 * - Check remove node permission
 * - Check view permission
 * - Check manage permissions permission
 * - Performance optimized with useMemo (REQ-NFR-028)
 * 
 * @param subgraph - The subgraph detail object (can be null during loading)
 * @returns Permission check results
 * 
 * @example
 * ```tsx
 * const { subgraph } = useSubgraphDetail(subgraphId);
 * const { canEdit, canDelete, canAddNode } = useSubgraphPermission(subgraph);
 * 
 * return (
 *   <>
 *     {canEdit && <Button onClick={handleEdit}>Edit</Button>}
 *     {canDelete && <Button onClick={handleDelete}>Delete</Button>}
 *     {canAddNode && <Button onClick={handleAddNode}>Add Node</Button>}
 *   </>
 * );
 * ```
 */
export function useSubgraphPermission(
  subgraph: SubgraphDetail | null
): SubgraphPermissionResult {
  const { user } = useAuthContext();

  /**
   * Check if current user is an owner
   * REQ-FR-034: Owner can perform privileged operations
   * REQ-FR-035: Non-owner cannot perform privileged operations
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const isOwner = useMemo(() => {
    if (!user || !subgraph) return false;
    const owners = subgraph.owners || [];
    return owners.some((owner) => owner.userId === user.userId);
  }, [user, subgraph]);

  /**
   * Check if current user is a viewer
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const isViewer = useMemo(() => {
    if (!user || !subgraph) return false;
    const viewers = subgraph.viewers || [];
    return viewers.some((viewer) => viewer.userId === user.userId);
  }, [user, subgraph]);

  /**
   * Check if user can edit the subgraph
   * REQ-FR-034: WHEN user is Owner THEN display Edit button
   * REQ-FR-035: WHEN user is not Owner THEN hide Edit button
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canEdit = useMemo(() => {
    return isOwner;
  }, [isOwner]);

  /**
   * Check if user can delete the subgraph
   * REQ-FR-047: WHEN user is Owner THEN display Delete button
   * REQ-FR-048: WHEN user is not Owner THEN hide Delete button
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canDelete = useMemo(() => {
    return isOwner;
  }, [isOwner]);

  /**
   * Check if user can add nodes to the subgraph
   * REQ-FR-057: WHEN user is Owner THEN display Add Node button
   * REQ-FR-058: WHEN user is not Owner THEN hide Add Node button
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canAddNode = useMemo(() => {
    return isOwner;
  }, [isOwner]);

  /**
   * Check if user can remove nodes from the subgraph
   * REQ-FR-071: WHEN user is Owner THEN display Remove button
   * REQ-FR-072: WHEN user is not Owner THEN hide Remove button
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canRemoveNode = useMemo(() => {
    return isOwner;
  }, [isOwner]);

  /**
   * Check if user can view the subgraph
   * Both owners and viewers can view
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canView = useMemo(() => {
    return isOwner || isViewer;
  }, [isOwner, isViewer]);

  /**
   * Check if user can manage permissions
   * Only owners can manage permissions
   * REQ-FR-039: Owner can manage permissions
   * REQ-NFR-028: Use useMemo for performance optimization
   */
  const canManagePermissions = useMemo(() => {
    return isOwner;
  }, [isOwner]);

  return {
    isOwner,
    isViewer,
    canEdit,
    canDelete,
    canAddNode,
    canRemoveNode,
    canView,
    canManagePermissions,
  };
}

export default useSubgraphPermission;
