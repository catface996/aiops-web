/**
 * 资源详情页面
 * 需求: REQ-FR-026, REQ-FR-027, REQ-FR-028
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Typography,
  Breadcrumb,
  Button,
  Space,
  Tabs,
  Spin,
  Result,
  Descriptions,
  Tag,
  Select,
  Form,
  Input,
  message,
  Empty,
  Timeline,
  List,
  Avatar,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useResourceDetail } from '@/hooks/useResourceDetail'
import { ResourceTypeIcon } from '@/components/ResourceTypeIcon'
import { StatusBadge } from '@/components/StatusBadge'
import { SensitiveField } from '@/components/SensitiveField'
import { isResourceOwner, isAdmin } from '@/components/PermissionGuard'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { formatDateTime, parseResourceAttributes } from '@/utils/resourceFormat'
import { stringifyResourceAttributes } from '@/utils/resourceFormat'
import type { ResourceStatus, ResourceFormData, ResourceAttributeField } from '@/types'
import { ResourceStatusDisplay, ResourceTypeAttributes } from '@/types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// Tab配置
const TAB_KEYS = ['overview', 'config', 'topology', 'agent', 'tasks', 'permissions'] as const
type TabKey = (typeof TAB_KEYS)[number]

const TAB_LABELS: Record<TabKey, string> = {
  overview: '概览',
  config: '配置',
  topology: '拓扑',
  agent: 'Agent',
  tasks: '任务',
  permissions: '权限',
}

/**
 * ResourceDetailPage 组件
 * 资源详情页面
 */
const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  // 解析ID
  const resourceId = id ? parseInt(id, 10) : null

  // 资源详情数据
  const { resource, loading, error, refresh, update, updateStatus, deleteResource } =
    useResourceDetail(resourceId)

  // 编辑状态
  const [editing, setEditing] = useState(false)
  const [editForm] = Form.useForm<ResourceFormData>()
  const [submitting, setSubmitting] = useState(false)

  // 删除确认弹窗
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // 当前Tab
  const currentTab = (searchParams.get('tab') as TabKey) || 'overview'

  // URL参数中的edit标志
  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam === 'true' && resource) {
      setEditing(true)
      // 初始化表单
      const attributes = parseResourceAttributes(resource.attributes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editForm.setFieldsValue({
        name: resource.name,
        description: resource.description || '',
        resourceTypeId: resource.resourceTypeId,
        attributes,
      } as any)
      // 清除edit参数
      searchParams.delete('edit')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, resource, editForm, setSearchParams])

  // Tab切换
  const handleTabChange = (key: string) => {
    searchParams.set('tab', key)
    setSearchParams(searchParams)
  }

  // 开始编辑
  const handleEdit = () => {
    if (!resource) return
    const attributes = parseResourceAttributes(resource.attributes)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editForm.setFieldsValue({
      name: resource.name,
      description: resource.description || '',
      resourceTypeId: resource.resourceTypeId,
      attributes,
    } as any)
    setEditing(true)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditing(false)
    editForm.resetFields()
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!resource) return
    try {
      const values = await editForm.validateFields()
      setSubmitting(true)
      await update({
        name: values.name,
        description: values.description || undefined,
        attributes: stringifyResourceAttributes(values.attributes),
        version: resource.version,
      })
      setEditing(false)
    } catch (err) {
      // 表单验证失败或更新失败
      if (err instanceof Error && err.message.includes('version')) {
        message.error('资源已被其他人修改，请刷新后重试')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 状态变更
  const handleStatusChange = async (status: ResourceStatus) => {
    try {
      await updateStatus(status)
    } catch {
      // 错误已在hook中处理
    }
  }

  // 删除资源
  const handleDelete = async (confirmName: string) => {
    try {
      await deleteResource(confirmName)
      setDeleteModalOpen(false)
      navigate('/resources')
    } catch {
      // 错误已在hook中处理
    }
  }

  // 权限检查
  const canEdit = useCallback(() => {
    if (!user || !resource) return false
    return isResourceOwner(resource, user.userId) || isAdmin(user.role)
  }, [user, resource])

  const canDelete = useCallback(() => {
    if (!user || !resource) return false
    return isResourceOwner(resource, user.userId) || isAdmin(user.role)
  }, [user, resource])

  // 加载中
  if (loading && !resource) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  // 加载失败
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Result
          status="error"
          title="加载失败"
          subTitle={error.message}
          extra={
            <Space>
              <Button onClick={refresh}>重试</Button>
              <Button type="primary" onClick={() => navigate('/resources')}>
                返回列表
              </Button>
            </Space>
          }
        />
      </div>
    )
  }

  // 资源不存在
  if (!resource) {
    return (
      <div style={{ padding: '24px' }}>
        <Result
          status="404"
          title="资源不存在"
          subTitle="请求的资源不存在或已被删除"
          extra={
            <Button type="primary" onClick={() => navigate('/resources')}>
              返回列表
            </Button>
          }
        />
      </div>
    )
  }

  // 获取扩展属性配置
  const attributeFields: ResourceAttributeField[] =
    ResourceTypeAttributes[resource.resourceTypeCode] || []

  // 解析attributes
  const parsedAttributes = parseResourceAttributes(resource.attributes)

  // 渲染概览Tab
  const renderOverviewTab = () => (
    <div>
      {editing ? (
        <Form
          form={editForm}
          layout="vertical"
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="name"
            label="资源名称"
            rules={[
              { required: true, message: '请输入资源名称' },
              { min: 2, message: '资源名称至少2个字符' },
              { max: 100, message: '资源名称最多100个字符' },
            ]}
          >
            <Input placeholder="请输入资源名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 500, message: '描述最多500个字符' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      ) : (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="资源名称">{resource.name}</Descriptions.Item>
          <Descriptions.Item label="资源类型">
            <Space size={4}>
              <ResourceTypeIcon type={resource.resourceTypeCode} size={14} />
              <span>{resource.resourceTypeName}</span>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {canEdit() ? (
              <Select
                value={resource.status}
                onChange={handleStatusChange}
                style={{ width: 120 }}
                size="small"
              >
                {Object.entries(ResourceStatusDisplay).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <StatusBadge status={resource.status} />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="版本">v{resource.version}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {resource.description || <Text type="secondary">暂无描述</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDateTime(resource.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatDateTime(resource.updatedAt)}</Descriptions.Item>
          <Descriptions.Item label="创建者">{resource.createdBy || '-'}</Descriptions.Item>
          <Descriptions.Item label="更新者">{resource.createdBy || '-'}</Descriptions.Item>
        </Descriptions>
      )}

      {/* 操作历史 */}
      {!editing && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>操作历史</Title>
          <Timeline
            items={[
              {
                children: (
                  <div>
                    <Text>更新资源</Text>
                    <br />
                    <Text type="secondary">{formatDateTime(resource.updatedAt)}</Text>
                  </div>
                ),
              },
              {
                children: (
                  <div>
                    <Text>创建资源</Text>
                    <br />
                    <Text type="secondary">{formatDateTime(resource.createdAt)}</Text>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  )

  // 渲染配置Tab
  const renderConfigTab = () => {
    if (attributeFields.length === 0) {
      return <Empty description="该资源类型没有扩展配置" />
    }

    if (editing) {
      return (
        <Form
          form={editForm}
          layout="vertical"
          style={{ maxWidth: 800 }}
        >
          {attributeFields.map((field) => {
            const fieldName = ['attributes', field.key]
            switch (field.type) {
              case 'textarea':
                return (
                  <Form.Item
                    key={field.key}
                    name={fieldName}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    <TextArea rows={3} placeholder={field.placeholder} />
                  </Form.Item>
                )
              case 'number':
                return (
                  <Form.Item
                    key={field.key}
                    name={fieldName}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    <Input type="number" placeholder={field.placeholder} />
                  </Form.Item>
                )
              case 'password':
                return (
                  <Form.Item
                    key={field.key}
                    name={fieldName}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    <Input.Password placeholder={field.placeholder || '请输入'} />
                  </Form.Item>
                )
              case 'select':
                return (
                  <Form.Item
                    key={field.key}
                    name={fieldName}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请选择${field.label}` }] : []}
                  >
                    <Select placeholder={`请选择${field.label}`}>
                      {field.options?.map((opt) => (
                        <Select.Option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )
              default:
                return (
                  <Form.Item
                    key={field.key}
                    name={fieldName}
                    label={field.label}
                    rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                  >
                    <Input placeholder={field.placeholder} />
                  </Form.Item>
                )
            }
          })}
        </Form>
      )
    }

    return (
      <Descriptions column={1} bordered>
        {attributeFields.map((field) => {
          const value = parsedAttributes[field.key]
          const isSensitive = field.type === 'password'
          return (
            <Descriptions.Item key={field.key} label={field.label}>
              {isSensitive ? (
                <SensitiveField value={String(value || '')} canView={canEdit()} />
              ) : value !== undefined && value !== '' ? (
                String(value)
              ) : (
                <Text type="secondary">未设置</Text>
              )}
            </Descriptions.Item>
          )
        })}
      </Descriptions>
    )
  }

  // 渲染权限Tab
  const renderPermissionsTab = () => {
    // 模拟权限数据
    const ownerName = String(resource.createdBy || 'Owner')
    const owners = [
      { id: resource.createdBy || 1, name: ownerName, email: 'owner@example.com' },
    ]
    const viewers: { id: number; name: string; email: string }[] = []

    return (
      <div>
        <Title level={5}>Owner</Title>
        <List
          dataSource={owners}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{String(item.name).charAt(0).toUpperCase()}</Avatar>}
                title={item.name}
                description={item.email}
              />
            </List.Item>
          )}
        />

        <Title level={5} style={{ marginTop: 24 }}>Viewer</Title>
        {viewers.length > 0 ? (
          <List
            dataSource={viewers}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>}
                  title={item.name}
                  description={item.email}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无Viewer" />
        )}
      </div>
    )
  }

  // 渲染占位Tab
  const renderPlaceholderTab = (name: string) => (
    <Empty description={`${name}功能开发中...`} />
  )

  // Tab内容
  const tabItems = [
    { key: 'overview', label: TAB_LABELS.overview, children: renderOverviewTab() },
    { key: 'config', label: TAB_LABELS.config, children: renderConfigTab() },
    { key: 'topology', label: TAB_LABELS.topology, children: renderPlaceholderTab('拓扑') },
    { key: 'agent', label: TAB_LABELS.agent, children: renderPlaceholderTab('Agent') },
    { key: 'tasks', label: TAB_LABELS.tasks, children: renderPlaceholderTab('任务') },
    { key: 'permissions', label: TAB_LABELS.permissions, children: renderPermissionsTab() },
  ]

  return (
    <div data-testid="resource-detail-page" style={{ padding: '24px' }}>
      {/* 面包屑 */}
      <Breadcrumb
        items={[
          {
            title: (
              <Link to="/">
                <HomeOutlined />
              </Link>
            ),
          },
          { title: <Link to="/resources">资源管理</Link> },
          { title: resource.name },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <Space align="center">
            <ResourceTypeIcon type={resource.resourceTypeCode} size={24} />
            <Title level={2} style={{ margin: 0 }}>
              {resource.name}
            </Title>
            <Tag color={resource.status === 'RUNNING' ? 'green' : 'default'}>
              {ResourceStatusDisplay[resource.status]}
            </Tag>
          </Space>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {resource.description || '暂无描述'}
          </Paragraph>
        </div>

        <Space>
          {editing ? (
            <>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveEdit}
                loading={submitting}
              >
                保存
              </Button>
            </>
          ) : (
            <>
              {canEdit() && (
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
              )}
              {canDelete() && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  删除
                </Button>
              )}
            </>
          )}
        </Space>
      </div>

      {/* Tab内容 */}
      <Tabs
        activeKey={currentTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* 删除确认弹窗 */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        resource={resource}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        submitting={submitting}
      />
    </div>
  )
}

export default ResourceDetailPage
