/**
 * OverviewTab Component
 * 
 * Displays comprehensive overview information about a subgraph.
 * 
 * Features:
 * - Basic information (name, description, tags)
 * - Metadata (business domain, environment, team)
 * - Timestamps (created time, updated time)
 * - Statistics (owner count, resource count)
 * 
 * REQ-FR-024: Display all subgraph information in Overview tab
 */

import React from 'react';
import { Descriptions, Tag, Typography, Space, Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  ClusterOutlined,
  CalendarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { SubgraphDetail } from '@/types/subgraph';

const { Text } = Typography;

/**
 * Props for OverviewTab component
 */
interface OverviewTabProps {
  subgraph: SubgraphDetail;
}

/**
 * Format ISO8601 date string to readable format
 */
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * OverviewTab Component
 * 
 * REQ-FR-024: Display basic information, metadata, timestamps, and statistics
 */
const OverviewTab: React.FC<OverviewTabProps> = ({ subgraph }) => {
  const owners = subgraph.owners || [];
  const viewers = subgraph.viewers || [];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="所有者数量"
                value={owners.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="查看者数量"
                value={viewers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="资源节点数量"
                value={subgraph.resourceCount}
                prefix={<ClusterOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card title="基本信息" size="small">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="子图名称">
              <Text strong>{subgraph.name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="描述">
              {subgraph.description ? (
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {subgraph.description}
                </Text>
              ) : (
                <Text type="secondary">无描述</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="标签">
              {subgraph.tags && subgraph.tags.length > 0 ? (
                <Space wrap>
                  {subgraph.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">无标签</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="版本号">
              <Text code>{subgraph.version}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Metadata */}
        <Card title="元数据" size="small">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="业务域">
              {subgraph.metadata?.businessDomain ? (
                <Tag color="purple">{subgraph.metadata.businessDomain}</Tag>
              ) : (
                <Text type="secondary">未设置</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="环境">
              {subgraph.metadata?.environment ? (
                <Tag color="green">{subgraph.metadata.environment}</Tag>
              ) : (
                <Text type="secondary">未设置</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="团队">
              {subgraph.metadata?.team ? (
                <Tag color="orange">{subgraph.metadata.team}</Tag>
              ) : (
                <Text type="secondary">未设置</Text>
              )}
            </Descriptions.Item>

            {/* Display other metadata fields if present */}
            {subgraph.metadata &&
              Object.entries(subgraph.metadata)
                .filter(
                  ([key]) =>
                    !['businessDomain', 'environment', 'team'].includes(key)
                )
                .map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    <Text>{value}</Text>
                  </Descriptions.Item>
                ))}
          </Descriptions>
        </Card>

        {/* Timestamps and Creator */}
        <Card title="时间信息" size="small">
          <Descriptions column={2} bordered>
            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined />
                  <span>创建时间</span>
                </Space>
              }
            >
              <Text>{formatDate(subgraph.createdAt)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="创建者">
              <Text>
                用户 ID: <Text code>{subgraph.createdBy}</Text>
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <EditOutlined />
                  <span>更新时间</span>
                </Space>
              }
            >
              <Text>{formatDate(subgraph.updatedAt)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="更新次数">
              <Text>
                {subgraph.version > 1 ? (
                  <Text type="success">{subgraph.version - 1} 次</Text>
                ) : (
                  <Text type="secondary">未更新</Text>
                )}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Owners List */}
        <Card title="所有者列表" size="small">
          {owners.length > 0 ? (
            <Descriptions column={1} bordered>
              {owners.map((owner, index) => (
                <Descriptions.Item
                  key={owner.userId}
                  label={`所有者 ${index + 1}`}
                >
                  <Space>
                    <UserOutlined />
                    <Text strong>{owner.username}</Text>
                    <Text type="secondary">({owner.email})</Text>
                    <Text type="secondary">ID: {owner.userId}</Text>
                  </Space>
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <Text type="secondary">无所有者</Text>
          )}
        </Card>

        {/* Viewers List */}
        <Card title="查看者列表" size="small">
          {viewers.length > 0 ? (
            <Descriptions column={1} bordered>
              {viewers.map((viewer, index) => (
                <Descriptions.Item
                  key={viewer.userId}
                  label={`查看者 ${index + 1}`}
                >
                  <Space>
                    <UserOutlined />
                    <Text>{viewer.username}</Text>
                    <Text type="secondary">({viewer.email})</Text>
                    <Text type="secondary">ID: {viewer.userId}</Text>
                  </Space>
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <Text type="secondary">无查看者</Text>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default OverviewTab;
