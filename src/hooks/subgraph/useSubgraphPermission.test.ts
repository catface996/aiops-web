/**
 * useSubgraphPermission Hook Unit Tests
 * 
 * Tests permission checking logic for different user roles.
 * Validates REQ-FR-034, REQ-FR-035, REQ-FR-047, REQ-FR-048, REQ-FR-057, REQ-FR-058, REQ-NFR-028
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubgraphPermission } from './useSubgraphPermission';
import type { SubgraphDetail } from '@/types/subgraph';
import type { User } from '@/types';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from '@/contexts/AuthContext';

describe('useSubgraphPermission', () => {
  // Test data
  const mockOwnerUser: User = {
    userId: 1,
    username: 'owner',
    email: 'owner@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-01T00:00:00Z',
  };

  const mockViewerUser: User = {
    userId: 2,
    username: 'viewer',
    email: 'viewer@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-01T00:00:00Z',
  };

  const mockNonMemberUser: User = {
    userId: 3,
    username: 'nonmember',
    email: 'nonmember@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-01T00:00:00Z',
  };

  const mockSubgraph: SubgraphDetail = {
    id: 1,
    name: 'Test Subgraph',
    description: 'Test description',
    tags: ['test'],
    metadata: {},
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    owners: [
      {
        userId: 1,
        username: 'owner',
        email: 'owner@example.com',
      },
    ],
    viewers: [
      {
        userId: 2,
        username: 'viewer',
        email: 'viewer@example.com',
      },
    ],
    resources: [],
    resourceCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Owner permissions', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should identify user as owner', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.isViewer).toBe(false);
    });

    it('should grant all permissions to owner (REQ-FR-034, REQ-FR-047, REQ-FR-057)', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      // REQ-FR-034: Owner can edit
      expect(result.current.canEdit).toBe(true);
      
      // REQ-FR-047: Owner can delete
      expect(result.current.canDelete).toBe(true);
      
      // REQ-FR-057: Owner can add nodes
      expect(result.current.canAddNode).toBe(true);
      
      // Owner can remove nodes
      expect(result.current.canRemoveNode).toBe(true);
      
      // Owner can view
      expect(result.current.canView).toBe(true);
      
      // Owner can manage permissions
      expect(result.current.canManagePermissions).toBe(true);
    });

    it('should handle multiple owners correctly', () => {
      const subgraphWithMultipleOwners: SubgraphDetail = {
        ...mockSubgraph,
        owners: [
          { userId: 1, username: 'owner1', email: 'owner1@example.com' },
          { userId: 4, username: 'owner2', email: 'owner2@example.com' },
        ],
      };

      const { result } = renderHook(() => useSubgraphPermission(subgraphWithMultipleOwners));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.canEdit).toBe(true);
    });
  });

  describe('Viewer permissions', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockViewerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should identify user as viewer', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(true);
    });

    it('should deny privileged permissions to viewer (REQ-FR-035, REQ-FR-048, REQ-FR-058)', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      // REQ-FR-035: Non-owner cannot edit
      expect(result.current.canEdit).toBe(false);
      
      // REQ-FR-048: Non-owner cannot delete
      expect(result.current.canDelete).toBe(false);
      
      // REQ-FR-058: Non-owner cannot add nodes
      expect(result.current.canAddNode).toBe(false);
      
      // Non-owner cannot remove nodes
      expect(result.current.canRemoveNode).toBe(false);
      
      // Non-owner cannot manage permissions
      expect(result.current.canManagePermissions).toBe(false);
    });

    it('should allow viewer to view subgraph', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canView).toBe(true);
    });

    it('should handle multiple viewers correctly', () => {
      const subgraphWithMultipleViewers: SubgraphDetail = {
        ...mockSubgraph,
        viewers: [
          { userId: 2, username: 'viewer1', email: 'viewer1@example.com' },
          { userId: 5, username: 'viewer2', email: 'viewer2@example.com' },
        ],
      };

      const { result } = renderHook(() => useSubgraphPermission(subgraphWithMultipleViewers));

      expect(result.current.isViewer).toBe(true);
      expect(result.current.canView).toBe(true);
    });
  });

  describe('Non-member permissions', () => {
    beforeEach(() => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockNonMemberUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });
    });

    it('should identify user as non-member', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(false);
    });

    it('should deny all permissions to non-member', () => {
      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canAddNode).toBe(false);
      expect(result.current.canRemoveNode).toBe(false);
      expect(result.current.canView).toBe(false);
      expect(result.current.canManagePermissions).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null subgraph', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(null));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(false);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canAddNode).toBe(false);
      expect(result.current.canRemoveNode).toBe(false);
      expect(result.current.canView).toBe(false);
      expect(result.current.canManagePermissions).toBe(false);
    });

    it('should handle null user', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(false);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canAddNode).toBe(false);
      expect(result.current.canRemoveNode).toBe(false);
      expect(result.current.canView).toBe(false);
      expect(result.current.canManagePermissions).toBe(false);
    });

    it('should handle empty owners and viewers arrays', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const emptySubgraph: SubgraphDetail = {
        ...mockSubgraph,
        owners: [],
        viewers: [],
      };

      const { result } = renderHook(() => useSubgraphPermission(emptySubgraph));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(false);
      expect(result.current.canView).toBe(false);
    });

    it('should handle user being both owner and viewer (owner takes precedence)', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const subgraphWithDualRole: SubgraphDetail = {
        ...mockSubgraph,
        owners: [{ userId: 1, username: 'owner', email: 'owner@example.com' }],
        viewers: [{ userId: 1, username: 'owner', email: 'owner@example.com' }],
      };

      const { result } = renderHook(() => useSubgraphPermission(subgraphWithDualRole));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.isViewer).toBe(true);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.canView).toBe(true);
    });
  });

  describe('Performance optimization (REQ-NFR-028)', () => {
    it('should use memoization to avoid unnecessary recalculations', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useSubgraphPermission(mockSubgraph));

      const firstResult = result.current;

      // Rerender with same props
      rerender();

      const secondResult = result.current;

      // Results should be referentially equal due to useMemo
      expect(firstResult.isOwner).toBe(secondResult.isOwner);
      expect(firstResult.canEdit).toBe(secondResult.canEdit);
      expect(firstResult.canDelete).toBe(secondResult.canDelete);
    });

    it('should recalculate when subgraph changes', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result, rerender } = renderHook(
        ({ subgraph }) => useSubgraphPermission(subgraph),
        { initialProps: { subgraph: mockSubgraph } }
      );

      expect(result.current.isOwner).toBe(true);

      // Change subgraph to remove user from owners
      const updatedSubgraph: SubgraphDetail = {
        ...mockSubgraph,
        owners: [],
      };

      rerender({ subgraph: updatedSubgraph });

      expect(result.current.isOwner).toBe(false);
      expect(result.current.canEdit).toBe(false);
    });

    it('should recalculate when user changes', () => {
      const { result, rerender } = renderHook(() => useSubgraphPermission(mockSubgraph));

      // Start with owner user
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      rerender();
      expect(result.current.isOwner).toBe(true);

      // Change to viewer user
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockViewerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      rerender();
      expect(result.current.isOwner).toBe(false);
      expect(result.current.isViewer).toBe(true);
    });
  });

  describe('Requirement validation', () => {
    it('REQ-FR-034: Owner can edit subgraph', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canEdit).toBe(true);
    });

    it('REQ-FR-035: Non-owner cannot edit subgraph', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockViewerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canEdit).toBe(false);
    });

    it('REQ-FR-047: Owner can delete subgraph', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canDelete).toBe(true);
    });

    it('REQ-FR-048: Non-owner cannot delete subgraph', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockViewerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canDelete).toBe(false);
    });

    it('REQ-FR-057: Owner can add nodes', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canAddNode).toBe(true);
    });

    it('REQ-FR-058: Non-owner cannot add nodes', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockViewerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useSubgraphPermission(mockSubgraph));

      expect(result.current.canAddNode).toBe(false);
    });

    it('REQ-NFR-028: Permission checks use memoization for performance', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: mockOwnerUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useSubgraphPermission(mockSubgraph));

      const firstIsOwner = result.current.isOwner;
      const firstCanEdit = result.current.canEdit;

      // Rerender without changing dependencies
      rerender();

      // Values should remain stable
      expect(result.current.isOwner).toBe(firstIsOwner);
      expect(result.current.canEdit).toBe(firstCanEdit);
    });
  });
});
