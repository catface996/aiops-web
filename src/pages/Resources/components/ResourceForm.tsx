/**
 * 资源表单组件
 * 需求: REQ-FR-004, REQ-FR-005, REQ-FR-006, REQ-FR-007, REQ-FR-008
 */
import React from 'react'
import { Form, Input, Select, InputNumber, Modal } from 'antd'
import type { ResourceType, ResourceFormData, ResourceAttributeField } from '@/types'
import { ResourceTypeAttributes } from '@/types'

const { TextArea } = Input

export interface ResourceFormProps {
  /** 是否显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 提交回调 */
  onSubmit: (data: ResourceFormData) => Promise<void>
  /** 资源类型 */
  resourceType: ResourceType | null
  /** 初始数据（编辑模式） */
  initialData?: Partial<ResourceFormData>
  /** 是否编辑模式 */
  isEdit?: boolean
  /** 提交中状态 */
  submitting?: boolean
}

/**
 * ResourceForm 组件
 * 资源创建/编辑表单
 */
export const ResourceForm: React.FC<ResourceFormProps> = ({
  open,
  onClose,
  onSubmit,
  resourceType,
  initialData,
  isEdit = false,
  submitting = false,
}) => {
  const [form] = Form.useForm<ResourceFormData>()

  // 获取扩展属性配置
  const attributeFields: ResourceAttributeField[] = resourceType
    ? ResourceTypeAttributes[resourceType.code] || []
    : []

  // 处理提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      // 构建attributes对象
      const attributes: Record<string, unknown> = {}
      attributeFields.forEach((field) => {
        const value = (values as unknown as Record<string, unknown>)[`attr_${field.key}`]
        if (value !== undefined && value !== '') {
          attributes[field.key] = value
        }
      })

      await onSubmit({
        name: values.name,
        description: values.description || '',
        resourceTypeId: resourceType?.id || 0,
        attributes,
      })
      form.resetFields()
      onClose()
    } catch (error) {
      // 表单验证失败
      console.error('Form validation failed:', error)
    }
  }

  // 处理取消
  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  // 渲染属性字段
  const renderAttributeField = (field: ResourceAttributeField) => {
    const fieldName = `attr_${field.key}`

    switch (field.type) {
      case 'textarea':
        return (
          <Form.Item
            key={fieldName}
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
            key={fieldName}
            name={fieldName}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={field.placeholder}
              min={0}
            />
          </Form.Item>
        )

      case 'password':
        return (
          <Form.Item
            key={fieldName}
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
            key={fieldName}
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

      case 'text':
      default:
        return (
          <Form.Item
            key={fieldName}
            name={fieldName}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
          >
            <Input placeholder={field.placeholder} />
          </Form.Item>
        )
    }
  }

  return (
    <Modal
      title={isEdit ? '编辑资源' : `创建${resourceType?.name || '资源'}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      confirmLoading={submitting}
      width={600}
      destroyOnClose
      data-testid="resource-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: initialData?.name || '',
          description: initialData?.description || '',
          ...Object.entries(initialData?.attributes || {}).reduce(
            (acc, [key, value]) => ({ ...acc, [`attr_${key}`]: value }),
            {}
          ),
        }}
      >
        {/* 基本信息 */}
        <Form.Item
          name="name"
          label="资源名称"
          rules={[
            { required: true, message: '请输入资源名称' },
            { min: 2, message: '资源名称至少2个字符' },
            { max: 100, message: '资源名称最多100个字符' },
          ]}
        >
          <Input placeholder="请输入资源名称（2-100个字符）" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
          rules={[{ max: 500, message: '描述最多500个字符' }]}
        >
          <TextArea rows={3} placeholder="请输入资源描述（可选，最多500个字符）" />
        </Form.Item>

        {/* 扩展属性 */}
        {attributeFields.length > 0 && (
          <>
            <div style={{ marginBottom: 16, color: '#666', fontWeight: 500 }}>
              扩展属性
            </div>
            {attributeFields.map(renderAttributeField)}
          </>
        )}
      </Form>
    </Modal>
  )
}

export default ResourceForm
