/**
 * 关系创建/编辑弹窗
 * Feature: F04 - 创建和编辑资源间的关系
 */
import React, { useEffect } from 'react'
import { Modal, Form, Select, Input, Radio, Space, Typography } from 'antd'
import {
  RelationType,
  RelationTypeDisplay,
  RelationDirection,
  RelationDirectionDisplay,
  RelationStrength,
  RelationStrengthDisplay,
  RelationTypeColor,
} from '@/types/topology'
import type { TopologyNode } from '@/types/topology'

const { Text } = Typography
const { TextArea } = Input

export interface RelationFormData {
  sourceId: number
  targetId: number
  relationType: RelationType
  direction: RelationDirection
  strength: RelationStrength
  description?: string
}

export interface RelationModalProps {
  open: boolean
  mode: 'create' | 'edit'
  sourceNode?: TopologyNode | null
  targetNode?: TopologyNode | null
  initialData?: Partial<RelationFormData>
  nodes?: TopologyNode[]
  onOk: (data: RelationFormData) => void
  onCancel: () => void
  loading?: boolean
}

/**
 * 关系类型选项渲染
 */
const RelationTypeOption: React.FC<{ type: RelationType }> = ({ type }) => (
  <Space>
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: RelationTypeColor[type],
      }}
    />
    <span>{RelationTypeDisplay[type]}</span>
  </Space>
)

/**
 * 关系创建/编辑弹窗
 */
export const RelationModal: React.FC<RelationModalProps> = ({
  open,
  mode,
  sourceNode,
  targetNode,
  initialData,
  nodes = [],
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm<RelationFormData>()

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        sourceId: sourceNode?.resourceId || initialData?.sourceId,
        targetId: targetNode?.resourceId || initialData?.targetId,
        relationType: initialData?.relationType || RelationType.DEPENDENCY,
        direction: initialData?.direction || RelationDirection.UNIDIRECTIONAL,
        strength: initialData?.strength || RelationStrength.STRONG,
        description: initialData?.description || '',
      })
    }
  }, [open, sourceNode, targetNode, initialData, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk(values)
    } catch {
      // 表单验证失败
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  // 节点选项列表
  const nodeOptions = nodes.map((node) => ({
    value: node.resourceId,
    label: `${node.name} (${node.type})`,
  }))

  return (
    <Modal
      title={mode === 'create' ? '创建关系' : '编辑关系'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          relationType: RelationType.DEPENDENCY,
          direction: RelationDirection.UNIDIRECTIONAL,
          strength: RelationStrength.STRONG,
        }}
      >
        {/* 源节点 */}
        {sourceNode ? (
          <Form.Item label="源节点">
            <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>{sourceNode.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>({sourceNode.type})</Text>
            </div>
            <Form.Item name="sourceId" hidden>
              <Input />
            </Form.Item>
          </Form.Item>
        ) : (
          <Form.Item
            name="sourceId"
            label="源节点"
            rules={[{ required: true, message: '请选择源节点' }]}
          >
            <Select
              placeholder="请选择源节点"
              options={nodeOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {/* 目标节点 */}
        {targetNode ? (
          <Form.Item label="目标节点">
            <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>{targetNode.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>({targetNode.type})</Text>
            </div>
            <Form.Item name="targetId" hidden>
              <Input />
            </Form.Item>
          </Form.Item>
        ) : (
          <Form.Item
            name="targetId"
            label="目标节点"
            rules={[{ required: true, message: '请选择目标节点' }]}
          >
            <Select
              placeholder="请选择目标节点"
              options={nodeOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {/* 关系类型 */}
        <Form.Item
          name="relationType"
          label="关系类型"
          rules={[{ required: true, message: '请选择关系类型' }]}
        >
          <Select placeholder="请选择关系类型">
            {Object.entries(RelationType).map(([key, value]) => (
              <Select.Option key={key} value={value}>
                <RelationTypeOption type={value} />
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 关系方向 */}
        <Form.Item
          name="direction"
          label="关系方向"
          rules={[{ required: true, message: '请选择关系方向' }]}
        >
          <Radio.Group>
            {Object.entries(RelationDirection).map(([key, value]) => (
              <Radio key={key} value={value}>
                {RelationDirectionDisplay[value]}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 关系强度 */}
        <Form.Item
          name="strength"
          label="关系强度"
          rules={[{ required: true, message: '请选择关系强度' }]}
        >
          <Radio.Group>
            {Object.entries(RelationStrength).map(([key, value]) => (
              <Radio key={key} value={value}>
                {RelationStrengthDisplay[value]}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* 关系描述 */}
        <Form.Item name="description" label="关系描述">
          <TextArea
            placeholder="请输入关系描述（可选）"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RelationModal
