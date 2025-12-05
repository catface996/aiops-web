/**
 * AddResourceModal Component Tests
 * 
 * Tests for the AddResourceModal component functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddResourceModal from './AddResourceModal';
import * as resourceService from '@/services/resource';
import SubgraphService from '@/services/subgraph';

// Mock services
vi.mock('@/services/resource');
vi.mock('@/services/subgraph');

describe('AddResourceModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockResources = [
    {
      id: 1,
      name: 'Server-01',
      description: 'Test server',
      resourceTypeId: 1,
      resourceTypeName: 'Server',
      resourceTypeCode: 'SERVER',
      status: 'RUNNING' as const,
      statusDisplay: 'Running',
      attributes: '{}',
      version: 1,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-01T10:00:00Z',
      createdBy: 1,
    },
    {
      id: 2,
      name: 'App-API',
      description: 'API application',
      resourceTypeId: 2,
      resourceTypeName: 'Application',
      resourceTypeCode: 'APPLICATION',
      status: 'RUNNING' as const,
      statusDisplay: 'Running',
      attributes: '{}',
      version: 1,
      createdAt: '2024-12-01T11:00:00Z',
      updatedAt: '2024-12-01T11:00:00Z',
      createdBy: 1,
    },
    {
      id: 3,
      name: 'DB-Main',
      description: 'Main database',
      resourceTypeId: 3,
      resourceTypeName: 'Database',
      resourceTypeCode: 'DATABASE',
      status: 'RUNNING' as const,
      statusDisplay: 'Running',
      attributes: '{}',
      version: 1,
      createdAt: '2024-12-01T12:00:00Z',
      updatedAt: '2024-12-01T12:00:00Z',
      createdBy: 2,
    },
  ];

  const mockResourceTypes = [
    { id: 1, code: 'SERVER', name: 'Server', description: 'Server', icon: '', systemPreset: true },
    { id: 2, code: 'APPLICATION', name: 'Application', description: 'Application', icon: '', systemPreset: true },
    { id: 3, code: 'DATABASE', name: 'Database', description: 'Database', icon: '', systemPreset: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getResourceList
    vi.mocked(resourceService.getResourceList).mockResolvedValue({
      items: mockResources,
      total: 3,
      page: 0,
      size: 20,
    });

    // Mock getResourceTypes
    vi.mocked(resourceService.getResourceTypes).mockResolvedValue(mockResourceTypes);

    // Mock SubgraphService.addResources
    vi.mocked(SubgraphService.addResources).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render modal with title and controls', async () => {
    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Check modal title
    expect(screen.getByText('Add Resource Nodes')).toBeInTheDocument();

    // Check search input
    expect(screen.getByPlaceholderText('Search resource name')).toBeInTheDocument();

    // Check type filter
    expect(screen.getByPlaceholderText('Filter by type')).toBeInTheDocument();

    // Wait for resources to load
    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });
  });

  it('should display resource list with correct columns', async () => {
    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Check all resources are displayed
    expect(screen.getByText('Server-01')).toBeInTheDocument();
    expect(screen.getByText('App-API')).toBeInTheDocument();
    expect(screen.getByText('DB-Main')).toBeInTheDocument();

    // Check resource types are displayed
    expect(screen.getByText('Server')).toBeInTheDocument();
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('should mark already added resources with badge', async () => {
    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[1]} // Server-01 is already added
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Already Added')).toBeInTheDocument();
    });

    // Check that only one "Already Added" badge is shown
    const badges = screen.getAllByText('Already Added');
    expect(badges).toHaveLength(1);
  });

  it('should disable checkboxes for already added resources', async () => {
    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[1]} // Server-01 is already added
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // First checkbox should be disabled (already added)
    // Note: The first checkbox is the "select all" checkbox, so we check the second one
    expect(checkboxes[1]).toBeDisabled();
  });

  it('should handle search input with debounce', async () => {
    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Clear initial mock calls
    vi.clearAllMocks();

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search resource name');
    await user.type(searchInput, 'Server');

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(resourceService.getResourceList).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: 'Server' })
        );
      },
      { timeout: 500 }
    );
  });

  it('should handle type filter change', async () => {
    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Clear initial mock calls
    vi.clearAllMocks();

    // Click type filter dropdown
    const typeFilter = screen.getByPlaceholderText('Filter by type');
    await user.click(typeFilter);

    // Select "Server" type
    await waitFor(() => {
      expect(screen.getByText('Server')).toBeInTheDocument();
    });

    const serverOption = screen.getAllByText('Server')[0]; // Get the first one (in dropdown)
    await user.click(serverOption);

    // Wait for API call with filter
    await waitFor(() => {
      expect(resourceService.getResourceList).toHaveBeenCalledWith(
        expect.objectContaining({ resourceTypeId: 1 })
      );
    });
  });

  it('should handle resource selection', async () => {
    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Get checkboxes (skip the first one which is "select all")
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Select first resource
    await user.click(checkboxes[1]);

    // Check selected count
    await waitFor(() => {
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
      expect(screen.getByText(/1/)).toBeInTheDocument();
    });
  });

  it('should show warning when selecting more than 50 resources', async () => {
    // Mock a large list of resources
    const largeResourceList = Array.from({ length: 60 }, (_, i) => ({
      ...mockResources[0],
      id: i + 1,
      name: `Resource-${i + 1}`,
    }));

    vi.mocked(resourceService.getResourceList).mockResolvedValue({
      items: largeResourceList,
      total: 60,
      page: 0,
      size: 100,
    });

    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Resource-1')).toBeInTheDocument();
    });

    // Try to select all (which would be > 50)
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    // Should show warning message
    await waitFor(() => {
      expect(screen.getByText(/You can add up to 50 nodes at once/)).toBeInTheDocument();
    });
  });

  it('should submit selected resources successfully', async () => {
    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Select first resource
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // Click Add button
    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);

    // Wait for API call
    await waitFor(() => {
      expect(SubgraphService.addResources).toHaveBeenCalledWith(1, [1]);
    });

    // Check success callback was called
    expect(mockOnSuccess).toHaveBeenCalledWith(1);
  });

  it('should handle submission error', async () => {
    const user = userEvent.setup();

    // Mock API error
    vi.mocked(SubgraphService.addResources).mockRejectedValue({
      response: {
        data: {
          message: 'Failed to add resources',
        },
      },
    });

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Select first resource
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // Click Add button
    const addButton = screen.getByRole('button', { name: /Add/i });
    await user.click(addButton);

    // Wait for error handling
    await waitFor(() => {
      expect(SubgraphService.addResources).toHaveBeenCalled();
    });

    // Success callback should not be called
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle cancel', async () => {
    const user = userEvent.setup();

    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    // Check onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable Add button when no resources selected', async () => {
    render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Add button should be disabled
    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).toBeDisabled();
  });

  it('should reset state on close', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    // Select a resource
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // Close modal
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    // Reopen modal
    rerender(
      <AddResourceModal
        visible={true}
        subgraphId={1}
        existingResourceIds={[]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Selection should be reset
    await waitFor(() => {
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });
});
