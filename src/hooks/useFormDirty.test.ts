/**
 * useFormDirty Hook 单元测试
 * 需求: REQ-FR-002-C
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Form } from 'antd'
import { useFormDirty } from './useFormDirty'
import React from 'react'

describe('useFormDirty', () => {
  it('should return false initially when no fields are touched', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    expect(result.current.isDirty).toBe(false)
  })

  it('should return false when only untouched fields have values', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    // 设置值但不标记为已触摸（例如通过 setFieldsValue 设置初始值）
    act(() => {
      result.current.form.setFieldsValue({ name: 'test' })
    })

    // 应该仍然是 false，因为字段未被用户触摸
    expect(result.current.isDirty).toBe(false)
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    // 不应该抛出错误
    expect(() => unmount()).not.toThrow()
  })

  it('should handle multiple form instances independently', () => {
    const { result: result1 } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    const { result: result2 } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    // 初始状态都是 false
    expect(result1.current.isDirty).toBe(false)
    expect(result2.current.isDirty).toBe(false)
  })

  it('should detect dirty state using isFieldsTouched', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    // Mock isFieldsTouched to return true
    const mockIsFieldsTouched = vi.fn().mockReturnValue(true)
    result.current.form.isFieldsTouched = mockIsFieldsTouched

    // Wait for the interval to check
    await waitFor(() => {
      expect(result.current.isDirty).toBe(true)
    }, { timeout: 200 })

    expect(mockIsFieldsTouched).toHaveBeenCalled()
  })

  it('should detect when form becomes clean after reset', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    // Mock isFieldsTouched to return true initially
    const mockIsFieldsTouched = vi.fn().mockReturnValue(true)
    result.current.form.isFieldsTouched = mockIsFieldsTouched

    // Wait for dirty state
    await waitFor(() => {
      expect(result.current.isDirty).toBe(true)
    }, { timeout: 200 })

    // Now mock it to return false (simulating reset)
    mockIsFieldsTouched.mockReturnValue(false)

    // Wait for clean state
    await waitFor(() => {
      expect(result.current.isDirty).toBe(false)
    }, { timeout: 200 })
  })

  it('should poll form state at regular intervals', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    const mockIsFieldsTouched = vi.fn().mockReturnValue(false)
    result.current.form.isFieldsTouched = mockIsFieldsTouched

    // Wait a bit and check that isFieldsTouched was called multiple times
    await new Promise(resolve => setTimeout(resolve, 250))

    // Should have been called at least twice (initial + interval checks)
    expect(mockIsFieldsTouched.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('should stop polling after unmount', async () => {
    const { result, unmount } = renderHook(() => {
      const [form] = Form.useForm()
      const isDirty = useFormDirty(form)
      return { form, isDirty }
    })

    const mockIsFieldsTouched = vi.fn().mockReturnValue(false)
    result.current.form.isFieldsTouched = mockIsFieldsTouched

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 150))
    const callCountBeforeUnmount = mockIsFieldsTouched.mock.calls.length

    // Unmount
    unmount()

    // Wait more
    await new Promise(resolve => setTimeout(resolve, 150))

    // Call count should not have increased after unmount
    expect(mockIsFieldsTouched.mock.calls.length).toBe(callCountBeforeUnmount)
  })
})
