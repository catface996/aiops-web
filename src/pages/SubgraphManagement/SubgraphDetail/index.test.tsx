/**
 * SubgraphDetail Component Tests
 * 
 * Tests for the SubgraphDetail page component.
 * 
 * REQ-FR-021: Detail page layout
 * REQ-FR-022: Tab definitions
 * REQ-FR-023: Tab URL synchronization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SubgraphDetail from './index';
import * as useSubgraphDetailHook from '@/hooks/subgraph/useSubgraphDetail';

// Mock the useSubgraphDetail hook
vi.mock('@/hooks/subgraph/useSubgraphDetail');

// Mock Ant Design components that use portals
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

describe('SubgraphDetail Component', () => {
  const mockSubgraph = {
    id: 1,
    name: 'Test Subgraph',
    description: 'Test description',
    tags: ['tag1', 'tag2'],
    metadata: { businessDomain: 'test' },
    createdBy: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    version: 1,
    owners: [
      { userId: 1, username: 'owner1', email: 'owner1@test.com' },
    ],
    viewers: [
      { userId: 2, username: 'viewer1', email: 'viewer1@test.com' },
    ],
    resources: [],
    resourceCount: 0,
  };

  const mockUseSubgraphDetail = {
    subgraph: mockSubgraph,
    loading: false,
    resources: [],
    resourcesLoading: false,
    topologyData: null,
    topologyLoading: false,
    permissions: [],
    permissionsLoading: false,
    fetchDetail: vi.fn(),
    fetchResources: vi.fn(),
    fetchTopology: vi.fn(),
    fetchPermissions: vi.fn(),
    refetch: vi.fn(),
    refetchAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue(mockUseSubgraphDetail);
  });

  const renderComponent = (initialRoute = '/subgraphs/1') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <SubgraphDetail />
      </MemoryRouter>
    );
  };

  /**
   * REQ-FR-021: Detail page layout with breadcrumb, header, and tabs
   */
  it('should render breadcrumb navigation', () => {
    renderComponent();
    expect(screen.getByText('子图管理')).toBeInTheDocument();
    // Use getAllByText since the name appears in both breadcrumb and header
    const subgraphNames = screen.getAllByText('Test Subgraph');
    expect(subgraphNames.length).toBeGreaterThan(0);
  });

  it('should render page header with subgraph name', () => {
    renderComponent();
    const headers = screen.getAllByText('Test Subgraph');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should render page header with description', () => {
    renderComponent();
    expect(screen.getAllByText('Test description').length).toBeGreaterThan(0);
  });

  it('should render action buttons in header', () => {
    renderComponent();
    expect(screen.getByText('编辑')).toBeInTheDocument();
    expect(screen.getByText('添加节点')).toBeInTheDocument();
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  /**
   * REQ-FR-022: Four tabs (Overview, Resource Nodes, Topology, Permissions)
   */
  it('should render all four tabs', () => {
    renderComponent();
    expect(screen.getByText('概览')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /资源节点/ })).toBeInTheDocument();
    expect(screen.getByText('拓扑图')).toBeInTheDocument();
    expect(screen.getByText('权限管理')).toBeInTheDocument();
  });

  it('should display resource count in resources tab label', () => {
    renderComponent();
    expect(screen.getByText('资源节点 (0)')).toBeInTheDocument();
  });

  it('should default to overview tab', () => {
    renderComponent();
    // Overview tab content should be visible - check for statistics cards
    expect(screen.getByText('所有者数量')).toBeInTheDocument();
    expect(screen.getByText('资源节点数量')).toBeInTheDocument();
  });

  /**
   * REQ-FR-023: Tab URL synchronization
   */
  it('should switch tabs when clicked', async () => {
    renderComponent();

    // Click on resources tab
    const resourcesTab = screen.getByRole('tab', { name: /资源节点/ });
    fireEvent.click(resourcesTab);

    await waitFor(() => {
      expect(screen.getByText(/资源节点列表/)).toBeInTheDocument();
    });
  });

  it('should load resources tab from URL parameter', () => {
    renderComponent('/subgraphs/1?tab=resources');
    
    // Resources tab content should be visible
    expect(screen.getByText(/资源节点列表/)).toBeInTheDocument();
  });

  it('should load topology tab from URL parameter', () => {
    renderComponent('/subgraphs/1?tab=topology');
    
    // Topology tab content should be visible
    expect(screen.getByText(/拓扑图可视化/)).toBeInTheDocument();
  });

  it('should load permissions tab from URL parameter', () => {
    renderComponent('/subgraphs/1?tab=permissions');
    
    // Permissions tab content should be visible (use more specific text)
    expect(screen.getByText('权限管理 - 将在 Task 27 中实现')).toBeInTheDocument();
  });

  it('should default to overview tab for invalid tab parameter', () => {
    renderComponent('/subgraphs/1?tab=invalid');
    
    // Overview tab content should be visible - check for statistics cards
    expect(screen.getByText('所有者数量')).toBeInTheDocument();
    expect(screen.getByText('资源节点数量')).toBeInTheDocument();
  });

  /**
   * Loading and error states
   */
  it('should show loading state', () => {
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      loading: true,
      subgraph: null,
    });

    renderComponent();
    
    // Check for loading spinner instead of text (Ant Design Spin doesn't show tip text in this case)
    const spinners = document.querySelectorAll('.ant-spin');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should show 404 error when subgraph not found', () => {
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      loading: false,
      subgraph: null,
    });

    renderComponent();
    
    expect(screen.getByText('子图不存在')).toBeInTheDocument();
    expect(screen.getByText('您访问的子图不存在或已被删除')).toBeInTheDocument();
  });

  /**
   * Lazy loading behavior
   */
  it('should lazy load resources when switching to resources tab', async () => {
    const mockFetchResources = vi.fn();
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      fetchResources: mockFetchResources,
    });

    renderComponent();

    // Click on resources tab
    const resourcesTab = screen.getByRole('tab', { name: /资源节点/ });
    fireEvent.click(resourcesTab);

    await waitFor(() => {
      expect(mockFetchResources).toHaveBeenCalled();
    });
  });

  it('should lazy load topology when switching to topology tab', async () => {
    const mockFetchTopology = vi.fn();
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      fetchTopology: mockFetchTopology,
    });

    renderComponent();

    // Click on topology tab
    const topologyTab = screen.getByText('拓扑图');
    fireEvent.click(topologyTab);

    await waitFor(() => {
      expect(mockFetchTopology).toHaveBeenCalled();
    });
  });

  it('should lazy load permissions when switching to permissions tab', async () => {
    const mockFetchPermissions = vi.fn();
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      fetchPermissions: mockFetchPermissions,
    });

    renderComponent();

    // Click on permissions tab
    const permissionsTab = screen.getByText('权限管理');
    fireEvent.click(permissionsTab);

    await waitFor(() => {
      expect(mockFetchPermissions).toHaveBeenCalled();
    });
  });

  /**
   * Action button handlers
   */
  it('should call refetch when refresh button is clicked', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useSubgraphDetailHook.useSubgraphDetail).mockReturnValue({
      ...mockUseSubgraphDetail,
      refetch: mockRefetch,
    });

    renderComponent();

    // Find and click refresh button (by icon)
    const refreshButtons = document.querySelectorAll('.anticon-reload');
    expect(refreshButtons.length).toBeGreaterThan(0);
    fireEvent.click(refreshButtons[0].parentElement!);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
