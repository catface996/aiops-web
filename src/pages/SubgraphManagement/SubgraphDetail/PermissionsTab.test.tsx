/**
 * PermissionsTab Component Tests
 * 
 * Tests for the PermissionsTab component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PermissionsTab from './PermissionsTab';
import SubgraphService from '@/services/subgraph';
import type { SubgraphUserInfo } from '@/types/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    updatePermissions: vi.fn(),
  },
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('PermissionsTab', () => {
  const mockOwners: SubgraphUserInfo[] = [
    {
      userId: 1,
      username: 'owner1',
      email: 'owner1@example.com',
    },
    {
      userId: 2,
      username: 'owner2',
      email: 'owner2@example.com',
    },
  ];

  const mockViewers: SubgraphUserInfo[] = [
    {
      userId: 3,
      username: 'viewer1',
      email: 'viewer1@example.com',
    },
  ];

  const defaultProps = {
    subgraphId: 1,
    owners: mockOwners,
    viewers: mockViewers,
    loading: false,
    canManagePermissions: true,
    currentUserId: 1,
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * REQ-FR-032: Display Owner and Viewer lists
   */
  it('should display owner and viewer lists', () => {
    render(<PermissionsTab {...defaultProps} />);

    // Check owners section
    expect(screen.getByText('owner1')).toBeInTheDocument();
    expect(screen.getByText('owner1@example.com')).toBeInTheDocument();
    expect(screen.getByText('owner2')).toBeInTheDocument();
    expect(screen.getByText('owner2@example.com')).toBeInTheDocument();

    // Check viewers section
    expect(screen.getByText('viewer1')).toBeInTheDocument();
    expect(screen.getByText('viewer1@example.com')).toBeInTheDocument();
  });

  /**
   * REQ-FR-032: Display empty state when no owners
   */
  it('should display empty state when no owners', () => {
    render(
      <PermissionsTab
        {...defaultProps}
        owners={[]}
      />
    );

    expect(screen.getByText('暂无所有者')).toBeInTheDocument();
  });

  /**
   * REQ-FR-032: Display empty state when no viewers
   */
  it('should display empty state when no viewers', () => {
    render(
      <PermissionsTab
        {...defaultProps}
        viewers={[]}
      />
    );

    expect(screen.getByText('暂无查看者')).toBeInTheDocument();
  });

  /**
   * REQ-FR-039: Display add owner button for users with permission
   */
  it('should display add owner button when user can manage permissions', () => {
    render(<PermissionsTab {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /添加所有者/ });
    expect(addButton).toBeInTheDocument();
  });

  /**
   * REQ-FR-039: Hide add owner button for users without permission
   */
  it('should hide add owner button when user cannot manage permissions', () => {
    render(
      <PermissionsTab
        {...defaultProps}
        canManagePermissions={false}
      />
    );

    const addButton = screen.queryByRole('button', { name: /添加所有者/ });
    expect(addButton).not.toBeInTheDocument();
  });

  /**
   * REQ-FR-040: Open add owner modal when add button clicked
   */
  it('should open add owner modal when add button clicked', async () => {
    render(<PermissionsTab {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /添加所有者/ });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/搜索用户并添加为所有者/)).toBeInTheDocument();
    });
  });

  /**
   * REQ-FR-041: Display remove button for each owner
   */
  it('should display remove button for each owner when user can manage permissions', () => {
    render(<PermissionsTab {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /移除/ });
    expect(removeButtons).toHaveLength(2); // Two owners
  });

  /**
   * REQ-FR-041: Hide remove buttons when user cannot manage permissions
   */
  it('should hide remove buttons when user cannot manage permissions', () => {
    render(
      <PermissionsTab
        {...defaultProps}
        canManagePermissions={false}
      />
    );

    const removeButtons = screen.queryAllByRole('button', { name: /移除/ });
    expect(removeButtons).toHaveLength(0);
  });

  /**
   * REQ-FR-042: Disable remove button for last owner
   */
  it('should disable remove button when only one owner exists', () => {
    const singleOwner = [mockOwners[0]];
    const { container } = render(
      <PermissionsTab
        {...defaultProps}
        owners={singleOwner}
      />
    );

    const removeButton = container.querySelector('button[disabled]');
    expect(removeButton).toBeInTheDocument();
  });

  /**
   * REQ-FR-042: Enable remove button when multiple owners exist
   */
  it('should enable remove button when multiple owners exist', () => {
    render(<PermissionsTab {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /移除/ });
    removeButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  /**
   * REQ-FR-041: Show confirmation dialog when removing owner
   */
  it('should show confirmation dialog when removing owner', async () => {
    render(<PermissionsTab {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /移除/ });
    fireEvent.click(removeButtons[1]); // Click second owner's remove button

    await waitFor(() => {
      expect(screen.getAllByText('确认移除所有者').length).toBeGreaterThan(0);
      expect(screen.getByText(/确定要移除 owner2 的所有者权限吗/)).toBeInTheDocument();
    });
  });

  /**
   * REQ-FR-041: Call API to remove owner when confirmed
   */
  it('should call API to remove owner when confirmed', async () => {
    const mockUpdatePermissions = vi.mocked(SubgraphService.updatePermissions);
    mockUpdatePermissions.mockResolvedValue();

    render(<PermissionsTab {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /移除/ });
    fireEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(screen.getAllByText('确认移除所有者').length).toBeGreaterThan(0);
    });

    // Find the confirm button by text content
    const confirmButton = screen.getByText('确 认').closest('button');
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(mockUpdatePermissions).toHaveBeenCalledWith(1, {
        removeOwners: [2],
      });
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  /**
   * REQ-FR-032: Mark current user in owner list
   */
  it('should mark current user in owner list', () => {
    render(<PermissionsTab {...defaultProps} />);

    expect(screen.getByText('(当前用户)')).toBeInTheDocument();
  });

  /**
   * Display loading state
   */
  it('should display loading state when loading', () => {
    const { container } = render(
      <PermissionsTab
        {...defaultProps}
        loading={true}
      />
    );

    // Check for loading spinner
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  /**
   * Display owner and viewer counts
   */
  it('should display owner and viewer counts', () => {
    render(<PermissionsTab {...defaultProps} />);

    expect(screen.getByText(/所有者 \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/查看者 \(1\)/)).toBeInTheDocument();
  });
});
