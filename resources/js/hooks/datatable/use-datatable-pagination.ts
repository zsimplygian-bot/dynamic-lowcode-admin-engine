import { useMemo } from "react"
type PatchFn = (patch: Record<string, any>, resetPage?: boolean) => void
export function useDataTablePagination(
  queryPage: number | undefined, querySize: number | undefined, totalRows: number,
  resPage: number | undefined, resPerPage: number | undefined, patchQuery: PatchFn
) {
  return useMemo(() => {
    const pageIndex = queryPage ?? (resPage ? resPage - 1 : 0), pageSize = querySize ?? (resPerPage || 10)
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
    const setPage = (p: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, p)) })
    return {
      pageIndex, pageSize, totalRows, totalPages,
      isFirstPage: pageIndex === 0, isLastPage: pageIndex >= totalPages - 1,
      goToPage: (p: number) => setPage(p - 1),
      goToFirstPage: () => setPage(0),
      goToPreviousPage: () => setPage(pageIndex - 1),
      goToNextPage: () => setPage(pageIndex + 1),
      goToLastPage: () => setPage(totalPages - 1),
      changePageSize: (size: number) => patchQuery({ pageSize: Math.max(size, 1) }, true),
    }
  }, [queryPage, querySize, totalRows, resPage, resPerPage, patchQuery])
}