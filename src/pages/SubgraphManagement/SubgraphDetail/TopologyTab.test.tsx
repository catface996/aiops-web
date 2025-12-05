/**
 * TopologyTab Component Tests
 * 
 * Tests for topology tab with empty state handling
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import TopologyTab from './TopologyTab';
import type { TopologyData } from '@/types/topology';

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TopologyTab', () => {
  const mockOnRefresh = vi.fn();
  const mockOnAddNode = vi.fn();

  const mockTopologyData: TopologyData = {
    nodes: [
      {
        id: '1',
        resourceId: 1,
        name: 'Server-1',
        type: 'Server',
        typeCode: 'SERVER',
        status: 'RUNNING',
        position: { x: 100, y: 100 },
      },
      {
        id: '2',
        resourceId: 2,
        name: 'Database-1',
        type: 'Database',
        typeCode: 'DATABASE',
        status: 'RUNNING',
        position: { x: 300, y: 100 },
      },
    ],
    edges: [
      {
        id: 'e1',
        relationId: 1,
        source: '1',
        target: '2',
        sourceAnchor: 'bottom',
        targetAnchor: 'top',
        relationType: 'DEPENDENCY',
        direction: 'UNIDIRECTIONAL',
        strength: 'STRONG',
        status: 'NORMAL',
      },
    ],
  };

  it('should show loading state', () => {
    const { container } = renderWithRouter(
      <TopologyTab
        topologyData={null}
        loading={true}
        onRefresh={mockOnRefresh}
      />
    );

    // Check for loading spinner by class
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show empty state when no nodes exist (REQ-FR-031-A)', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={null}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={true}
      />
    );

    expect(screen.getByText('No nodes in this subgraph')).toBeInTheDocument();
    expect(
      screen.getByText(/doesn't contain any resource nodes yet/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add node/i })).toBeInTheDocument();
  });

  it('should show empty state when nodes array is empty (REQ-FR-031-A)', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={{ nodes: [], edges: [] }}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={true}
      />
    );

    expect(screen.getByText('No nodes in this subgraph')).toBeInTheDocument();
  });

  it('should hide add node button when canAddNode is false', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={null}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={false}
      />
    );

    expect(screen.queryByRole('button', { name: /add node/i })).not.toBeInTheDocument();
  });

  it('should call onAddNode when add node button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TopologyTab
        topologyData={null}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={true}
      />
    );

    const addButton = screen.getByRole('button', { name: /add node/i });
    await user.click(addButton);

    expect(mockOnAddNode).toHaveBeenCalledTimes(1);
  });

  it('should show "no relationships" message when nodes exist but no edges (REQ-FR-031-B)', () => {
    const dataWithNoEdges: TopologyData = {
      nodes: mockTopologyData.nodes,
      edges: [],
    };

    renderWithRouter(
      <TopologyTab
        topologyData={dataWithNoEdges}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('No relationships defined between nodes')).toBeInTheDocument();
  });

  it('should not show "no relationships" message when edges exist', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.queryByText('No relationships defined between nodes')).not.toBeInTheDocument();
  });

  it('should render topology canvas when data exists', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    // Check that toolbar is rendered (indicates canvas is present)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /png/i })).toBeInTheDocument();
  });

  it('should render toolbar with layout options (REQ-FR-031-C)', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    // Layout selector should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render export buttons (REQ-FR-031-D)', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByRole('button', { name: /png/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /svg/i })).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
      />
    );

    // Find refresh button by icon (Tooltip doesn't render accessible name in test)
    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(btn => 
      btn.querySelector('[aria-label="reload"]')
    );
    expect(refreshButton).toBeDefined();
    
    if (refreshButton) {
      await user.click(refreshButton);
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    }
  });

  it('should show add node button in toolbar when canAddNode is true', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={true}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: /添加节点/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('should not show add node button in toolbar when canAddNode is false', () => {
    renderWithRouter(
      <TopologyTab
        topologyData={mockTopologyData}
        loading={false}
        onRefresh={mockOnRefresh}
        onAddNode={mockOnAddNode}
        canAddNode={false}
      />
    );

    expect(screen.queryByRole('button', { name: /添加节点/i })).not.toBeInTheDocument();
  });
});
