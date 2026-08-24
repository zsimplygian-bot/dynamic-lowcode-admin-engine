import { useCallback, useMemo } from 'react'

const EMPTY_OBJECT: Record<string, any> = {}

export function useDataTableSearch(
  columns: any[],
  searchValues: Record<string, any> = EMPTY_OBJECT,
  patchQuery: Function
) {
  const searchFields = useMemo(() => {
    const fields: any[] = []
    for (const col of columns) {
      if (col.searchable) fields.push({ id: col.accessor, name: col.accessor, label: col.header || col.accessor, type: col.type })
    }
    return fields
  }, [columns])

  const activeSearchCount = useMemo(() => {
    let count = 0
    for (const k in searchValues) { if (searchValues[k]) count++ }
    return count
  }, [searchValues])

  const setSearchValues = useCallback((values: Record<string, any>) => patchQuery({ appliedSearchValues: values || EMPTY_OBJECT }, true), [patchQuery])
  const clearSearchValues = useCallback(() => patchQuery({ appliedSearchValues: EMPTY_OBJECT }, true), [patchQuery])
  const setDateRange = useCallback((range: { from?: any; to?: any }) => patchQuery({ dateRange: range || EMPTY_OBJECT }, true), [patchQuery])

  return { searchFields, activeSearchCount, setSearchValues, clearSearchValues, setDateRange }
}