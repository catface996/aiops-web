/**
 * ResourceNodesTab Component Tests
 * 
 * Tests for the ResourceNodesTab component functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message, Modal } from 'antd';
import ResourceNodesTab from './ResourceNodesTab';
import SubgraphService from '@/services/subgraph';
import type { ResourceInfo } from '@/types/subgraph';

// Mock the SubgraphService
vi.mock('@/services/subgraph', () => ({
  default: {
    removeResources: vi.fn(),
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
    },
  };
});

describe('ResourceNodesTab', () => {
  const mockResources: ResourceInfo[] = [
    {
      resourceId: 1,
      name: 'Server-01',
      type: 'Server',
      status: 'running',
      addedAt: '2024-12-01T10:00:00Z',
      addedBy: 1,
    },
    {
      resourceId: 2,
      name: 'App-API',
      type: 'Application',
      status: 'running',
      addedAt: '2024-12-02T11:00:00Z',
      addedBy: 2,
    },
    {
      resourceId: 3,
      name: 'DB-Main',
      type: 'Database',
      status: 'stopped',
      addedAt: '2024-12-03T12:00:00Z',
      addedBy: 1,
    },
  ];

  const defaultProps = {
    subgraphId: 1,
    resources: mockResources,
    loading: false,
    canRemoveNode: true,
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render resource nodes table with all columns', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      // Check table headers
      expect(screen.getByText('节点名称')).toBeInTheDocument();
      expect(screen.getByText('类型')).toBeInTheDocument();
      expect(screen.getByText('状态')).toBeInTheDocument();
      expect(screen.getByText('添加时间')).toBeInTheDocument();
      expect(screen.getByText('添加者')).toBeInTheDocument();
      expect(screen.getByText('操作')).toBeInTheDocument();

      // Check resource data
      expect(screen.getByText('Server-01')).toBeInTheDocument();
      expect(screen.getByText('App-API')).toBeInTheDocument();
      expect(screen.getByText('DB-Main')).toBeInTheDocument();
    });

    it('should display resource count', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      expect(screen.getByText('共 3 个资源节点')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<ResourceNodesTab {...defaultProps} loading={true} />);

      // Ant Design Table shows loading spinner
      const table = document.querySelector('.ant-spin-container');
      expect(table).toBeInTheDocument();
    });

    it('should show empty state when no resources', () => {
      render(<ResourceNodesTab {...defaultProps} resources={[]} />);

      expect(screen.getByText('此子图暂无资源节点')).toBeInTheDocument();
    });

    it('should show add button in empty state when user can add nodes', () => {
      render(<ResourceNodesTab {...defaultProps} resources={[]} />);

      expect(screen.getByText('添加资源节点')).toBeInTheDocument();
    });

    it('should not show add button in empty state when user cannot add nodes', () => {
      render(<ResourceNodesTab {...defaultProps} resources={[]} canRemoveNode={false} />);

      expect(screen.queryByText('添加资源节点')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter resources by name', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜索资源节点名称');
      fireEvent.change(searchInput, { target: { value: 'Server' } });

      // Should show only Server-01
      expect(screen.getByText('Server-01')).toBeInTheDocument();
      expect(screen.queryByText('App-API')).not.toBeInTheDocument();
      expect(screen.queryByText('DB-Main')).not.toBeInTheDocument();

      // Should update count
      expect(screen.getByText('共 1 个资源节点')).toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜索资源节点名称');
      fireEvent.change(searchInput, { target: { value: 'server' } });

      expect(screen.getByText('Server-01')).toBeInTheDocument();
    });

    it('should show empty state when search has no results', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜索资源节点名称');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      expect(screen.getByText(/未找到包含 "NonExistent" 的资源节点/)).toBeInTheDocument();
      expect(screen.getByText('清除搜索')).toBeInTheDocument();
    });

    it('should clear search when clicking clear button', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('搜索资源节点名称');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      const clearButton = screen.getByText('清除搜索');
      fireEvent.click(clearButton);

      // Should show all resources again
      expect(screen.getByText('Server-01')).toBeInTheDocument();
      expect(screen.getByText('App-API')).toBeInTheDocument();
      expect(screen.getByText('DB-Main')).toBeInTheDocument();
    });
  });

  describe('Remove Functionality', () => {
    it('should show remove button when user can remove nodes', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      const removeButtons = screen.getAllByText('移除');
      expect(removeButtons).toHaveLength(3);
    });

    it('should not show remove button when user cannot remove nodes', () => {
      render(<ResourceNodesTab {...defaultProps} canRemoveNode={false} />);

      expect(screen.queryByText('移除')).not.toBeInTheDocument();
    });

    it('should show confirmation modal when clicking remove', async () => {
      const modalConfirmSpy = vi.spyOn(Modal, 'confirm');

      render(<ResourceNodesTab {...defaultProps} />);

      const removeButtons = screen.getAllByText('移除');
      fireEvent.click(removeButtons[0]);

      expect(modalConfirmSpy).toHaveBeenCalled();
      const modalConfig = modalConfirmSpy.mock.calls[0][0];
      expect(modalConfig.title).toBe('移除资源节点');
    });

    it('should call removeResources API when confirmed', async () => {
      const mockRemoveResources = vi.mocked(SubgraphService.removeResources);
      mockRemoveResources.mockResolvedValue();

      // Mock Modal.confirm to immediately call onOk
      const modalConfirmSpy = vi.spyOn(Modal, 'confirm').mockImplementation((config: any) => {
        config.onOk();
        return {} as any;
      });

      render(<ResourceNodesTab {...defaultProps} />);

      const removeButtons = screen.getAllByText('移除');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockRemoveResources).toHaveBeenCalledWith(1, [1]);
      });

      modalConfirmSpy.mockRestore();
    });

    it('should show success message and refresh after successful removal', async () => {
      const mockRemoveResources = vi.mocked(SubgraphService.removeResources);
      mockRemoveResources.mockResolvedValue();

      const mockOnRefresh = vi.fn();

      // Mock Modal.confirm to immediately call onOk
      const modalConfirmSpy = vi.spyOn(Modal, 'confirm').mockImplementation((config: any) => {
        config.onOk();
        return {} as any;
      });

      render(<ResourceNodesTab {...defaultProps} onRefresh={mockOnRefresh} />);

      const removeButtons = screen.getAllByText('移除');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('资源节点移除成功');
        expect(mockOnRefresh).toHaveBeenCalled();
      });

      modalConfirmSpy.mockRestore();
    });

    it('should show error message when removal fails', async () => {
      const mockRemoveResources = vi.mocked(SubgraphService.removeResources);
      mockRemoveResources.mockRejectedValue(new Error('Network error'));

      // Mock Modal.confirm to immediately call onOk
      const modalConfirmSpy = vi.spyOn(Modal, 'confirm').mockImplementation((config: any) => {
        config.onOk();
        return {} as any;
      });

      render(<ResourceNodesTab {...defaultProps} />);

      const removeButtons = screen.getAllByText('移除');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Network error');
      });

      modalConfirmSpy.mockRestore();
    });
  });

  describe('Status Display', () => {
    it('should display status with correct color', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      // Check that status tags are rendered
      const statusTags = document.querySelectorAll('.ant-tag');
      expect(statusTags.length).toBeGreaterThan(0);
    });

    it('should format date correctly', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      // Check that dates are formatted (exact format depends on locale)
      const dateElements = screen.getAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      // Ant Design pagination should be present
      const pagination = document.querySelector('.ant-pagination');
      expect(pagination).toBeInTheDocument();
    });

    it('should show total count in pagination', () => {
      render(<ResourceNodesTab {...defaultProps} />);

      expect(screen.getByText('共 3 条')).toBeInTheDocument();
    });
  });
});
