/**
 * DeleteConfirmModal Component
 * 
 * Modal dialog for deleting a subgraph with two-step confirmation.
 * Requires user to input the exact subgraph name to confirm deletion.
 * 
 * Requirements:
 * - REQ-FR-047: Display "Delete" button for owners
 * - REQ-FR-050: Prevent deletion of non-empty subgraphs
 * - REQ-FR-051: Show confirmation dialog for empty subgraphs
 * - REQ-FR-052: Require exact name input to enable delete button
 * - REQ-FR-053: Execute delete operation with loading state
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Input, Alert, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import SubgraphService from '@/services/subgraph';
import type { SubgraphDetail } from '@/types/subgraph';

const { Text, Paragraph } = Typography;

interface DeleteConfirmModalProps {
  visible: boolean;
  subgraph: SubgraphDetail;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * DeleteConfirmModal - Two-step confirmation modal for deleting subgraphs
 * 
 * Features:
 * - Blocks deletion if subgraph contains resources (REQ-FR-050)
 * - Requires exact name input for confirmation (REQ-FR-052)
 * - Shows warning about irreversible action (REQ-FR-051)
 * - Displays impact information (REQ-FR-056)
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  subgraph,
  onClose,
  onSuccess,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Reset confirmation input when modal opens/closes
  useEffect(() => {
    if (visible) {
      setConfirmName('');
    }
  }, [visible]);

  // Check if subgraph has resources (REQ-FR-050)
  const hasResources = subgraph.resourceCount > 0;

  // Check if name matches (REQ-FR-052)
  const nameMatches = confirmName === subgraph.name;

  // Handle delete operation (REQ-FR-053)
  const handleDelete = useCallback(async () => {
    if (!nameMatches) {
      return;
    }

    try {
      setDeleting(true);

      // Call delete API
      await SubgraphService.deleteSubgraph(subgraph.id);

      // Call success callback
      onSuccess();
    } catch (error) {
      console.error('Failed to delete subgraph:', error);
      // Error handling is done by the parent component
      // which will show appropriate error messages
    } finally {
      setDeleting(false);
    }
  }, [subgraph.id, nameMatches, onSuccess]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (!deleting) {
      setConfirmName('');
      onClose();
    }
  }, [deleting, onClose]);

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Subgraph</span>
        </Space>
      }
      open={visible}
      onOk={handleDelete}
      onCancel={handleCancel}
      confirmLoading={deleting}
      okText="Confirm Delete"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        disabled: !nameMatches || hasResources,
      }}
      width={560}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* REQ-FR-050: Block deletion if subgraph has resources */}
        {hasResources && (
          <Alert
            message="Cannot Delete Subgraph"
            description={
              <Space direction="vertical" size="small">
                <Text>
                  This subgraph contains <Text strong>{subgraph.resourceCount}</Text> resource node(s).
                </Text>
                <Text>
                  Please remove all resources before deleting the subgraph.
                </Text>
              </Space>
            }
            type="error"
            showIcon
          />
        )}

        {/* REQ-FR-051: Warning for empty subgraphs */}
        {!hasResources && (
          <>
            <Alert
              message="Warning: This action cannot be undone"
              description={
                <Space direction="vertical" size="small">
                  <Paragraph style={{ marginBottom: 0 }}>
                    You are about to permanently delete the subgraph <Text strong>"{subgraph.name}"</Text>.
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    This action is irreversible and will:
                  </Paragraph>
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Remove the subgraph and all its metadata</li>
                    <li>Remove all permission associations</li>
                    <li>Remove the subgraph from all users' access lists</li>
                  </ul>
                </Space>
              }
              type="warning"
              showIcon
            />

            {/* REQ-FR-056: Resource nodes preservation notice */}
            <Alert
              message="Resource Nodes Will Be Preserved"
              description="Resource nodes themselves will not be deleted or modified. Only the subgraph association will be removed. Nodes may still be part of other subgraphs."
              type="info"
              showIcon
            />

            {/* REQ-FR-052: Name confirmation input */}
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text>
                To confirm deletion, please type the subgraph name <Text strong code>{subgraph.name}</Text> below:
              </Text>
              <Input
                placeholder="Enter subgraph name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                onPressEnter={nameMatches ? handleDelete : undefined}
                disabled={deleting}
                status={confirmName && !nameMatches ? 'error' : undefined}
                autoFocus
              />
              {confirmName && !nameMatches && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  Name does not match. Please enter the exact name.
                </Text>
              )}
            </Space>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default DeleteConfirmModal;
