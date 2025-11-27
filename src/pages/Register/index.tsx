/**
 * 注册页面
 * 需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
 */
import React, { useState } from 'react'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PasswordStrength } from '@/components'
import {
  validateEmail,
  validateUsername,
  validatePassword,
} from '@/utils/validator'
import type { RegisterRequest } from '@/types'

const { Title, Text } = Typography

interface RegisterFormValues {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm<RegisterFormValues>()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()

  // 监听密码变化，用于密码强度组件
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  // 表单提交
  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true)
    try {
      const registerData: RegisterRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
      }
      await register(registerData)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      // 处理后端错误
      if (error instanceof Error) {
        // 尝试解析字段错误
        const errorMessage = error.message
        if (errorMessage.includes('username') || errorMessage.includes('用户名')) {
          form.setFields([{ name: 'username', errors: [errorMessage] }])
        } else if (errorMessage.includes('email') || errorMessage.includes('邮箱')) {
          form.setFields([{ name: 'email', errors: [errorMessage] }])
        } else {
          message.error(errorMessage || '注册失败，请稍后重试')
        }
      } else {
        message.error('注册失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  // 用户名验证规则
  const usernameRules = [
    { required: true, message: '请输入用户名' },
    {
      validator: (_: unknown, value: string) => {
        if (!value) return Promise.resolve()
        const result = validateUsername(value)
        if (!result.valid) {
          return Promise.reject(result.message)
        }
        return Promise.resolve()
      },
    },
  ]

  // 邮箱验证规则
  const emailRules = [
    { required: true, message: '请输入邮箱' },
    {
      validator: (_: unknown, value: string) => {
        if (!value) return Promise.resolve()
        const result = validateEmail(value)
        if (!result.valid) {
          return Promise.reject(result.message)
        }
        return Promise.resolve()
      },
    },
  ]

  // 密码验证规则
  const passwordRules = [
    { required: true, message: '请输入密码' },
    {
      validator: (_: unknown, value: string) => {
        if (!value) return Promise.resolve()
        const username = form.getFieldValue('username')
        const email = form.getFieldValue('email')
        const result = validatePassword(value, username, email)
        if (!result.valid) {
          return Promise.reject(result.message)
        }
        return Promise.resolve()
      },
    },
  ]

  // 确认密码验证规则
  const confirmPasswordRules = [
    { required: true, message: '请确认密码' },
    {
      validator: (_: unknown, value: string) => {
        if (!value) return Promise.resolve()
        const passwordValue = form.getFieldValue('password')
        if (value !== passwordValue) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
    },
  ]

  return (
    <div data-testid="register-page">
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
        创建账号
      </Title>

      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        data-testid="register-form"
      >
        {/* 用户名 */}
        <Form.Item name="username" rules={usernameRules}>
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名 (3-20字符，字母数字下划线)"
            data-testid="username-input"
          />
        </Form.Item>

        {/* 邮箱 */}
        <Form.Item name="email" rules={emailRules}>
          <Input
            prefix={<MailOutlined />}
            placeholder="邮箱"
            data-testid="email-input"
          />
        </Form.Item>

        {/* 密码 */}
        <Form.Item name="password" rules={passwordRules}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码 (8-64字符)"
            onChange={handlePasswordChange}
            data-testid="password-input"
          />
        </Form.Item>

        {/* 密码强度指示器 */}
        <PasswordStrength
          password={password}
          username={form.getFieldValue('username')}
          email={form.getFieldValue('email')}
          showErrors={false}
        />

        {/* 确认密码 */}
        <Form.Item
          name="confirmPassword"
          rules={confirmPasswordRules}
          dependencies={['password']}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
            data-testid="confirm-password-input"
          />
        </Form.Item>

        {/* 提交按钮 */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            data-testid="register-submit"
          >
            注册
          </Button>
        </Form.Item>

        {/* 登录链接 */}
        <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
          <Text type="secondary">
            已有账号？{' '}
            <Link to="/login" data-testid="login-link">
              立即登录
            </Link>
          </Text>
        </Form.Item>
      </Form>
    </div>
  )
}

export default RegisterPage
