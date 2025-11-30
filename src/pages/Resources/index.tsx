/**
 * 资源列表页面
 * 需求: REQ-FR-013, REQ-FR-014, REQ-FR-015
 */
import { Typography } from 'antd'

const { Title } = Typography

const ResourceListPage: React.FC = () => {
  return (
    <div data-testid="resource-list-page" style={{ padding: '24px' }}>
      <Title level={2}>资源管理</Title>
      <p>资源列表页面（待实现）</p>
    </div>
  )
}

export default ResourceListPage
