/**
 * EditSubgraphModal Component Tests
 * 
 * Tests for the edit subgraph modal component.
 * Validates REQ-FR-034, REQ-FR-037, REQ-FR-038, REQ-FR-043, REQ-FR-045
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditSubgraphModal from './EditSubgraphModal';
import SubgraphService from '@/services/subgraph';
import type { SubgraphDetail } from '@/types/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    updateSubgraph: vi.fn(),
    checkNameUnique: vi.fn(),
  },
}));

// Mock Ant Design message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

describe('EditSubgraphModal', () => {
  const mockSubgraph: SubgraphDetail = {
    id: 1,
    name: 'Test Subgraph',
    description: 'Test description',
    tags: ['tag1', 'tag2'],
    metadata: {
      businessDomain: 'payment',
      environment: 'production',
      team: 'Platform Team',
    },
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    owners: [],
    viewers: [],
    resources: [],
    resourceCount: 0,
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render edit modal with title', () => {
    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Edit Subgraph')).toBeInTheDocument();
  });

  it('should pre-fill form with subgraph data (REQ-FR-037)', async () => {
    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Wait for form to be populated
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Enter subgraph name') as HTMLInputElement;
      expect(nameInput.value).toBe('Test Subgraph');
    });

    const descriptionInput = screen.getByPlaceholderText('Enter subgraph description (optional)') as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Test description');

    // Check tags are displayed
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should validate name uniqueness excluding current subgraph (REQ-FR-038)', async () => {
    const user = userEvent.setup();
    vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(false);

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter subgraph name')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter subgraph name');
    
    // Clear and enter a new name
    await user.clear(nameInput);
    await user.type(nameInput, 'Duplicate Name');
    await user.tab(); // Trigger blur validation

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText('Subgraph name already exists')).toBeInTheDocument();
    });

    // Verify checkNameUnique was called with excludeId
    expect(SubgraphService.checkNameUnique).toHaveBeenCalledWith('Duplicate Name', 1);
  });

  it('should submit update with version field (REQ-FR-043)', async () => {
    const user = userEvent.setup();
    const updatedSubgraph = { ...mockSubgraph, name: 'Updated Name', version: 2 };
    vi.mocked(SubgraphService.updateSubgraph).mockResolvedValue(updatedSubgraph);
    vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter subgraph name')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter subgraph name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(SubgraphService.updateSubgraph).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Updated Name',
          version: 1, // Original version
        })
      );
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(updatedSubgraph);
  });

  it('should handle version conflict (REQ-FR-045)', async () => {
    const user = userEvent.setup();
    const conflictError = {
      response: {
        status: 409,
        data: {
          code: 'CONFLICT',
          message: 'Version conflict',
        },
      },
    };
    vi.mocked(SubgraphService.updateSubgraph).mockRejectedValue(conflictError);
    vi.mocked(SubgraphService.checkNameUnique).mockResolvedValue(true);

    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter subgraph name')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Enter subgraph name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Wait for conflict modal to appear - use getAllByText since there are multiple modals
    await waitFor(() => {
      const conflictTitles = screen.getAllByText('Data Conflict');
      expect(conflictTitles.length).toBeGreaterThan(0);
    });

    expect(screen.getByText('This subgraph has been modified by others. Please refresh and try again.')).toBeInTheDocument();
  });

  it('should allow adding tags', async () => {
    const user = userEvent.setup();

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument();
    });

    // Add a new tag
    const tagInput = screen.getByPlaceholderText('Enter tag and press Enter');
    await user.type(tagInput, 'newtag{Enter}');

    await waitFor(() => {
      expect(screen.getByText('newtag')).toBeInTheDocument();
    });

    // Verify existing tags are still there
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should show confirmation when canceling with unsaved changes', async () => {
    const user = userEvent.setup();

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter subgraph name')).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByPlaceholderText('Enter subgraph name');
    await user.type(nameInput, ' Modified');

    // Try to cancel - find the cancel button in the footer
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    // Get the last one which should be from the main modal
    const cancelButton = cancelButtons[cancelButtons.length - 1];
    await user.click(cancelButton);

    // Should show confirmation dialog - use getAllByText since there might be multiple modals
    await waitFor(() => {
      const unsavedTitles = screen.getAllByText('Unsaved Changes');
      expect(unsavedTitles.length).toBeGreaterThan(0);
    });

    // Verify the confirmation message is present
    const confirmMessages = screen.getAllByText('You have unsaved changes. Are you sure you want to discard them?');
    expect(confirmMessages.length).toBeGreaterThan(0);
  });

  it('should update metadata fields', async () => {
    const user = userEvent.setup();
    const updatedSubgraph = { ...mockSubgraph, version: 2 };
    vi.mocked(SubgraphService.updateSubgraph).mockResolvedValue(updatedSubgraph);

    render(
      <EditSubgraphModal
        visible={true}
        subgraph={mockSubgraph}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter team name (optional)')).toBeInTheDocument();
    });

    const teamInput = screen.getByPlaceholderText('Enter team name (optional)');
    await user.clear(teamInput);
    await user.type(teamInput, 'New Team');

    const saveButtons = screen.getAllByText('Save');
    const saveButton = saveButtons[saveButtons.length - 1];
    await user.click(saveButton);

    await waitFor(() => {
      expect(SubgraphService.updateSubgraph).toHaveBeenCalled();
    });

    // Verify the update was called with version field
    expect(SubgraphService.updateSubgraph).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        version: 1,
      })
    );

    // Verify success callback was called
    expect(mockOnSuccess).toHaveBeenCalledWith(updatedSubgraph);
  });
});
