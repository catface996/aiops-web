import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

export type EmptyStateType = 'empty' | 'no-results';

export interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states in lists and search results.
 * Supports two scenarios:
 * - 'empty': No data in the list (shows create action)
 * - 'no-results': Search returned no results (shows clear search action)
 * 
 * @example
 * // Empty list scenario
 * <EmptyState
 *   type="empty"
 *   title="No subgraphs found"
 *   description="Get started by creating your first subgraph"
 *   actionText="Create Subgraph"
 *   onAction={handleCreate}
 * />
 * 
 * @example
 * // No search results scenario
 * <EmptyState
 *   type="no-results"
 *   title="No subgraphs match your search"
 *   description="Try adjusting your search criteria"
 *   actionText="Clear Search"
 *   onAction={handleClearSearch}
 * />
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  showAction = true,
}) => {
  // Default configurations for each type
  const defaultConfig = {
    empty: {
      icon: <PlusOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />,
      title: 'No data',
      description: 'Get started by creating a new item',
      actionText: 'Create',
    },
    'no-results': {
      icon: <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />,
      title: 'No results found',
      description: 'Try adjusting your search or filters',
      actionText: 'Clear Search',
    },
  };

  const config = defaultConfig[type];
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: '40px 20px',
      }}
    >
      <Empty
        image={config.icon}
        styles={{
          image: {
            height: 60,
            marginBottom: 16,
          },
        }}
        description={
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'rgba(0, 0, 0, 0.85)',
                marginBottom: 8,
              }}
            >
              {finalTitle}
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'rgba(0, 0, 0, 0.45)',
              }}
            >
              {finalDescription}
            </div>
          </div>
        }
      >
        {showAction && onAction && (
          <Button
            type={type === 'empty' ? 'primary' : 'default'}
            icon={type === 'empty' ? <PlusOutlined /> : undefined}
            onClick={onAction}
          >
            {finalActionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
