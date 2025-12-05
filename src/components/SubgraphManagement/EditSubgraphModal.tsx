/**
 * EditSubgraphModal Component
 * 
 * Modal dialog for editing an existing subgraph with form validation and optimistic locking.
 * 
 * Requirements:
 * - REQ-FR-034: Display "Edit" button for owners
 * - REQ-FR-037: Display edit form pre-filled with current data
 * - REQ-FR-038: Validate name uniqueness (excluding current subgraph)
 * - REQ-FR-043: Submit update request with version field for optimistic locking
 * - REQ-FR-045: Handle version conflicts with clear error message
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Form, Input, Select, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SubgraphService from '@/services/subgraph';
import type { UpdateSubgraphRequest, Subgraph, SubgraphDetail } from '@/types/subgraph';
import { useFormDirty } from '@/hooks/useFormDirty';

const { TextArea } = Input;
const { Option } = Select;

interface EditSubgraphModalProps {
  visible: boolean;
  subgraph: SubgraphDetail;
  onClose: () => void;
  onSuccess: (subgraph: Subgraph) => void;
}

// Form values type (flat structure matching form fields)
interface FormValues {
  name: string;
  description?: string;
  tags?: string[];
  businessDomain?: string;
  environment?: string;
  team?: string;
}

/**
 * EditSubgraphModal - Modal component for editing existing subgraphs
 * Reuses form logic from CreateSubgraphModal with pre-filled data and version handling
 */
const EditSubgraphModal: React.FC<EditSubgraphModalProps> = ({
  visible,
  subgraph,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Track form dirty state for cancel confirmation
  const isDirty = useFormDirty(form);

  // Initialize form with subgraph data when modal opens (REQ-FR-037)
  useEffect(() => {
    if (visible && subgraph) {
      // Set form field values
      form.setFieldsValue({
        name: subgraph.name,
        description: subgraph.description || '',
        businessDomain: subgraph.metadata?.businessDomain,
        environment: subgraph.metadata?.environment,
        team: subgraph.metadata?.team,
      });

      // Set tags
      const initialTags = subgraph.tags || [];
      setTags(initialTags);
      form.setFieldValue('tags', initialTags);
    }
  }, [visible, subgraph, form]);

  // Handle tag addition
  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) {
      return;
    }

    // Validate tag format (REQ-FR-002-A)
    if (trimmedTag.length < 1 || trimmedTag.length > 50) {
      message.error('Tag must be 1-50 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedTag)) {
      message.error('Tag must contain only letters, numbers, hyphens, and underscores');
      return;
    }

    if (tags.includes(trimmedTag)) {
      message.warning('Tag already exists');
      return;
    }

    if (tags.length >= 10) {
      message.error('Maximum 10 tags allowed');
      return;
    }

    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    form.setFieldValue('tags', newTags);
    setTagInput('');
  }, [tagInput, tags, form]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setFieldValue('tags', newTags);
  }, [tags, form]);

  // Handle tag input key down
  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  // Validate name uniqueness, excluding current subgraph (REQ-FR-038)
  const validateNameUnique = useCallback(async (_: unknown, value: string) => {
    if (!value) {
      return Promise.resolve();
    }

    // Skip validation if name hasn't changed
    if (value === subgraph.name) {
      return Promise.resolve();
    }

    const isUnique = await SubgraphService.checkNameUnique(value, subgraph.id);
    if (!isUnique) {
      return Promise.reject(new Error('Subgraph name already exists'));
    }

    return Promise.resolve();
  }, [subgraph.id, subgraph.name]);

  // Handle form submission (REQ-FR-043)
  const handleSubmit = useCallback(async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();

      setSubmitting(true);

      // Prepare metadata
      const metadata: Record<string, string> = {};
      if (values.businessDomain) {
        metadata.businessDomain = values.businessDomain;
      }
      if (values.environment) {
        metadata.environment = values.environment;
      }
      if (values.team) {
        metadata.team = values.team;
      }

      // Prepare request data with version for optimistic locking (REQ-FR-043)
      const requestData: UpdateSubgraphRequest = {
        name: values.name,
        description: values.description,
        tags: tags.length > 0 ? tags : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        version: subgraph.version, // Include version for optimistic locking
      };

      // Submit update request
      const updatedSubgraph = await SubgraphService.updateSubgraph(subgraph.id, requestData);

      // Show success message
      message.success('Subgraph updated successfully', 3);

      // Reset form and state
      form.resetFields();
      setTags([]);
      setTagInput('');

      // Call success callback
      onSuccess(updatedSubgraph);
    } catch (error: unknown) {
      // Handle validation errors
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // Form validation error - Ant Design will show field errors
        return;
      }

      // Handle API errors
      console.error('Failed to update subgraph:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string; code?: string }, status?: number } };
        
        // Handle version conflict (409 Conflict) - REQ-FR-045
        if (apiError.response?.status === 409 || apiError.response?.data?.code === 'CONFLICT') {
          Modal.confirm({
            title: 'Data Conflict',
            content: 'This subgraph has been modified by others. Please refresh and try again.',
            okText: 'Refresh Page',
            cancelText: 'Cancel',
            onOk: () => {
              window.location.reload();
            },
          });
          return;
        }

        const errorMessage = apiError.response?.data?.message || 'Failed to update subgraph';
        message.error(errorMessage);
      } else {
        message.error('Failed to update subgraph. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, tags, subgraph.id, subgraph.version, onSuccess]);

  // Handle cancel with confirmation if form is dirty
  const handleCancel = useCallback(() => {
    if (isDirty) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to discard them?',
        okText: 'Discard',
        cancelText: 'Continue Editing',
        onOk: () => {
          form.resetFields();
          setTags([]);
          setTagInput('');
          onClose();
        },
      });
    } else {
      form.resetFields();
      setTags([]);
      setTagInput('');
      onClose();
    }
  }, [isDirty, form, onClose]);

  return (
    <Modal
      title="Edit Subgraph"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Save"
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        {/* Basic Information Section */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Basic Information</h4>

          {/* Name Field - REQ-FR-038 */}
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter subgraph name' },
              { min: 1, max: 255, message: 'Name must be 1-255 characters' },
              { validator: validateNameUnique },
            ]}
            validateTrigger={['onBlur', 'onChange']}
            validateDebounce={500}
          >
            <Input
              placeholder="Enter subgraph name"
              maxLength={255}
              showCount
            />
          </Form.Item>

          {/* Description Field */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 1000, message: 'Description must not exceed 1000 characters' },
            ]}
          >
            <TextArea
              placeholder="Enter subgraph description (optional)"
              rows={4}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          {/* Tags Field */}
          <Form.Item
            label="Tags"
            help="Press Enter to add a tag. Max 10 tags, each 1-50 characters, alphanumeric, hyphens, and underscores only."
          >
            <Space style={{ width: '100%', flexDirection: 'column', alignItems: 'stretch' }} size="small">
              <Input
                placeholder="Enter tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                maxLength={50}
                suffix={
                  <PlusOutlined
                    onClick={handleAddTag}
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                  />
                }
              />
              {tags.length > 0 && (
                <div>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                      style={{ marginBottom: 8 }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </Space>
          </Form.Item>
        </div>

        {/* Metadata Section */}
        <div>
          <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Metadata</h4>

          {/* Business Domain */}
          <Form.Item
            label="Business Domain"
            name="businessDomain"
          >
            <Select
              placeholder="Select business domain (optional)"
              allowClear
            >
              <Option value="payment">Payment</Option>
              <Option value="order">Order</Option>
              <Option value="user">User</Option>
              <Option value="inventory">Inventory</Option>
              <Option value="logistics">Logistics</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="analytics">Analytics</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          {/* Environment */}
          <Form.Item
            label="Environment"
            name="environment"
          >
            <Select
              placeholder="Select environment (optional)"
              allowClear
            >
              <Option value="development">Development</Option>
              <Option value="testing">Testing</Option>
              <Option value="staging">Staging</Option>
              <Option value="production">Production</Option>
            </Select>
          </Form.Item>

          {/* Team */}
          <Form.Item
            label="Team"
            name="team"
          >
            <Input
              placeholder="Enter team name (optional)"
              maxLength={100}
            />
          </Form.Item>
        </div>

        {/* Hidden field to store tags in form */}
        <Form.Item name="tags" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSubgraphModal;
