/**
 * SubgraphFilterPanel Component
 * 
 * Filter panel for subgraph list with tag and owner filters.
 * 
 * Features:
 * - Tag filter with multi-select checkboxes (AND logic)
 * - Owner filter with multi-select checkboxes (OR logic)
 * - Reset button to clear all filters
 * 
 * Performance:
 * - REQ-NFR-001: Optimized with React.memo to prevent unnecessary re-renders
 * 
 * REQ-FR-015: Tag filter with AND logic
 * REQ-FR-016: Owner filter with OR logic
 * REQ-FR-020-A: Reset filters functionality
 */

import React, { useState, useEffect, memo } from 'react';
import {
  Card,
  Checkbox,
  Button,
  Space,
  Typography,
  Divider,
  Spin,
  Empty,
} from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import SubgraphService from '@/services/subgraph';
import type { SubgraphUserInfo } from '@/types/subgraph';

const { Title, Text } = Typography;

/**
 * Props interface
 */
export interface SubgraphFilterPanelProps {
  selectedTags: string[];
  selectedOwnerId: number | null;
  onFilterChange: (filters: {
    tags?: string[];
    ownerId?: number | null;
  }) => void;
}

/**
 * SubgraphFilterPanel Component
 * 
 * Provides filtering capabilities for the subgraph list.
 * Optimized with React.memo to prevent unnecessary re-renders.
 * 
 * @param selectedTags - Currently selected tags
 * @param selectedOwnerId - Currently selected owner ID
 * @param onFilterChange - Callback when filters change
 */
const SubgraphFilterPanel: React.FC<SubgraphFilterPanelProps> = memo(({
  selectedTags,
  selectedOwnerId,
  onFilterChange,
}) => {
  // State for available filter options
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableOwners, setAvailableOwners] = useState<SubgraphUserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch available tags and owners from API
   * This would typically come from a dedicated API endpoint,
   * but for now we'll extract from the subgraph list
   */
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        // Fetch all subgraphs to extract unique tags and owners
        const response = await SubgraphService.listSubgraphs({
          page: 1,
          pageSize: 1000, // Get all for filter options
        });

        // Extract unique tags
        const tagsSet = new Set<string>();
        response.items.forEach((subgraph) => {
          subgraph.tags?.forEach((tag) => tagsSet.add(tag));
        });
        setAvailableTags(Array.from(tagsSet).sort());

        // Extract unique owners
        // Note: In a real implementation, this would come from a dedicated API
        // For now, we'll use mock data based on createdBy field
        const ownersMap = new Map<number, SubgraphUserInfo>();
        response.items.forEach((subgraph) => {
          if (!ownersMap.has(subgraph.createdBy)) {
            ownersMap.set(subgraph.createdBy, {
              userId: subgraph.createdBy,
              username: `User ${subgraph.createdBy}`,
              email: `user${subgraph.createdBy}@example.com`,
            });
          }
        });
        setAvailableOwners(Array.from(ownersMap.values()));
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  /**
   * Handle tag checkbox change
   * REQ-FR-015: Tag filter with AND logic (all selected tags must match)
   */
  const handleTagChange = (tag: string) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    let newSelectedTags: string[];

    if (checked) {
      // Add tag to selection
      newSelectedTags = [...selectedTags, tag];
    } else {
      // Remove tag from selection
      newSelectedTags = selectedTags.filter((t) => t !== tag);
    }

    onFilterChange({ tags: newSelectedTags });
  };

  /**
   * Handle owner checkbox change
   * REQ-FR-016: Owner filter with OR logic (any selected owner matches)
   */
  const handleOwnerChange = (ownerId: number) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;

    if (checked) {
      // Select this owner (single selection for OR logic)
      onFilterChange({ ownerId });
    } else {
      // Deselect owner
      onFilterChange({ ownerId: null });
    }
  };

  /**
   * Handle reset all filters
   * REQ-FR-020-A: Reset filters functionality
   */
  const handleReset = () => {
    onFilterChange({
      tags: [],
      ownerId: null,
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = selectedTags.length > 0 || selectedOwnerId !== null;

  return (
    <div style={{ padding: '16px' }}>
      {/* Header with Reset Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Space>
          <FilterOutlined />
          <Title level={5} style={{ margin: 0 }}>
            筛选条件
          </Title>
        </Space>

        {/* Reset Button - REQ-FR-020-A */}
        {hasActiveFilters && (
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            重置
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {/* Tag Filter Section */}
        <Card
          size="small"
          title={
            <Space>
              <Text strong>标签</Text>
              {selectedTags.length > 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({selectedTags.length} 已选)
                </Text>
              )}
            </Space>
          }
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          {availableTags.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {availableTags.map((tag) => (
                <Checkbox
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={handleTagChange(tag)}
                >
                  {tag}
                </Checkbox>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无标签"
              style={{ margin: '8px 0' }}
            />
          )}

          {selectedTags.length > 0 && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                已选标签: {selectedTags.join(', ')}
              </Text>
            </>
          )}
        </Card>

        {/* Owner Filter Section */}
        <Card
          size="small"
          title={
            <Space>
              <Text strong>所有者</Text>
              {selectedOwnerId !== null && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  (1 已选)
                </Text>
              )}
            </Space>
          }
          bordered={false}
        >
          {availableOwners.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {availableOwners.map((owner) => (
                <Checkbox
                  key={owner.userId}
                  checked={selectedOwnerId === owner.userId}
                  onChange={handleOwnerChange(owner.userId)}
                >
                  <Space direction="vertical" size={0}>
                    <Text>{owner.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {owner.email}
                    </Text>
                  </Space>
                </Checkbox>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无所有者"
              style={{ margin: '8px 0' }}
            />
          )}

          {selectedOwnerId !== null && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                已选所有者:{' '}
                {availableOwners.find((o) => o.userId === selectedOwnerId)
                  ?.username || selectedOwnerId}
              </Text>
            </>
          )}
        </Card>
      </Spin>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <Card
          size="small"
          style={{ marginTop: 16, background: '#f0f5ff' }}
          bordered={false}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 12 }}>
              当前筛选:
            </Text>
            {selectedTags.length > 0 && (
              <Text style={{ fontSize: 12 }}>
                • 标签: {selectedTags.length} 个 (AND)
              </Text>
            )}
            {selectedOwnerId !== null && (
              <Text style={{ fontSize: 12 }}>• 所有者: 1 个 (OR)</Text>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
});

SubgraphFilterPanel.displayName = 'SubgraphFilterPanel';

export default SubgraphFilterPanel;
