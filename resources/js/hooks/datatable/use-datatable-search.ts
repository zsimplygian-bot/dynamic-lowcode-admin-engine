import { useCallback, useMemo } from "react"
export function useDataTableSearch(
  columns: any[],
  searchValues: Record<string, any> = {},
  patchQuery: (patch: any, resetPage?: boolean) => void
) {
  const searchFields = useMemo(() => 
    columns
      .filter((col) => col.searchable)
      .map((col) => ({ id: col.accessor, name: col.accessor, label: col.header, type: col.type })),
    [columns]
  )
  const activeSearchCount = useMemo(() => {
    let count = 0
    for (const k in searchValues) {
      const v = searchValues[k]
      if (v !== "" && v !== null && v !== undefined) count++
    }
    return count
  }, [searchValues])
  const setSearchValues = useCallback((values: Record<string, any>) => patchQuery({ appliedSearchValues: values || {} }, true), [])
  const clearSearchValues = useCallback(() => patchQuery({ appliedSearchValues: {} }, true), [])
  const setDateRange = useCallback((range: Record<string, any>) => patchQuery({ dateRange: range || {} }, true), [])
  return { searchFields, activeSearchCount, setSearchValues, clearSearchValues, setDateRange }
}