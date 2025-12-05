/**
 * DeleteConfirmModal Component Tests
 * 
 * Tests for the delete confirmation modal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteConfirmModal from './DeleteConfirmModal';
import SubgraphService from '@/services/subgraph';
import type { SubgraphDetail } from '@/types/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    deleteSubgraph: vi.fn(),
  },
}));

describe('DeleteConfirmModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const emptySubgraph: SubgraphDetail = {
    id: 1,
    name: 'test-subgraph',
    description: 'Test subgraph',
    tags: ['test'],
    metadata: {},
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    owners: [],
    viewers: [],
    resources: [],
    resourceCount: 0,
  };

  const nonEmptySubgraph: SubgraphDetail = {
    ...emptySubgraph,
    resourceCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('REQ-FR-050: Non-empty subgraph deletion prevention', () => {
    it('should display error alert when subgraph has resources', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={nonEmptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Cannot Delete Subgraph')).toBeInTheDocument();
      expect(screen.getByText(/contains/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should disable delete button when subgraph has resources', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={nonEmptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should not show name input when subgraph has resources', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={nonEmptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByPlaceholderText('Enter subgraph name')).not.toBeInTheDocument();
    });
  });

  describe('REQ-FR-051: Empty subgraph deletion confirmation', () => {
    it('should display warning alert for empty subgraph', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
    });

    it('should display impact information', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/remove the subgraph and all its metadata/i)).toBeInTheDocument();
      expect(screen.getByText(/remove all permission associations/i)).toBeInTheDocument();
    });
  });

  describe('REQ-FR-052: Name matching validation', () => {
    it('should disable delete button when name does not match', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when name matches exactly', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('should show error message when name does not match', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'wrong-name' } });

      expect(screen.getByText(/name does not match/i)).toBeInTheDocument();
    });

    it('should not show error message when input is empty', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText(/name does not match/i)).not.toBeInTheDocument();
    });
  });

  describe('REQ-FR-053: Delete execution', () => {
    it('should call deleteSubgraph API when confirmed', async () => {
      vi.mocked(SubgraphService.deleteSubgraph).mockResolvedValue(undefined);

      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(SubgraphService.deleteSubgraph).toHaveBeenCalledWith(1);
      });
    });

    it('should call onSuccess callback after successful deletion', async () => {
      vi.mocked(SubgraphService.deleteSubgraph).mockResolvedValue(undefined);

      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should show loading state during deletion', async () => {
      vi.mocked(SubgraphService.deleteSubgraph).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(deleteButton);

      // Button should show loading state
      await waitFor(() => {
        expect(deleteButton).toHaveClass('ant-btn-loading');
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(SubgraphService.deleteSubgraph).mockRejectedValue(
        new Error('Delete failed')
      );

      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('REQ-FR-056: Resource preservation notice', () => {
    it('should display resource preservation information', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/resource nodes will be preserved/i)).toBeInTheDocument();
      expect(screen.getByText(/will not be deleted or modified/i)).toBeInTheDocument();
    });
  });

  describe('Modal behavior', () => {
    it('should reset confirmation input when modal opens', () => {
      const { rerender } = render(
        <DeleteConfirmModal
          visible={false}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      rerender(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      expect(input).toHaveValue('');
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not allow cancel during deletion', async () => {
      vi.mocked(SubgraphService.deleteSubgraph).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <DeleteConfirmModal
          visible={true}
          subgraph={emptySubgraph}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const input = screen.getByPlaceholderText('Enter subgraph name');
      fireEvent.change(input, { target: { value: 'test-subgraph' } });

      const deleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // onClose should not be called during deletion
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
