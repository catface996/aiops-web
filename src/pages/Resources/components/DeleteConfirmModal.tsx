/**
 * 删除确认对话框组件
 * 需求: REQ-FR-048, REQ-FR-049, REQ-FR-050
 */
import React, { useState, useEffect } from 'react'
import { Modal, Input, Typography, Space, Alert, List, Avatar } from 'antd'
import { ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons'
import type { ResourceDTO } from '@/types'

const { Text, Paragraph } = Typography

export interface RelatedResource {
  /** 关联资源ID */
  id: number
  /** 关联资源名称 */
  name: string
  /** 关联资源类型 */
  type: string
}

export interface DeleteConfirmModalProps {
  /** 是否显示 */
  open: boolean
  /** 要删除的资源 */
  resource: ResourceDTO | null
  /** 关闭回调 */
  onClose: () => void
  /** 确认删除回调 */
  onConfirm: (confirmName: string) => Promise<void>
  /** 关联资源列表 */
  relatedResources?: RelatedResource[]
  /** 提交中状态 */
  submitting?: boolean
}

/**
 * DeleteConfirmModal 组件
 * 删除资源确认对话框
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  resource,
  onClose,
  onConfirm,
  relatedResources = [],
  submitting = false,
}) => {
  // 输入的资源名称
  const [inputName, setInputName] = useState('')

  // 重置输入
  useEffect(() => {
    if (!open) {
      setInputName('')
    }
  }, [open])

  // 检查名称是否匹配
  const isNameMatch = inputName === resource?.name

  // 处理确认删除
  const handleConfirm = async () => {
    if (!isNameMatch || !resource) return
    await onConfirm(inputName)
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value)
  }

  if (!resource) return null

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>确认删除</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText="确认删除"
      cancelText="取消"
      okType="danger"
      okButtonProps={{
        disabled: !isNameMatch,
        loading: submitting,
      }}
      width={500}
      data-testid="delete-confirm-modal"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 警告信息 */}
        <Alert
          type="warning"
          showIcon
          message="此操作不可恢复"
          description={
            <Paragraph style={{ margin: 0 }}>
              您正在删除资源 <Text strong>"{resource.name}"</Text>。
              删除后，该资源及其所有数据将被永久移除，无法恢复。
            </Paragraph>
          }
        />

        {/* 关联资源提示 */}
        {relatedResources.length > 0 && (
          <Alert
            type="error"
            showIcon
            message="存在关联资源"
            description={
              <div>
                <Paragraph style={{ margin: '0 0 8px 0' }}>
                  以下资源与当前资源存在关联，删除后可能影响这些资源的正常使用：
                </Paragraph>
                <List
                  size="small"
                  dataSource={relatedResources}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar size="small" icon={<UserOutlined />} />}
                        title={item.name}
                        description={item.type}
                      />
                    </List.Item>
                  )}
                />
              </div>
            }
          />
        )}

        {/* 确认输入 */}
        <div>
          <Paragraph style={{ margin: '0 0 8px 0' }}>
            请输入资源名称 <Text code>{resource.name}</Text> 以确认删除：
          </Paragraph>
          <Input
            placeholder="请输入资源名称"
            value={inputName}
            onChange={handleInputChange}
            status={inputName && !isNameMatch ? 'error' : undefined}
            data-testid="delete-confirm-input"
          />
          {inputName && !isNameMatch && (
            <Text type="danger" style={{ fontSize: 12 }}>
              输入的名称与资源名称不匹配
            </Text>
          )}
        </div>
      </Space>
    </Modal>
  )
}

export default DeleteConfirmModal
