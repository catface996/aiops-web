/**
 * 资源详情页面
 * 需求: REQ-FR-026, REQ-FR-027, REQ-FR-028
 */
import { Typography } from 'antd'
import { useParams } from 'react-router-dom'

const { Title } = Typography

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div data-testid="resource-detail-page" style={{ padding: '24px' }}>
      <Title level={2}>资源详情</Title>
      <p>资源ID: {id}</p>
      <p>资源详情页面（待实现）</p>
    </div>
  )
}

export default ResourceDetailPage
