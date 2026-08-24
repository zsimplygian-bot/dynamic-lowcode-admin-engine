import { useCallback, useMemo } from 'react'

const EMPTY_OBJECT: Record<string, any> = {}

export function useDataTableColumns(
  columns: any[],
  customVisibility: Record<string, boolean> = EMPTY_OBJECT,
  setStorage: Function
) {
  const toggleColumn = useCallback((accessor: string) => {
    setStorage((prev: any) => {
      const currentUi = prev.ui || EMPTY_OBJECT
      const currentVis = currentUi.columnVisibility || EMPTY_OBJECT
      return { ...prev, ui: { ...currentUi, columnVisibility: { ...currentVis, [accessor]: !(currentVis[accessor] ?? true) } } }
    })
  }, [setStorage])

  const { columnVisibility, visibleColumns } = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    const visible: any[] = []
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i]
      const isVisible = customVisibility[col.accessor] ?? !col.hidden
      visibility[col.accessor] = isVisible
      if (isVisible) visible.push(col)
    }
    return { columnVisibility: visibility, visibleColumns: visible }
  }, [columns, customVisibility])

  return { columnVisibility, visibleColumns, toggleColumn }
}