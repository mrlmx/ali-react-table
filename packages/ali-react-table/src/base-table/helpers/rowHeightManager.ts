import { DirectionType, VerticalRenderRange, VirtualBuffer } from '../interfaces'
import { OVERSCAN_SIZE, sum } from '../utils'

export function getFullRenderRange(rowCount: number): VerticalRenderRange {
  return {
    topIndex: 0,
    topBlank: 0,
    bottomIndex: rowCount,
    bottomBlank: 0,
  }
}

export function makeRowHeightManager(initRowCount: number, estimatedRowHeight: number) {
  const cache = new Array<number>(initRowCount).fill(estimatedRowHeight)

  function getRenderRange(
    offset: number,
    maxRenderHeight: number,
    rowCount: number,
    direction: DirectionType,
    virtualBuffer: VirtualBuffer,
  ) {
    if (cache.length !== rowCount) {
      setRowCount(rowCount)
    }

    if (maxRenderHeight <= 0) {
      // maxRenderHeight <= 0 说明表格目前在 viewport 之外
      if (offset <= 0) {
        // 表格在 viewport 下方
        return getRenderRangeWhenBelowView()
      } else {
        // 表格在 viewport 上方
        return getRenderRangeWhenAboveView()
      }
    } else {
      // 表格与 viewport 相交
      return getRenderRangeWhenInView()
    }

    function getRenderRangeWhenBelowView(): VerticalRenderRange {
      const start = { topIndex: 0, topBlank: 0 }
      const end = getEnd(0, start)
      return { ...start, ...end }
    }

    function getRenderRangeWhenAboveView(): VerticalRenderRange {
      const totalSize = getEstimatedTotalSize(rowCount)
      const start = getStart(totalSize)
      const end = getEnd(totalSize, start)
      return { ...start, ...end }
    }

    function getRenderRangeWhenInView(): VerticalRenderRange {
      const start = getStart(offset)
      const end = getEnd(offset + maxRenderHeight, start)
      return { ...start, ...end }
    }

    /** 获取虚拟滚动在 开始位置上的信息 */
    function getStart(offset: number) {
      if (cache.length === 0) {
        return { topIndex: 0, topBlank: 0 }
      }

      let topIndex = 0
      let topBlank = 0
      while (topIndex < cache.length) {
        const h = cache[topIndex]
        // 当前滚动方向是「向上滚动」，则增大上方的缓冲区
        if (virtualBuffer.vertical && direction === 'up') {
          // 如果 当前高度 <= 缓冲距离，则直接停止
          if (offset <= virtualBuffer.vertical) {
            break
          }
          // 当前高度 减去 缓冲区的高度，将缓冲区的内容渲染出来
          if (topBlank + h >= offset - virtualBuffer.vertical) {
            break
          }
        } else {
          // 如果没有开启缓冲区 或者 当前滚动方向是「向下滚动」，则执行原有逻辑，这样可以减少上方渲染内容
          if (topBlank + h >= offset) {
            break
          }
        }
        topBlank += h
        topIndex += 1
      }
      return overscanUpwards(topIndex, topBlank)
    }

    function overscanUpwards(topIndex: number, topBlank: number) {
      let overscanSize = 0
      let overscanCount = 0
      while (overscanCount < topIndex && overscanSize < OVERSCAN_SIZE) {
        overscanCount += 1
        overscanSize += cache[topIndex - overscanCount]
      }
      return {
        topIndex: topIndex - overscanCount,
        topBlank: topBlank - overscanSize,
      }
    }

    /** 获取虚拟滚动 在结束位置上的信息 */
    function getEnd(endOffset: number, startInfo: Pick<VerticalRenderRange, 'topIndex' | 'topBlank'>) {
      let bottomIndex = startInfo.topIndex
      let offset = startInfo.topBlank
      // 当前滚动方向是「向下滚动」，增大下方的缓冲区
      if (virtualBuffer.vertical && direction === 'down') {
        // 底部条数 < 总条数 & 当前高度 < [最大高度 + 缓冲区的高度]（总值可能远超于容器的总高度）
        while (bottomIndex < rowCount && offset < endOffset + virtualBuffer.vertical) {
          offset += cache[bottomIndex]
          bottomIndex += 1
        }
      } else {
        // 如果没有开启缓冲区 或者 当前滚动方向是「向上滚动」，则执行原有逻辑，这样可以减少下方渲染内容
        while (bottomIndex < rowCount && offset < endOffset) {
          offset += cache[bottomIndex]
          bottomIndex += 1
        }
      }
      const bottomBlank = getEstimatedTotalSize(rowCount) - offset
      return overscanDownwards(bottomIndex, bottomBlank)
    }

    function overscanDownwards(bottomIndex: number, bottomBlank: number) {
      let overscanSize = 0
      let overscanCount = 0
      while (overscanCount < rowCount - bottomIndex && overscanSize < OVERSCAN_SIZE) {
        overscanSize += cache[bottomIndex + overscanCount]
        overscanCount += 1
      }
      return {
        bottomIndex: bottomIndex + overscanCount,
        bottomBlank: bottomBlank - overscanSize,
      }
    }

    function getEstimatedTotalSize(rowCount: number) {
      return sum(cache) + (rowCount - cache.length) * estimatedRowHeight
    }

    function setRowCount(count: number) {
      // 将 cache 的长度设置为 count
      if (count < cache.length) {
        cache.length = count
      } else {
        const prevSize = cache.length
        cache.length = count
        cache.fill(estimatedRowHeight, prevSize)
      }
    }
  }

  function updateRow(index: number, offset: number, size: number) {
    cache[index] = size
  }

  return {
    getRenderRange,
    updateRow,
    // 导出 cache，方便调试；上层在实际使用时 并不需要使用 cache 字段
    cache,
  }
}
