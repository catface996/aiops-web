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
import { Descriptions, Tag, Typography, Row, Col, Statistic } from 'antd';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="所有者数量"
            value={owners.length}
            prefix={<UserOutlined />}
            styles={{ content: { color: '#1890ff' } }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="查看者数量"
            value={viewers.length}
            prefix={<UserOutlined />}
            styles={{ content: { color: '#52c41a' } }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="资源节点数量"
            value={subgraph.resourceCount}
            prefix={<ClusterOutlined />}
            styles={{ content: { color: '#faad14' } }}
          />
        </Col>
      </Row>

      {/* Basic Information */}
      <div>
        <Typography.Title level={5} style={{ marginBottom: '12px' }}>
          基本信息
        </Typography.Title>
        <Descriptions column={1} bordered size="small">
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
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {subgraph.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </span>
              ) : (
                <Text type="secondary">无标签</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="版本号">
              <Text code>{subgraph.version}</Text>
            </Descriptions.Item>
          </Descriptions>
      </div>

      {/* Metadata */}
      <div>
        <Typography.Title level={5} style={{ marginBottom: '12px' }}>
          元数据
        </Typography.Title>
        <Descriptions column={1} bordered size="small">
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
      </div>

      {/* Timestamps and Creator */}
      <div>
        <Typography.Title level={5} style={{ marginBottom: '12px' }}>
          时间信息
        </Typography.Title>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item
            label={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined />
                <span>创建时间</span>
              </span>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <EditOutlined />
                <span>更新时间</span>
              </span>
            }
          >
            <Text>{formatDate(subgraph.updatedAt)}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="更新次数">
            {subgraph.version > 1 ? (
              <Text type="success">{subgraph.version - 1} 次</Text>
            ) : (
              <Text type="secondary">未更新</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Owners List */}
      <div>
        <Typography.Title level={5} style={{ marginBottom: '12px' }}>
          所有者列表
        </Typography.Title>
        {owners.length > 0 ? (
          <Descriptions column={1} bordered size="small">
            {owners.map((owner, index) => (
              <Descriptions.Item
                key={owner.userId}
                label={`所有者 ${index + 1}`}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined />
                  <Text strong>{owner.username}</Text>
                  <Text type="secondary">({owner.email})</Text>
                  <Text type="secondary">ID: {owner.userId}</Text>
                </span>
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <Text type="secondary">无所有者</Text>
        )}
      </div>

      {/* Viewers List */}
      <div>
        <Typography.Title level={5} style={{ marginBottom: '12px' }}>
          查看者列表
        </Typography.Title>
        {viewers.length > 0 ? (
          <Descriptions column={1} bordered size="small">
            {viewers.map((viewer, index) => (
              <Descriptions.Item
                key={viewer.userId}
                label={`查看者 ${index + 1}`}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined />
                  <Text>{viewer.username}</Text>
                  <Text type="secondary">({viewer.email})</Text>
                  <Text type="secondary">ID: {viewer.userId}</Text>
                </span>
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <Text type="secondary">无查看者</Text>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
