/**
 * 拓扑画布组件 - 子图管理专用
 * Feature: F08 - 子图管理拓扑可视化
 * Adapted from: F04 TopologyCanvas
 * 
 * Performance Optimizations:
 * - REQ-NFR-003: Throttle drag events (16ms)
 * - REQ-NFR-003: Debounce position save (1000ms)
 */
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type {
  TopologyNode as TopologyNodeType,
  TopologyEdge as TopologyEdgeType,
  Position,
  ConnectionPoint,
  DragState,
  ConnectingState,
  ViewportState,
} from '@/types/topology'
import { NODE_CONSTANTS } from '@/types/topology'
import { TopologyNode } from './TopologyNode'
import { TopologyEdge, TempEdge } from './TopologyEdge'
import { throttle } from '@/utils/throttle'
import { debounce } from '@/utils/debounce'
import { DRAG_THROTTLE_DELAY, POSITION_SAVE_DEBOUNCE_DELAY } from '@/utils/throttle'
import styles from './TopologyCanvas.module.css'

export interface TopologyCanvasProps {
  nodes: TopologyNodeType[]
  edges: TopologyEdgeType[]
  selectedNodeId?: string | null
  selectedEdgeId?: string | null
  onNodeMove?: (nodeId: string, position: Position) => void
  onNodeClick?: (nodeId: string) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onEdgeClick?: (edgeId: string) => void
  onEdgeDoubleClick?: (edgeId: string) => void
  onConnect?: (source: ConnectionPoint, target: ConnectionPoint) => void
  onCanvasClick?: () => void
  readonly?: boolean // 子图管理中可能需要只读模式
}

/**
 * 拓扑画布组件
 */
export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onNodeMove,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onEdgeDoubleClick,
  onConnect,
  onCanvasClick,
  readonly = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 节点映射，方便查找
  const nodeMap = useMemo(() => {
    const map = new Map<string, TopologyNodeType>()
    nodes.forEach((node) => map.set(node.id, node))
    return map
  }, [nodes])

  // 视口状态
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    offset: { x: 0, y: 0 },
  })

  // 拖拽状态
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startPosition: null,
    offset: { x: 0, y: 0 },
  })

  // 连线状态
  const [connectingState, setConnectingState] = useState<ConnectingState>({
    isConnecting: false,
    sourcePoint: null,
    currentPosition: null,
  })

  // 画布拖拽状态
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 })

  // 空格键状态（用于空格+拖拽）
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  /**
   * 获取鼠标在SVG坐标系中的位置
   */
  const getMousePosition = useCallback((e: React.MouseEvent | MouseEvent): Position => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - viewport.offset.x) / viewport.zoom,
      y: (e.clientY - rect.top - viewport.offset.y) / viewport.zoom,
    }
  }, [viewport])

  /**
   * 获取节点连接点的实际坐标
   */
  const getAnchorPosition = useCallback((nodeId: string, anchor: 'top' | 'bottom'): Position | null => {
    const node = nodeMap.get(nodeId)
    if (!node) return null
    const { WIDTH, HEIGHT } = NODE_CONSTANTS
    return {
      x: node.position.x + WIDTH / 2,
      y: node.position.y + (anchor === 'top' ? 0 : HEIGHT),
    }
  }, [nodeMap])

  // ==================== 节点拖拽处理 ====================

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (readonly) return // 只读模式禁用拖拽
    if (e.button !== 0) return // 只响应左键
    const mousePos = getMousePosition(e)
    const node = nodeMap.get(nodeId)
    if (!node) return

    setDragState({
      isDragging: true,
      nodeId,
      startPosition: mousePos,
      offset: {
        x: mousePos.x - node.position.x,
        y: mousePos.y - node.position.y,
      },
    })
  }, [readonly, getMousePosition, nodeMap])

  /**
   * Throttled node move handler
   * REQ-NFR-003: Throttle drag events to 16ms (60fps)
   */
  const throttledNodeMove = useMemo(
    () => throttle((nodeId: string, position: Position) => {
      onNodeMove?.(nodeId, position)
    }, DRAG_THROTTLE_DELAY),
    [onNodeMove]
  )

  /**
   * Debounced position save handler
   * REQ-NFR-003: Debounce position save to 1000ms
   */
  const debouncedPositionSave = useMemo(
    () => debounce((nodeId: string, position: Position) => {
      // Save position to localStorage or backend
      // This is called after drag ends
      onNodeMove?.(nodeId, position)
    }, POSITION_SAVE_DEBOUNCE_DELAY),
    [onNodeMove]
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const mousePos = getMousePosition(e)

    // 处理节点拖拽 - with throttling
    if (dragState.isDragging && dragState.nodeId) {
      const newPosition = {
        x: mousePos.x - dragState.offset.x,
        y: mousePos.y - dragState.offset.y,
      }
      // Use throttled move for smooth performance
      throttledNodeMove(dragState.nodeId, newPosition)
    }

    // 处理连线拖拽
    if (connectingState.isConnecting) {
      setConnectingState((prev) => ({
        ...prev,
        currentPosition: mousePos,
      }))
    }

    // 处理画布平移
    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setViewport((prev) => ({
        ...prev,
        offset: {
          x: prev.offset.x + dx,
          y: prev.offset.y + dy,
        },
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [
    getMousePosition,
    dragState,
    connectingState.isConnecting,
    isPanning,
    panStart,
    throttledNodeMove,
  ])

  const handleMouseUp = useCallback(() => {
    // 结束节点拖拽
    if (dragState.isDragging && dragState.nodeId) {
      // Get final position and save with debounce
      const node = nodeMap.get(dragState.nodeId)
      if (node) {
        debouncedPositionSave(dragState.nodeId, node.position)
      }
      
      setDragState({
        isDragging: false,
        nodeId: null,
        startPosition: null,
        offset: { x: 0, y: 0 },
      })
    }

    // 结束连线拖拽（如果没有在有效目标上释放）
    if (connectingState.isConnecting) {
      setConnectingState({
        isConnecting: false,
        sourcePoint: null,
        currentPosition: null,
      })
    }

    // 结束画布平移
    if (isPanning) {
      setIsPanning(false)
    }
  }, [dragState.isDragging, dragState.nodeId, connectingState.isConnecting, isPanning, nodeMap, debouncedPositionSave])

  // ==================== 连接点交互处理 ====================

  const handleAnchorMouseDown = useCallback((
    _: React.MouseEvent,
    nodeId: string,
    anchor: 'top' | 'bottom'
  ) => {
    if (readonly) return // 只读模式禁用连线
    const position = getAnchorPosition(nodeId, anchor)
    if (!position) return

    setConnectingState({
      isConnecting: true,
      sourcePoint: { nodeId, anchor, position },
      currentPosition: position,
    })
  }, [readonly, getAnchorPosition])

  const handleAnchorMouseUp = useCallback((
    _: React.MouseEvent,
    nodeId: string,
    anchor: 'top' | 'bottom'
  ) => {
    if (readonly) return // 只读模式禁用连线
    if (!connectingState.isConnecting || !connectingState.sourcePoint) return

    // 不能连接到自己
    if (connectingState.sourcePoint.nodeId === nodeId) {
      setConnectingState({
        isConnecting: false,
        sourcePoint: null,
        currentPosition: null,
      })
      return
    }

    const targetPosition = getAnchorPosition(nodeId, anchor)
    if (!targetPosition) return

    // 触发连接回调
    onConnect?.(connectingState.sourcePoint, {
      nodeId,
      anchor,
      position: targetPosition,
    })

    // 重置连线状态
    setConnectingState({
      isConnecting: false,
      sourcePoint: null,
      currentPosition: null,
    })
  }, [readonly, connectingState, getAnchorPosition, onConnect])

  // ==================== 画布交互处理 ====================

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // 中键、右键、或按住空格+左键时平移画布
    if (e.button === 1 || e.button === 2 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      e.preventDefault()
      return
    }

    // 左键点击空白处开始平移
    if (e.button === 0 && e.target === svgRef.current) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [isSpacePressed])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // 点击空白处取消选择
    if (e.target === svgRef.current) {
      onCanvasClick?.()
    }
  }, [onCanvasClick])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 3)

    // 以鼠标位置为中心缩放
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setViewport((prev) => ({
      zoom: newZoom,
      offset: {
        x: mouseX - (mouseX - prev.offset.x) * (newZoom / prev.zoom),
        y: mouseY - (mouseY - prev.offset.y) * (newZoom / prev.zoom),
      },
    }))
  }, [viewport.zoom])

  // ==================== 全局事件监听 ====================

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true)
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleMouseUp])

  // ==================== 渲染 ====================

  // 计算光标样式
  const canvasCursor = isPanning ? 'grabbing' : isSpacePressed ? 'grab' : 'default'

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <svg
        ref={svgRef}
        className={styles.canvas}
        style={{ cursor: canvasCursor }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <g transform={`translate(${viewport.offset.x}, ${viewport.offset.y}) scale(${viewport.zoom})`}>
          {/* 渲染连线 */}
          <g className={styles.edgesLayer}>
            {edges.map((edge) => {
              const sourceNode = nodeMap.get(edge.source)
              const targetNode = nodeMap.get(edge.target)
              if (!sourceNode || !targetNode) return null

              return (
                <TopologyEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  selected={selectedEdgeId === edge.id}
                  onClick={onEdgeClick}
                  onDoubleClick={onEdgeDoubleClick}
                />
              )
            })}

            {/* 临时连线（拖拽中） */}
            {connectingState.isConnecting &&
              connectingState.sourcePoint &&
              connectingState.currentPosition && (
              <TempEdge
                sourcePosition={connectingState.sourcePoint.position}
                targetPosition={connectingState.currentPosition}
                sourceAnchor={connectingState.sourcePoint.anchor}
              />
            )}
          </g>

          {/* 渲染节点 */}
          <g className={styles.nodesLayer}>
            {nodes.map((node) => (
              <TopologyNode
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id}
                connecting={connectingState.isConnecting}
                onMouseDown={handleNodeMouseDown}
                onAnchorMouseDown={handleAnchorMouseDown}
                onAnchorMouseUp={handleAnchorMouseUp}
                onClick={onNodeClick}
                onDoubleClick={onNodeDoubleClick}
              />
            ))}
          </g>
        </g>
      </svg>

      {/* 缩放控制 */}
      <div className={styles.zoomControl}>
        <button
          className={styles.zoomButton}
          onClick={() => {
            const newZoom = Math.min(viewport.zoom + 0.1, 3)
            setViewport((prev) => ({ ...prev, zoom: newZoom }))
          }}
          title="放大"
        >
          +
        </button>
        <span className={styles.zoomInfo}>
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          className={styles.zoomButton}
          onClick={() => {
            const newZoom = Math.max(viewport.zoom - 0.1, 0.1)
            setViewport((prev) => ({ ...prev, zoom: newZoom }))
          }}
          title="缩小"
        >
          −
        </button>
      </div>
    </div>
  )
}

export default TopologyCanvas
