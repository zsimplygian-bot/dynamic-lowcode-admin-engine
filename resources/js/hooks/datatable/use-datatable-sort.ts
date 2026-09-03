import { useCallback } from "react"
export function useDataTableSort(
  sortBy: string | undefined, 
  sortOrder: "asc" | "desc" | undefined,
  patchQuery: (patch: any, resetPage?: boolean) => void,
  defaultOrder: "asc" | "desc" = "desc"
) {
  const effectiveSortOrder = sortBy ? (sortOrder || defaultOrder) : undefined
  const handleSort = useCallback((accessor: string) => {
    patchQuery((q: any) => {
      const next = q.sortBy !== accessor ? "asc" : q.sortOrder === "asc" ? "desc" : undefined
      return { ...q, sortBy: next ? accessor : undefined, sortOrder: next }
    }, true)
  }, [patchQuery])
  return { sortBy, sortOrder: effectiveSortOrder, handleSort }
}