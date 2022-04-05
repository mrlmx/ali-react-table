import React from 'react'
import { ArtColumn } from '../interfaces'

export type VirtualEnum = false | true | 'auto'

export interface VerticalRenderRange {
  topIndex: number
  topBlank: number
  bottomIndex: number
  bottomBlank: number
}

export interface HorizontalRenderRange {
  leftIndex: number
  leftBlank: number
  rightIndex: number
  rightBlank: number
}

// VisibleColumnDescriptor 用于在表格内部描述「那些在页面中可见的列」
export type VisibleColumnDescriptor =
  | { type: 'blank'; blankSide: 'left' | 'right'; width: number }
  | { type: 'normal'; colIndex: number; col: ArtColumn }

export interface ResolvedUseVirtual {
  horizontal: boolean
  vertical: boolean
  header: boolean
  direction: DirectionType
}

export interface RenderInfo {
  verticalRenderRange: VerticalRenderRange
  horizontalRenderRange: HorizontalRenderRange
  visible: VisibleColumnDescriptor[]

  flat: { full: ArtColumn[]; left: ArtColumn[]; center: ArtColumn[]; right: ArtColumn[] }
  nested: { full: ArtColumn[]; left: ArtColumn[]; center: ArtColumn[]; right: ArtColumn[] }
  stickyLeftMap: Map<number, number>
  stickyRightMap: Map<number, number>
  useVirtual: ResolvedUseVirtual

  /** props.columns 是否包含有效的锁列 */
  hasLockColumn: boolean
  /** 左侧锁定列的总宽度 */
  leftLockTotalWidth: number
  /** 右侧锁定列的总宽度 */
  rightLockTotalWidth: number
}

/**
 * 滚动方向
 */
export type DirectionType = 'up' | 'down' | 'left' | 'right'

/**
 * 虚拟滚动缓冲区
 */
export interface VirtualBuffer {
  // 横向缓冲区
  horizontal?: number
  // 纵向缓冲区
  vertical?: number
}
