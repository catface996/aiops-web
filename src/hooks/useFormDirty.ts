/**
 * useFormDirty Hook
 * 监听 Ant Design Form 表单字段变化，返回 isDirty 状态
 * 需求: REQ-FR-002-C
 */
import { useState, useEffect } from 'react'
import type { FormInstance } from 'antd'

/**
 * useFormDirty Hook
 * 检测表单是否有未保存的更改
 *
 * @param form - Ant Design Form 实例
 * @returns isDirty - 表单是否有未保存的更改
 *
 * @example
 * ```tsx
 * const [form] = Form.useForm();
 * const isDirty = useFormDirty(form);
 *
 * const handleCancel = () => {
 *   if (isDirty) {
 *     Modal.confirm({
 *       title: 'Unsaved Changes',
 *       content: 'You have unsaved changes. Are you sure you want to discard them?',
 *       onOk: () => onClose(),
 *     });
 *   } else {
 *     onClose();
 *   }
 * };
 * ```
 */
export function useFormDirty(form: FormInstance): boolean {
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    // 检查表单是否有任何字段被触摸过
    const checkDirty = () => {
      const touched = form.isFieldsTouched()
      setIsDirty(touched)
    }

    // 初始检查
    checkDirty()

    // 使用 setInterval 定期检查表单状态
    // 这是一个简单但有效的方法，因为 Ant Design Form 没有提供直接的 touched 事件监听
    const intervalId = setInterval(checkDirty, 100)

    // 清理函数
    return () => {
      clearInterval(intervalId)
    }
  }, [form])

  return isDirty
}

export default useFormDirty
