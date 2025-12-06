/**
 * PermissionsTab Component
 * 
 * Displays and manages subgraph permissions (Owners and Viewers).
 * 
 * Features:
 * - Display Owner and Viewer lists
 * - Add/Remove Owner functionality (Owner-only)
 * - Last Owner protection
 * - User search and selection
 * 
 * REQ-FR-032: Display Owner and Viewer lists
 * REQ-FR-039: Owner management interface
 * REQ-FR-040: Add Owner functionality
 * REQ-FR-041: Remove Owner functionality
 * REQ-FR-042: Last Owner protection
 */

import React, { useState } from 'react';
import {
  List,
  Avatar,
  Button,
  Space,
  Typography,
  Modal,
  Input,
  message,
  Tooltip,
  Empty,
  Spin,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { SubgraphUserInfo } from '@/types/subgraph';
import SubgraphService from '@/services/subgraph';

const { Title, Text } = Typography;

interface PermissionsTabProps {
  subgraphId: number;
  owners: SubgraphUserInfo[];
  viewers: SubgraphUserInfo[];
  loading: boolean;
  canManagePermissions: boolean;
  currentUserId: number;
  onRefresh: () => void;
}

/**
 * PermissionsTab Component
 * 
 * REQ-FR-032: Display Owner and Viewer lists with user information
 */
const PermissionsTab: React.FC<PermissionsTabProps> = ({
  subgraphId,
  owners: ownersProps,
  viewers: viewersProps,
  loading,
  canManagePermissions,
  currentUserId,
  onRefresh,
}) => {
  // Ensure arrays are never undefined
  const owners = ownersProps || [];
  const viewers = viewersProps || [];

  const [addOwnerModalVisible, setAddOwnerModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SubgraphUserInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handle add owner button click
   * REQ-FR-040: Open user selection dialog
   */
  const handleAddOwnerClick = () => {
    setAddOwnerModalVisible(true);
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedUserId(null);
  };

  /**
   * Handle user search
   * REQ-FR-040: Search functionality to find users
   */
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setSearching(true);
    try {
      // TODO: Replace with actual user search API
      // For now, using mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults: SubgraphUserInfo[] = [
        {
          userId: 101,
          username: 'user1',
          email: 'user1@example.com',
        },
        {
          userId: 102,
          username: 'user2',
          email: 'user2@example.com',
        },
      ].filter(
        (user) =>
          user.username.includes(searchKeyword) ||
          user.email.includes(searchKeyword)
      );

      setSearchResults(mockResults);

      if (mockResults.length === 0) {
        message.info('未找到匹配的用户');
      }
    } catch (error) {
      message.error('搜索用户失败');
      console.error('Search users error:', error);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Handle add owner submission
   * REQ-FR-040: Add selected user as Owner
   */
  const handleAddOwner = async () => {
    if (!selectedUserId) {
      message.warning('请选择要添加的用户');
      return;
    }

    // Check if user is already an owner
    if (owners.some((owner) => owner.userId === selectedUserId)) {
      message.warning('该用户已经是所有者');
      return;
    }

    setSubmitting(true);
    try {
      await SubgraphService.updatePermissions(subgraphId, {
        addOwners: [selectedUserId],
      });

      message.success('添加所有者成功');
      setAddOwnerModalVisible(false);
      onRefresh();
    } catch (error) {
      message.error('添加所有者失败');
      console.error('Add owner error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle remove owner
   * REQ-FR-041: Remove user from Owner list
   * REQ-FR-042: Prevent removing last Owner
   */
  const handleRemoveOwner = (userId: number) => {
    // REQ-FR-042: Last Owner protection
    if (owners.length === 1) {
      message.warning('无法移除最后一个所有者，请先添加其他所有者');
      return;
    }

    const ownerToRemove = owners.find((owner) => owner.userId === userId);
    if (!ownerToRemove) {
      return;
    }

    Modal.confirm({
      title: '确认移除所有者',
      content: `确定要移除 ${ownerToRemove.username} 的所有者权限吗？`,
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await SubgraphService.updatePermissions(subgraphId, {
            removeOwners: [userId],
          });

          message.success('移除所有者成功');
          onRefresh();
        } catch (error) {
          message.error('移除所有者失败');
          console.error('Remove owner error:', error);
        }
      },
    });
  };

  /**
   * Render owner list item
   */
  const renderOwnerItem = (owner: SubgraphUserInfo) => {
    const isCurrentUser = owner.userId === currentUserId;
    const isLastOwner = owners.length === 1;

    return (
      <List.Item
        actions={
          canManagePermissions
            ? [
                <Tooltip
                  title={
                    isLastOwner
                      ? '无法移除最后一个所有者'
                      : '移除所有者'
                  }
                  key="remove"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveOwner(owner.userId)}
                    disabled={isLastOwner}
                  >
                    移除
                  </Button>
                </Tooltip>,
              ]
            : []
        }
      >
        <List.Item.Meta
          avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#b7eb8f' }} />}
          title={
            <Space size={4}>
              {owner.username}
              {isCurrentUser && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (当前用户)
                </Text>
              )}
            </Space>
          }
          description={
            <Space size={4}>
              <MailOutlined />
              {owner.email}
            </Space>
          }
        />
      </List.Item>
    );
  };

  /**
   * Render viewer list item
   */
  const renderViewerItem = (viewer: SubgraphUserInfo) => {
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#91caff' }} />}
          title={viewer.username}
          description={
            <Space size={4}>
              <MailOutlined />
              {viewer.email}
            </Space>
          }
        />
      </List.Item>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="加载权限信息..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Owner Section - REQ-FR-032 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Title level={5} style={{ margin: 0 }}>所有者</Title>
            {canManagePermissions && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddOwnerClick}
              >
                添加所有者
              </Button>
            )}
          </div>
          {owners.length === 0 ? (
            <Empty description="暂无所有者" />
          ) : (
            <List
              dataSource={owners}
              renderItem={renderOwnerItem}
            />
          )}
        </div>

        {/* Viewer Section - REQ-FR-032 */}
        <div style={{ flex: 1 }}>
          <Title level={5}>查看者</Title>
          {viewers.length === 0 ? (
            <Empty description="暂无查看者" />
          ) : (
            <List
              dataSource={viewers}
              renderItem={renderViewerItem}
            />
          )}
        </div>
      </div>

      {/* Add Owner Modal - REQ-FR-040 */}
      <Modal
        title="添加所有者"
        open={addOwnerModalVisible}
        onCancel={() => setAddOwnerModalVisible(false)}
        onOk={handleAddOwner}
        confirmLoading={submitting}
        okText="添加"
        cancelText="取消"
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Text type="secondary">
            搜索用户并添加为所有者。所有者拥有编辑、删除子图和管理资源节点的权限。
          </Text>

          <Input.Search
            placeholder="输入用户名或邮箱搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            loading={searching}
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
            }
          />

          {searchResults.length > 0 && (
            <List
              dataSource={searchResults}
              renderItem={(user) => {
                const isAlreadyOwner = owners.some(
                  (owner) => owner.userId === user.userId
                );
                const isSelected = selectedUserId === user.userId;

                return (
                  <List.Item
                    style={{
                      cursor: isAlreadyOwner ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected
                        ? '#e6f7ff'
                        : isAlreadyOwner
                        ? '#f5f5f5'
                        : 'transparent',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                    onClick={() => {
                      if (!isAlreadyOwner) {
                        setSelectedUserId(user.userId);
                      }
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space size={4}>
                          {user.username}
                          {isAlreadyOwner && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              (已是所有者)
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Space size={4}>
                          <MailOutlined />
                          {user.email}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsTab;
