/**
 * 登录页面
 * 需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, message, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { LoginRequest } from '@/types'

const { Title, Text } = Typography

interface LoginFormValues {
  identifier: string
  password: string
  rememberMe: boolean
}

interface LocationState {
  from?: { pathname: string }
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockUntil, setLockUntil] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // 获取重定向路径
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard'

  // 表单提交
  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    setErrorMessage(null)
    setIsLocked(false)
    setLockUntil(null)

    try {
      const loginData: LoginRequest = {
        identifier: values.identifier,
        password: values.password,
        rememberMe: values.rememberMe,
      }
      await login(loginData)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch (error) {
      // 处理后端错误
      if (error instanceof Error) {
        const errorMsg = error.message

        // 检查是否是账号锁定错误 (HTTP 423)
        if (errorMsg.includes('锁定') || errorMsg.includes('locked') || errorMsg.includes('423')) {
          setIsLocked(true)
          // 尝试从错误消息中提取锁定时间
          const timeMatch = errorMsg.match(/(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/)
          if (timeMatch) {
            setLockUntil(timeMatch[1])
          }
          setErrorMessage('账号已被锁定，请稍后再试或联系管理员')
        } else if (errorMsg.includes('401') || errorMsg.includes('密码') || errorMsg.includes('credential')) {
          // 认证失败
          setErrorMessage('用户名或密码错误')
        } else {
          setErrorMessage(errorMsg || '登录失败，请稍后重试')
        }
      } else {
        setErrorMessage('登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  // 用户名/邮箱验证规则
  const identifierRules = [
    { required: true, message: '请输入用户名或邮箱' },
  ]

  // 密码验证规则
  const passwordRules = [
    { required: true, message: '请输入密码' },
  ]

  return (
    <div data-testid="login-page">
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        登录
      </Title>

      {/* 错误提示 */}
      {errorMessage && (
        <Alert
          message={errorMessage}
          type={isLocked ? 'warning' : 'error'}
          showIcon
          style={{ marginBottom: 16 }}
          data-testid="login-error"
          description={
            isLocked && lockUntil
              ? `锁定至: ${new Date(lockUntil).toLocaleString()}`
              : undefined
          }
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        initialValues={{ rememberMe: false }}
        data-testid="login-form"
      >
        {/* 用户名/邮箱 */}
        <Form.Item name="identifier" rules={identifierRules}>
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名或邮箱"
            data-testid="identifier-input"
            disabled={isLocked}
          />
        </Form.Item>

        {/* 密码 */}
        <Form.Item name="password" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            data-testid="password-input"
            disabled={isLocked}
          />
        </Form.Item>

        {/* 记住我 */}
        <Form.Item name="rememberMe" valuePropName="checked">
          <Checkbox data-testid="remember-checkbox" disabled={isLocked}>
            记住我
          </Checkbox>
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={isLocked}
            block
            data-testid="login-submit"
          >
            登录
          </Button>
        </Form.Item>

        {/* 注册链接 */}
        <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
          <Text type="secondary">
            没有账号？{' '}
            <Link to="/register" data-testid="register-link">
              立即注册
            </Link>
          </Text>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginPage
