/**
 * 拓扑页面
 * Feature: F04 - 建立资源间的拓扑关系
 */
import React, { useState, useCallback, useEffect } from 'react'
import { Card, Button, Space, message, Spin, Empty, Tooltip, Popconfirm } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import type {
  TopologyNode as TopologyNodeType,
  TopologyEdge as TopologyEdgeType,
  Position,
  ConnectionPoint,
} from '@/types/topology'
import { RelationStatus, RelationType, RelationDirection, RelationStrength } from '@/types/topology'
import { TopologyCanvas, RelationModal } from './components'
import type { RelationFormData } from './components'
import styles from './index.module.css'

// 模拟节点数据
const mockNodes: TopologyNodeType[] = [
  { id: 'node-1', resourceId: 1, name: 'Web Server', type: '服务器', typeCode: 'SERVER', status: 'RUNNING', position: { x: 400, y: 50 } },
  { id: 'node-2', resourceId: 2, name: 'API Gateway', type: '应用', typeCode: 'APPLICATION', status: 'RUNNING', position: { x: 400, y: 180 } },
  { id: 'node-3', resourceId: 3, name: 'User Service', type: '应用', typeCode: 'APPLICATION', status: 'RUNNING', position: { x: 200, y: 310 } },
  { id: 'node-4', resourceId: 4, name: 'Order Service', type: '应用', typeCode: 'APPLICATION', status: 'RUNNING', position: { x: 400, y: 310 } },
  { id: 'node-5', resourceId: 5, name: 'Payment Service', type: '应用', typeCode: 'APPLICATION', status: 'MAINTENANCE', position: { x: 600, y: 310 } },
  { id: 'node-6', resourceId: 6, name: 'MySQL Master', type: '数据库', typeCode: 'DATABASE', status: 'RUNNING', position: { x: 150, y: 450 } },
  { id: 'node-7', resourceId: 7, name: 'MySQL Slave', type: '数据库', typeCode: 'DATABASE', status: 'RUNNING', position: { x: 350, y: 450 } },
  { id: 'node-8', resourceId: 8, name: 'Redis Cache', type: '中间件', typeCode: 'MIDDLEWARE', status: 'RUNNING', position: { x: 550, y: 450 } },
  { id: 'node-9', resourceId: 9, name: 'RabbitMQ', type: '中间件', typeCode: 'MIDDLEWARE', status: 'RUNNING', position: { x: 750, y: 450 } },
  { id: 'node-10', resourceId: 10, name: 'External API', type: 'API', typeCode: 'API', status: 'RUNNING', position: { x: 750, y: 310 } },
]

// 模拟连线数据
const mockEdges: TopologyEdgeType[] = [
  { id: 'edge-1', relationId: 1, source: 'node-1', target: 'node-2', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.CALL, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL, label: '请求转发' },
  { id: 'edge-2', relationId: 2, source: 'node-2', target: 'node-3', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.CALL, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL },
  { id: 'edge-3', relationId: 3, source: 'node-2', target: 'node-4', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.CALL, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL },
  { id: 'edge-4', relationId: 4, source: 'node-2', target: 'node-5', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.CALL, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.WEAK, status: RelationStatus.NORMAL },
  { id: 'edge-5', relationId: 5, source: 'node-3', target: 'node-6', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.DEPENDENCY, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL, label: '读写' },
  { id: 'edge-6', relationId: 6, source: 'node-4', target: 'node-7', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.DEPENDENCY, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL, label: '只读' },
  { id: 'edge-7', relationId: 7, source: 'node-4', target: 'node-8', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.DEPENDENCY, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.WEAK, status: RelationStatus.NORMAL, label: '缓存' },
  { id: 'edge-8', relationId: 8, source: 'node-5', target: 'node-9', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.DEPENDENCY, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL, label: '消息' },
  { id: 'edge-9', relationId: 9, source: 'node-5', target: 'node-10', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.CALL, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.WEAK, status: RelationStatus.NORMAL, label: '支付回调' },
  { id: 'edge-10', relationId: 10, source: 'node-6', target: 'node-7', sourceAnchor: 'bottom', targetAnchor: 'top', relationType: RelationType.ASSOCIATE, direction: RelationDirection.UNIDIRECTIONAL, strength: RelationStrength.STRONG, status: RelationStatus.NORMAL, label: '主从同步' },
]

/**
 * 拓扑页面组件
 */
const TopologyPage: React.FC = () => {
  // 数据状态
  const [nodes, setNodes] = useState<TopologyNodeType[]>([])
  const [edges, setEdges] = useState<TopologyEdgeType[]>([])
  const [loading, setLoading] = useState(false)

  // 选择状态
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [connectSourceNode, setConnectSourceNode] = useState<TopologyNodeType | null>(null)
  const [connectTargetNode, setConnectTargetNode] = useState<TopologyNodeType | null>(null)
  const [editingEdge, setEditingEdge] = useState<TopologyEdgeType | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // 加载资源数据
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 使用模拟数据
      setNodes([...mockNodes])
      setEdges([...mockEdges])
    } catch (error) {
      message.error('加载数据失败')
      console.error('Failed to load topology data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 节点移动
  const handleNodeMove = useCallback((nodeId: string, position: Position) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
    )
  }, [])

  // 节点点击
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    setSelectedEdgeId(null)
  }, [])

  // 节点双击（打开资源详情）
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      window.open(`/resources/${node.resourceId}`, '_blank')
    }
  }, [nodes])

  // 连线点击
  const handleEdgeClick = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId)
    setSelectedNodeId(null)
  }, [])

  // 连线双击（打开编辑弹窗）
  const handleEdgeDoubleClick = useCallback((edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId)
    if (edge) {
      setEditingEdge(edge)
      setModalMode('edit')
      setModalOpen(true)
    }
  }, [edges])

  // 连接点连线
  const handleConnect = useCallback((source: ConnectionPoint, target: ConnectionPoint) => {
    const sourceNode = nodes.find((n) => n.id === source.nodeId)
    const targetNode = nodes.find((n) => n.id === target.nodeId)

    if (sourceNode && targetNode) {
      setConnectSourceNode(sourceNode)
      setConnectTargetNode(targetNode)
      setModalMode('create')
      setModalOpen(true)
    }
  }, [nodes])

  // 画布点击（取消选择）
  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [])

  // 创建关系
  const handleCreateRelation = useCallback(async (data: RelationFormData) => {
    setModalLoading(true)
    try {
      // TODO: 调用后端 API 创建关系
      // const relation = await createRelation(data)

      // 模拟创建成功，添加到本地状态
      const newEdge: TopologyEdgeType = {
        id: `edge-${Date.now()}`,
        relationId: Date.now(),
        source: `node-${data.sourceId}`,
        target: `node-${data.targetId}`,
        sourceAnchor: 'bottom',
        targetAnchor: 'top',
        relationType: data.relationType,
        direction: data.direction,
        strength: data.strength,
        status: RelationStatus.NORMAL,
        label: data.description,
      }

      setEdges((prev) => [...prev, newEdge])
      message.success('关系创建成功')
      setModalOpen(false)
      setConnectSourceNode(null)
      setConnectTargetNode(null)
    } catch (error) {
      message.error('创建关系失败')
      console.error('Failed to create relation:', error)
    } finally {
      setModalLoading(false)
    }
  }, [])

  // 更新关系
  const handleUpdateRelation = useCallback(async (data: RelationFormData) => {
    if (!editingEdge) return

    setModalLoading(true)
    try {
      // TODO: 调用后端 API 更新关系
      // await updateRelation(editingEdge.relationId, data)

      // 更新本地状态
      setEdges((prev) =>
        prev.map((edge) =>
          edge.id === editingEdge.id
            ? {
                ...edge,
                relationType: data.relationType,
                direction: data.direction,
                strength: data.strength,
                label: data.description,
              }
            : edge
        )
      )

      message.success('关系更新成功')
      setModalOpen(false)
      setEditingEdge(null)
    } catch (error) {
      message.error('更新关系失败')
      console.error('Failed to update relation:', error)
    } finally {
      setModalLoading(false)
    }
  }, [editingEdge])

  // 删除选中的关系
  const handleDeleteEdge = useCallback(async () => {
    if (!selectedEdgeId) return

    try {
      // TODO: 调用后端 API 删除关系
      // const edge = edges.find((e) => e.id === selectedEdgeId)
      // if (edge) await deleteRelation(edge.relationId)

      setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId))
      setSelectedEdgeId(null)
      message.success('关系删除成功')
    } catch (error) {
      message.error('删除关系失败')
      console.error('Failed to delete relation:', error)
    }
  }, [selectedEdgeId])

  // 弹窗提交
  const handleModalOk = useCallback((data: RelationFormData) => {
    if (modalMode === 'create') {
      handleCreateRelation(data)
    } else {
      handleUpdateRelation(data)
    }
  }, [modalMode, handleCreateRelation, handleUpdateRelation])

  // 弹窗取消
  const handleModalCancel = useCallback(() => {
    setModalOpen(false)
    setConnectSourceNode(null)
    setConnectTargetNode(null)
    setEditingEdge(null)
  }, [])

  // 手动添加关系
  const handleAddRelation = useCallback(() => {
    setConnectSourceNode(null)
    setConnectTargetNode(null)
    setEditingEdge(null)
    setModalMode('create')
    setModalOpen(true)
  }, [])

  return (
    <div className={styles.page}>
      <Card
        title="拓扑关系图"
        className={styles.card}
        extra={
          <Space>
            <Tooltip title="添加关系">
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddRelation}
              >
                添加关系
              </Button>
            </Tooltip>
            {selectedEdgeId && (
              <>
                <Tooltip title="编辑关系">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdgeDoubleClick(selectedEdgeId)}
                  />
                </Tooltip>
                <Popconfirm
                  title="确定删除该关系吗？"
                  onConfirm={handleDeleteEdge}
                  okText="确定"
                  cancelText="取消"
                >
                  <Tooltip title="删除关系">
                    <Button icon={<DeleteOutlined />} danger />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            <Tooltip title="刷新">
              <Button icon={<ReloadOutlined />} onClick={loadData} />
            </Tooltip>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {nodes.length === 0 && !loading ? (
            <Empty description="暂无资源数据" />
          ) : (
            <div className={styles.canvasWrapper}>
              <TopologyCanvas
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                selectedEdgeId={selectedEdgeId}
                onNodeMove={handleNodeMove}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                onEdgeDoubleClick={handleEdgeDoubleClick}
                onConnect={handleConnect}
                onCanvasClick={handleCanvasClick}
              />
            </div>
          )}
        </Spin>
      </Card>

      {/* 关系弹窗 */}
      <RelationModal
        open={modalOpen}
        mode={modalMode}
        sourceNode={connectSourceNode}
        targetNode={connectTargetNode}
        initialData={
          editingEdge
            ? {
                sourceId: parseInt(editingEdge.source.replace('node-', '')),
                targetId: parseInt(editingEdge.target.replace('node-', '')),
                relationType: editingEdge.relationType,
                direction: editingEdge.direction,
                strength: editingEdge.strength,
                description: editingEdge.label,
              }
            : undefined
        }
        nodes={nodes}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        loading={modalLoading}
      />
    </div>
  )
}

export default TopologyPage
