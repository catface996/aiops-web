/**
 * 拓扑工具栏组件
 *
 * 提供统一的拓扑图工具栏，包括：
 * - 布局选择
 * - 导出PNG/SVG
 * - 刷新按钮
 * - 可选的添加关系/节点按钮
 */
import React, { useCallback } from 'react';
import { Button, Space, Select, Tooltip, message } from 'antd';
import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

export type LayoutType = 'force' | 'hierarchical' | 'circular';

export interface TopologyToolbarProps {
  /** 当前布局类型 */
  layout?: LayoutType;
  /** 布局类型变更回调 */
  onLayoutChange?: (layout: LayoutType) => void;
  /** 是否显示布局选择器 */
  showLayoutSelector?: boolean;
  /** 是否显示导出按钮 */
  showExport?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 添加按钮文本 */
  addButtonText?: string;
  /** 添加按钮回调 */
  onAdd?: () => void;
  /** 是否显示添加按钮 */
  showAddButton?: boolean;
  /** 额外的工具栏内容（在添加按钮之前） */
  extraContent?: React.ReactNode;
  /** SVG 元素引用，用于导出 */
  svgRef?: React.RefObject<SVGSVGElement>;
}

/**
 * 布局选项
 */
const layoutOptions = [
  { label: '力导向布局', value: 'force' as LayoutType },
  { label: '层次布局', value: 'hierarchical' as LayoutType },
  { label: '环形布局', value: 'circular' as LayoutType },
];

/**
 * 拓扑工具栏组件
 */
export const TopologyToolbar: React.FC<TopologyToolbarProps> = ({
  layout = 'force',
  onLayoutChange,
  showLayoutSelector = true,
  showExport = true,
  onRefresh,
  addButtonText = '添加',
  onAdd,
  showAddButton = false,
  extraContent,
  svgRef,
}) => {
  /**
   * 导出为PNG
   */
  const handleExportPNG = useCallback(() => {
    if (!svgRef?.current) {
      message.info('PNG导出功能即将上线');
      return;
    }

    try {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // 获取SVG尺寸
      const bbox = svg.getBoundingClientRect();
      canvas.width = bbox.width * 2; // 2x for better quality
      canvas.height = bbox.height * 2;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);

          // 下载
          const link = document.createElement('a');
          link.download = `topology-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          message.success('PNG导出成功');
        }
      };

      img.onerror = () => {
        message.error('PNG导出失败');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Export PNG failed:', error);
      message.info('PNG导出功能即将上线');
    }
  }, [svgRef]);

  /**
   * 导出为SVG
   */
  const handleExportSVG = useCallback(() => {
    if (!svgRef?.current) {
      message.info('SVG导出功能即将上线');
      return;
    }

    try {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `topology-${Date.now()}.svg`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
      message.success('SVG导出成功');
    } catch (error) {
      console.error('Export SVG failed:', error);
      message.info('SVG导出功能即将上线');
    }
  }, [svgRef]);

  return (
    <Space>
      {/* 布局选择器 */}
      {showLayoutSelector && (
        <Tooltip title="选择布局算法">
          <Select
            value={layout}
            onChange={onLayoutChange}
            style={{ width: 120 }}
            options={layoutOptions}
          />
        </Tooltip>
      )}

      {/* 导出按钮 */}
      {showExport && (
        <>
          <Tooltip title="导出为PNG">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportPNG}
            >
              PNG
            </Button>
          </Tooltip>

          <Tooltip title="导出为SVG">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportSVG}
            >
              SVG
            </Button>
          </Tooltip>
        </>
      )}

      {/* 刷新按钮 */}
      {onRefresh && (
        <Tooltip title="刷新">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        </Tooltip>
      )}

      {/* 额外内容 */}
      {extraContent}

      {/* 添加按钮 */}
      {showAddButton && onAdd && (
        <Tooltip title={addButtonText}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            {addButtonText}
          </Button>
        </Tooltip>
      )}
    </Space>
  );
};

export default TopologyToolbar;
