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
import { TopologyCanvas, RelationModal } from './components'
import type { RelationFormData } from './components'
import {
  getRelationshipList,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  relationshipToEdge,
  resourceToNode,
} from '@/services/topology'
import { getResourceList } from '@/services/resource'
import { isHandledError } from '@/utils/request'
import styles from './index.module.css'

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

  // 保存节点位置到 localStorage
  const saveNodePositions = useCallback((nodeList: TopologyNodeType[]) => {
    const positions: Record<string, Position> = {}
    nodeList.forEach((node) => {
      positions[node.id] = node.position
    })
    localStorage.setItem('topology-node-positions', JSON.stringify(positions))
  }, [])

  // 从 localStorage 读取节点位置
  const loadNodePositions = useCallback((): Record<string, Position> => {
    try {
      const saved = localStorage.getItem('topology-node-positions')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  // 自动布局节点（当没有保存位置时）
  const autoLayoutNodes = useCallback((nodeList: TopologyNodeType[]): TopologyNodeType[] => {
    const savedPositions = loadNodePositions()
    const COLS = 4 // 每行节点数
    const X_GAP = 200 // 水平间距
    const Y_GAP = 150 // 垂直间距
    const START_X = 100 // 起始 X
    const START_Y = 50 // 起始 Y

    return nodeList.map((node, index) => {
      // 如果有保存的位置，使用保存的位置
      if (savedPositions[node.id]) {
        return { ...node, position: savedPositions[node.id] }
      }
      // 否则自动布局
      const col = index % COLS
      const row = Math.floor(index / COLS)
      return {
        ...node,
        position: {
          x: START_X + col * X_GAP,
          y: START_Y + row * Y_GAP,
        },
      }
    })
  }, [loadNodePositions])

  // 加载资源数据
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 并行加载资源列表和关系列表
      const [resourceResult, relationshipResult] = await Promise.all([
        getResourceList({ page: 1, size: 100 }),
        getRelationshipList({ pageNum: 1, pageSize: 100 }),
      ])

      // 转换资源为节点
      const nodeList = resourceResult.content.map((resource) =>
        resourceToNode(resource, { x: 100, y: 100 })
      )

      // 应用保存的位置或自动布局
      const layoutedNodes = autoLayoutNodes(nodeList)

      // 转换关系为边
      const edgeList = relationshipResult.content.map(relationshipToEdge)

      setNodes(layoutedNodes)
      setEdges(edgeList)
    } catch (error) {
      message.error('加载数据失败')
      console.error('Failed to load topology data:', error)
    } finally {
      setLoading(false)
    }
  }, [autoLayoutNodes])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 节点移动
  const handleNodeMove = useCallback((nodeId: string, position: Position) => {
    setNodes((prev) => {
      const newNodes = prev.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
      // 保存位置到 localStorage
      saveNodePositions(newNodes)
      return newNodes
    })
  }, [saveNodePositions])

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
      // 调用后端 API 创建关系
      const relationshipData = await createRelationship({
        sourceResourceId: data.sourceId,
        targetResourceId: data.targetId,
        relationshipType: data.relationType,
        direction: data.direction,
        strength: data.strength,
        description: data.description,
      })

      // 添加到本地状态
      const newEdge = relationshipToEdge(relationshipData)
      setEdges((prev) => [...prev, newEdge])
      message.success('关系创建成功')
      setModalOpen(false)
      setConnectSourceNode(null)
      setConnectTargetNode(null)
    } catch (error) {
      // 已处理的错误（如 403）无需再显示 toast
      if (!isHandledError(error)) {
        message.error('创建关系失败')
      }
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
      // 调用后端 API 更新关系
      const updatedData = await updateRelationship(editingEdge.relationId, {
        relationshipType: data.relationType,
        strength: data.strength,
        description: data.description,
      })

      // 更新本地状态
      const updatedEdge = relationshipToEdge(updatedData)
      setEdges((prev) =>
        prev.map((edge) =>
          edge.id === editingEdge.id ? updatedEdge : edge
        )
      )

      message.success('关系更新成功')
      setModalOpen(false)
      setEditingEdge(null)
    } catch (error) {
      // 已处理的错误（如 403）无需再显示 toast
      if (!isHandledError(error)) {
        message.error('更新关系失败')
      }
      console.error('Failed to update relation:', error)
    } finally {
      setModalLoading(false)
    }
  }, [editingEdge])

  // 删除选中的关系
  const handleDeleteEdge = useCallback(async () => {
    if (!selectedEdgeId) return

    try {
      // 查找要删除的边
      const edge = edges.find((e) => e.id === selectedEdgeId)
      if (edge) {
        // 调用后端 API 删除关系
        await deleteRelationship(edge.relationId)
      }

      setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId))
      setSelectedEdgeId(null)
      message.success('关系删除成功')
    } catch (error) {
      // 已处理的错误（如 403）无需再显示 toast
      if (!isHandledError(error)) {
        message.error('删除关系失败')
      }
      console.error('Failed to delete relation:', error)
    }
  }, [selectedEdgeId, edges])

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
