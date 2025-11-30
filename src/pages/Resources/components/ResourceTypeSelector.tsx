/**
 * 资源类型选择器组件
 * 需求: REQ-FR-002, REQ-FR-003
 */
import React, { useEffect, useState } from 'react'
import { Modal, Card, Row, Col, Typography, Spin } from 'antd'
import { getResourceTypes } from '@/services/resource'
import { ResourceTypeIcon } from '@/components/ResourceTypeIcon'
import type { ResourceType } from '@/types'

const { Title, Text } = Typography

export interface ResourceTypeSelectorProps {
  /** 是否显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 选择回调 */
  onSelect: (type: ResourceType) => void
}

/**
 * ResourceTypeSelector 组件
 * 资源类型选择对话框
 */
export const ResourceTypeSelector: React.FC<ResourceTypeSelectorProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  // 资源类型列表
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)

  // 加载资源类型
  useEffect(() => {
    if (open) {
      const loadTypes = async () => {
        setLoading(true)
        try {
          const types = await getResourceTypes()
          setResourceTypes(types)
        } catch (error) {
          console.error('Failed to load resource types:', error)
        } finally {
          setLoading(false)
        }
      }
      loadTypes()
    }
  }, [open])

  // 处理选择
  const handleSelect = (type: ResourceType) => {
    setSelectedType(type)
  }

  // 处理确认
  const handleOk = () => {
    if (selectedType) {
      onSelect(selectedType)
      setSelectedType(null)
    }
  }

  // 处理关闭
  const handleCancel = () => {
    setSelectedType(null)
    onClose()
  }

  return (
    <Modal
      title="选择资源类型"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="下一步"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedType }}
      width={600}
      data-testid="resource-type-selector"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {resourceTypes.map((type) => (
            <Col key={type.id} xs={24} sm={12}>
              <Card
                hoverable
                onClick={() => handleSelect(type)}
                style={{
                  border: selectedType?.id === type.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <ResourceTypeIcon type={type.code} size={32} />
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {type.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {type.description}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Modal>
  )
}

export default ResourceTypeSelector
