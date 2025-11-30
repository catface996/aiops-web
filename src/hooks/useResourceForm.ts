/**
 * 资源表单Hook
 * 需求: REQ-FR-008, REQ-FR-009
 */
import { useState, useCallback } from 'react'
import { message } from 'antd'
import { createResource, updateResource } from '@/services/resource'
import type {
  ResourceDTO,
  ResourceFormData,
  CreateResourceRequest,
  UpdateResourceRequest,
} from '@/types'
import { validateResourceForm } from '@/utils/resourceValidation'
import { stringifyResourceAttributes } from '@/utils/resourceFormat'

export interface UseResourceFormReturn {
  /** 表单数据 */
  formData: ResourceFormData
  /** 提交中状态 */
  submitting: boolean
  /** 表单错误 */
  errors: Record<string, string>
  /** 是否有修改 */
  isDirty: boolean
  /** 设置表单字段值 */
  setFieldValue: (field: keyof ResourceFormData, value: unknown) => void
  /** 设置属性字段值 */
  setAttributeValue: (key: string, value: unknown) => void
  /** 验证表单 */
  validate: () => boolean
  /** 重置表单 */
  reset: (initialData?: Partial<ResourceFormData>) => void
  /** 提交表单（创建） */
  submitCreate: () => Promise<ResourceDTO>
  /** 提交表单（更新） */
  submitUpdate: (resourceId: number, version: number) => Promise<ResourceDTO>
}

const defaultFormData: ResourceFormData = {
  name: '',
  description: '',
  resourceTypeId: 0,
  attributes: {},
}

/**
 * useResourceForm Hook
 * 管理资源表单的状态和验证
 */
export function useResourceForm(
  initialData?: Partial<ResourceFormData>
): UseResourceFormReturn {
  // 表单数据
  const [formData, setFormData] = useState<ResourceFormData>({
    ...defaultFormData,
    ...initialData,
  })

  // 原始数据（用于检测变更）
  const [originalData, setOriginalData] = useState<ResourceFormData>({
    ...defaultFormData,
    ...initialData,
  })

  // 提交状态
  const [submitting, setSubmitting] = useState(false)

  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * 检测表单是否有修改
   */
  const isDirty =
    formData.name !== originalData.name ||
    formData.description !== originalData.description ||
    formData.resourceTypeId !== originalData.resourceTypeId ||
    JSON.stringify(formData.attributes) !== JSON.stringify(originalData.attributes)

  /**
   * 设置字段值
   */
  const setFieldValue = useCallback(
    (field: keyof ResourceFormData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      // 清除该字段的错误
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    },
    []
  )

  /**
   * 设置属性字段值
   */
  const setAttributeValue = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }))
    // 清除该属性的错误
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[`attributes.${key}`]
      return newErrors
    })
  }, [])

  /**
   * 验证表单
   */
  const validate = useCallback((): boolean => {
    const result = validateResourceForm(formData)
    setErrors(result.errors)
    return result.valid
  }, [formData])

  /**
   * 重置表单
   */
  const reset = useCallback((initialData?: Partial<ResourceFormData>) => {
    const newData = {
      ...defaultFormData,
      ...initialData,
    }
    setFormData(newData)
    setOriginalData(newData)
    setErrors({})
  }, [])


  /**
   * 提交创建请求
   */
  const submitCreate = useCallback(async (): Promise<ResourceDTO> => {
    if (!validate()) {
      throw new Error('表单验证失败')
    }

    setSubmitting(true)
    try {
      const request: CreateResourceRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        resourceTypeId: formData.resourceTypeId,
        attributes: stringifyResourceAttributes(formData.attributes),
      }

      const result = await createResource(request)
      message.success('资源创建成功')
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('创建资源失败')
      // 检查是否为名称重复错误
      if (error.message.includes('名称') || error.message.includes('already exists')) {
        setErrors({ name: '资源名称已存在' })
      }
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [formData, validate])

  /**
   * 提交更新请求
   */
  const submitUpdate = useCallback(
    async (resourceId: number, version: number): Promise<ResourceDTO> => {
      if (!validate()) {
        throw new Error('表单验证失败')
      }

      setSubmitting(true)
      try {
        const request: UpdateResourceRequest = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          attributes: stringifyResourceAttributes(formData.attributes),
          version,
        }

        const result = await updateResource(resourceId, request)
        message.success('资源更新成功')
        // 更新原始数据
        setOriginalData({ ...formData })
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('更新资源失败')
        throw error
      } finally {
        setSubmitting(false)
      }
    },
    [formData, validate]
  )

  return {
    formData,
    submitting,
    errors,
    isDirty,
    setFieldValue,
    setAttributeValue,
    validate,
    reset,
    submitCreate,
    submitUpdate,
  }
}

export default useResourceForm
