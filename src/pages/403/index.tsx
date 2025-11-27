/**
 * 403 无权限页面
 * 需求: 4.3
 */
import React from 'react'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面。"
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          返回首页
        </Button>
      }
      data-testid="forbidden-page"
    />
  )
}

export default ForbiddenPage
