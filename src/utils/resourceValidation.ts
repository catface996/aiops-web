/**
 * 资源验证工具函数
 * 需求: REQ-FR-008 - 表单实时验证
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * 验证资源名称
 * 需求: REQ-FR-005 - 名称字段 (required, 2-100 characters)
 * @param name 资源名称
 * @returns 验证结果
 */
export function validateResourceName(name: string | null | undefined): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, message: '资源名称不能为空' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return { valid: false, message: '资源名称至少需要2个字符' }
  }

  if (trimmedName.length > 100) {
    return { valid: false, message: '资源名称不能超过100个字符' }
  }

  // 检查是否包含特殊字符（可选的额外验证）
  const invalidChars = /[<>:"\/\\|?*]/
  if (invalidChars.test(trimmedName)) {
    return { valid: false, message: '资源名称包含非法字符' }
  }

  return { valid: true }
}

/**
 * 验证资源描述
 * 需求: REQ-FR-005 - 描述字段 (optional, max 500 characters)
 * @param description 资源描述
 * @returns 验证结果
 */
export function validateResourceDescription(
  description: string | null | undefined
): ValidationResult {
  if (!description || description.trim() === '') {
    return { valid: true } // 描述是可选的
  }

  if (description.length > 500) {
    return { valid: false, message: '资源描述不能超过500个字符' }
  }

  return { valid: true }
}

/**
 * 验证IP地址
 * @param ip IP地址字符串
 * @returns 验证结果
 */
export function validateIPAddress(ip: string | null | undefined): ValidationResult {
  if (!ip || ip.trim() === '') {
    return { valid: false, message: 'IP地址不能为空' }
  }

  // IPv4验证
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  // IPv6验证（简化版）
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return { valid: false, message: 'IP地址格式不正确' }
  }

  return { valid: true }
}

/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证结果
 */
export function validatePort(port: number | string | null | undefined): ValidationResult {
  if (port === null || port === undefined || port === '') {
    return { valid: false, message: '端口号不能为空' }
  }

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port

  if (isNaN(portNum)) {
    return { valid: false, message: '端口号必须是数字' }
  }

  if (portNum < 1 || portNum > 65535) {
    return { valid: false, message: '端口号必须在1-65535之间' }
  }

  return { valid: true }
}

/**
 * 验证URL
 * @param url URL字符串
 * @returns 验证结果
 */
export function validateURL(url: string | null | undefined): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, message: 'URL不能为空' }
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, message: 'URL格式不正确' }
  }
}

/**
 * 验证资源类型ID
 * @param typeId 资源类型ID
 * @returns 验证结果
 */
export function validateResourceTypeId(
  typeId: number | null | undefined
): ValidationResult {
  if (typeId === null || typeId === undefined) {
    return { valid: false, message: '请选择资源类型' }
  }

  if (typeId <= 0) {
    return { valid: false, message: '请选择有效的资源类型' }
  }

  return { valid: true }
}

/**
 * 验证删除确认名称
 * 需求: REQ-FR-050 - 删除名称验证
 * @param inputName 用户输入的名称
 * @param resourceName 资源实际名称
 * @returns 验证结果
 */
export function validateDeleteConfirmation(
  inputName: string | null | undefined,
  resourceName: string
): ValidationResult {
  if (!inputName || inputName.trim() === '') {
    return { valid: false, message: '请输入资源名称以确认删除' }
  }

  if (inputName !== resourceName) {
    return { valid: false, message: '输入的名称与资源名称不匹配' }
  }

  return { valid: true }
}

/**
 * 验证必填字段
 * @param value 字段值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }

  return { valid: true }
}

/**
 * 验证字符串长度
 * @param value 字符串值
 * @param min 最小长度
 * @param max 最大长度
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateStringLength(
  value: string | null | undefined,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (!value) {
    if (min > 0) {
      return { valid: false, message: `${fieldName}不能为空` }
    }
    return { valid: true }
  }

  if (value.length < min) {
    return { valid: false, message: `${fieldName}至少需要${min}个字符` }
  }

  if (value.length > max) {
    return { valid: false, message: `${fieldName}不能超过${max}个字符` }
  }

  return { valid: true }
}

/**
 * 检查字段是否为敏感字段
 * 需求: REQ-FR-007 - 敏感字段识别
 * @param fieldName 字段名称
 * @returns 是否为敏感字段
 */
export function isSensitiveField(fieldName: string): boolean {
  const sensitivePatterns = ['password', 'secret', 'key', 'token', 'credential']
  const lowerFieldName = fieldName.toLowerCase()
  return sensitivePatterns.some((pattern) => lowerFieldName.includes(pattern))
}

/**
 * 验证资源表单数据
 * @param data 表单数据
 * @returns 验证结果，包含所有字段的验证结果
 */
export function validateResourceForm(data: {
  name?: string
  description?: string
  resourceTypeId?: number
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const nameResult = validateResourceName(data.name)
  if (!nameResult.valid && nameResult.message) {
    errors.name = nameResult.message
  }

  const descResult = validateResourceDescription(data.description)
  if (!descResult.valid && descResult.message) {
    errors.description = descResult.message
  }

  const typeResult = validateResourceTypeId(data.resourceTypeId)
  if (!typeResult.valid && typeResult.message) {
    errors.resourceTypeId = typeResult.message
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
