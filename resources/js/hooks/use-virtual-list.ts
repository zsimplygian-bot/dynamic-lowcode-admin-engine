import { useState, useEffect, useRef, useMemo } from "react"
interface UseVirtualListOptions {
  data: any[]
  enabled?: boolean
  rowHeight?: number
  overscan?: number
  resetTrigger?: any
}
export function useVirtualList({ data, enabled = true, rowHeight = 33, overscan = 20, resetTrigger, }: UseVirtualListOptions) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ scrollTop: 0, height: 600 })
  useEffect(() => {
    if (!enabled) return
    const el = scrollRef.current
    if (!el) return
    let frameId: number
    const onScroll = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => setViewport((v) => ({ ...v, scrollTop: el.scrollTop })))
    }
    const observer = new ResizeObserver(([entry]) =>
      setViewport((v) => ({ ...v, height: entry.contentRect.height }))
    )
    observer.observe(el)
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      el.removeEventListener("scroll", onScroll)
    }
  }, [enabled])
  useEffect(() => {
    if (enabled && scrollRef.current) scrollRef.current.scrollTop = 0
  }, [enabled, resetTrigger])
  return useMemo(() => {
    const totalRows = data?.length || 0
    if (!enabled) {
      return { scrollRef, visibleRows: data || [], startIndex: 0, paddingTop: 0, paddingBottom: 0 }
    }
    const startIndex = Math.max(0, Math.floor(viewport.scrollTop / rowHeight) - overscan)
    const endIndex = Math.min(totalRows, Math.ceil((viewport.scrollTop + viewport.height) / rowHeight) + overscan)
    return {
      scrollRef,
      visibleRows: data ? data.slice(startIndex, endIndex) : [],
      startIndex,
      paddingTop: startIndex * rowHeight,
      paddingBottom: (totalRows - endIndex) * rowHeight,
    }
  }, [data, enabled, viewport.scrollTop, viewport.height, rowHeight, overscan])
}