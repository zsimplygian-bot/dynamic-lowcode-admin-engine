import { useCallback, useMemo } from "react"
export function useDataTableColumns(
  columns: any[],
  customVisibility: Record<string, boolean> = {},
  setStorage: Function
) {
  const toggleColumn = useCallback((accessor: string) => {
    setStorage((prev: any) => {
      const vis = prev.ui?.columnVisibility || {}
      return { ...prev, ui: { ...prev.ui, columnVisibility: { ...vis, [accessor]: !(vis[accessor] ?? true) } } }
    })
  }, [])
  const { columnVisibility, visibleColumns } = useMemo(() => {
    const visibility: Record<string, boolean> = {}, visible: any[] = []
    for (const col of columns) {
      const isVisible = customVisibility[col.accessor] ?? !col.hidden
      visibility[col.accessor] = isVisible
      if (isVisible) visible.push(col)
    }
    return { columnVisibility: visibility, visibleColumns: visible }
  }, [columns, customVisibility])
  return { columnVisibility, visibleColumns, toggleColumn }
}