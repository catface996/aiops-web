/**
 * Topology Tab Component
 * 
 * Displays the topology graph for a subgraph with empty state handling.
 * 
 * Features:
 * - Topology graph visualization using TopologyCanvas
 * - Empty state when no nodes exist
 * - Empty state when nodes exist but no relationships
 * - Toolbar with layout options and export functionality
 * 
 * REQ-FR-028: Topology tab content with visual representation
 * REQ-FR-029: Display only relationships within subgraph
 * REQ-FR-031-A: Empty state when no nodes
 * REQ-FR-031-B: Empty state when no relationships
 * REQ-FR-031-C: Layout selection options
 * REQ-FR-031-D: Export functionality
 */

import React, { useState, useCallback } from 'react';
import { Button, Space, Select, Tooltip, Spin, message } from 'antd';
import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { TopologyCanvas } from '@/components/SubgraphManagement/Topology/TopologyCanvas';
import EmptyState from '@/components/EmptyState';
import type { TopologyData } from '@/types/topology';

export interface TopologyTabProps {
  topologyData: TopologyData | null;
  loading: boolean;
  onRefresh: () => void;
  onAddNode?: () => void;
  canAddNode?: boolean;
}

type LayoutType = 'force' | 'hierarchical' | 'circular';

/**
 * TopologyTab Component
 * 
 * REQ-FR-028: Render topology graph with nodes and relationships
 * REQ-FR-030: Node click highlighting and double-click navigation
 * REQ-FR-031: Zoom and pan interactions
 * REQ-FR-031-A: Show empty state when no nodes
 * REQ-FR-031-B: Show message when no relationships
 * REQ-NFR-025: Smooth topology graph interactions
 */
const TopologyTab: React.FC<TopologyTabProps> = ({
  topologyData,
  loading,
  onRefresh,
  onAddNode,
  canAddNode = false,
}) => {
  const navigate = useNavigate();
  
  // Layout preference (REQ-FR-031-C)
  const [layout, setLayout] = useState<LayoutType>('force');
  
  // Selected node for highlighting (REQ-FR-030)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  /**
   * Handle export to PNG
   * REQ-FR-031-D: Export topology graph as image
   */
  const handleExportPNG = useCallback(() => {
    // TODO: Implement PNG export in future task
    message.info('PNG export will be available in a future update');
  }, []);

  /**
   * Handle export to SVG
   * REQ-FR-031-D: Export topology graph as image
   */
  const handleExportSVG = useCallback(() => {
    // TODO: Implement SVG export in future task
    message.info('SVG export will be available in a future update');
  }, []);

  /**
   * Handle node click - highlight node and show tooltip
   * REQ-FR-030: Node click highlighting
   * REQ-NFR-025: Smooth interaction with visual feedback
   */
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    // Find node info for feedback
    const node = topologyData?.nodes.find(n => n.id === nodeId);
    if (node) {
      // Visual feedback through selection state
      console.log('Node selected:', node.name);
    }
  }, [topologyData]);

  /**
   * Handle node double click - navigate to resource detail
   * REQ-FR-030: Navigate to resource detail on double click
   * REQ-FR-027: Resource node click navigation
   */
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = topologyData?.nodes.find(n => n.id === nodeId);
    if (node) {
      // Navigate to resource detail page
      navigate(`/resources/${node.resourceId}`);
      message.success(`Opening ${node.name} details`);
    }
  }, [topologyData, navigate]);

  /**
   * Handle canvas click - clear selection
   * REQ-NFR-025: Clear selection on canvas click
   */
  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="加载拓扑数据..." />
      </div>
    );
  }

  // REQ-FR-031-A: Empty state - no nodes in subgraph
  if (!topologyData || topologyData.nodes.length === 0) {
    return (
      <EmptyState
        type="empty"
        title="No nodes in this subgraph"
        description="This subgraph doesn't contain any resource nodes yet. Add nodes to visualize the topology."
        actionText="Add Node"
        onAction={onAddNode}
        showAction={canAddNode}
      />
    );
  }

  // REQ-FR-031-B: Empty state - nodes exist but no relationships
  const hasRelationships = topologyData.edges.length > 0;

  return (
    <div style={{ height: '600px', position: 'relative' }}>
      {/* Toolbar - REQ-FR-031-C, REQ-FR-031-D */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Space>
          {/* Layout Selection - REQ-FR-031-C */}
          <Tooltip title="选择布局算法">
            <Select
              value={layout}
              onChange={setLayout}
              style={{ width: 120 }}
              options={[
                { label: '力导向布局', value: 'force' },
                { label: '层次布局', value: 'hierarchical' },
                { label: '环形布局', value: 'circular' },
              ]}
            />
          </Tooltip>

          {/* Export Options - REQ-FR-031-D */}
          <Tooltip title="导出为PNG">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportPNG}
            >
              PNG
            </Button>
          </Tooltip>

          <Tooltip title="导出为SVG">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportSVG}
            >
              SVG
            </Button>
          </Tooltip>

          {/* Refresh Button */}
          <Tooltip title="刷新拓扑图">
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
            />
          </Tooltip>

          {/* Add Node Button */}
          {canAddNode && (
            <Tooltip title="添加节点">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddNode}
              >
                添加节点
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {/* No Relationships Message - REQ-FR-031-B */}
      {!hasRelationships && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '4px',
            padding: '8px 16px',
            color: '#d46b08',
            fontSize: '14px',
          }}
        >
          No relationships defined between nodes
        </div>
      )}

      {/* Topology Canvas - REQ-FR-028, REQ-FR-030, REQ-FR-031 */}
      <TopologyCanvas
        nodes={topologyData.nodes}
        edges={topologyData.edges}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onCanvasClick={handleCanvasClick}
        readonly={true} // Subgraph topology is read-only
      />
    </div>
  );
};

export default TopologyTab;
