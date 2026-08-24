import { useMemo } from 'react'

export function useDataTablePagination(
  queryPage: number | undefined,
  querySize: number | undefined,
  totalRows: number,
  resPage: number | undefined,
  resPerPage: number | undefined,
  patchQuery: Function
) {
  return useMemo(() => {
    const currentPageIndex = queryPage ?? (resPage ? resPage - 1 : 0)
    const currentPageSize = querySize ?? (resPerPage || 10)
    const totalPages = Math.max(1, Math.ceil(totalRows / currentPageSize))

    return {
      pageIndex: currentPageIndex,
      pageSize: currentPageSize,
      totalRows,
      totalPages,
      isFirstPage: currentPageIndex === 0,
      isLastPage: currentPageIndex >= totalPages - 1,
      goToPage: (page: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, page - 1)) }),
      changePageSize: (pageSize: number) => patchQuery({ pageSize: Math.max(pageSize, 1) }, true),
      goToFirstPage: () => patchQuery({ pageIndex: 0 }),
      goToPreviousPage: () => patchQuery({ pageIndex: Math.max(0, currentPageIndex - 1) }),
      goToNextPage: () => patchQuery({ pageIndex: Math.min(totalPages - 1, currentPageIndex + 1) }),
      goToLastPage: () => patchQuery({ pageIndex: Math.max(0, totalPages - 1) })
    }
  }, [queryPage, querySize, totalRows, resPage, resPerPage, patchQuery])
}