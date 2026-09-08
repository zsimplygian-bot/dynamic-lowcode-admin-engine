import { useMemo } from "react"
import { useApi } from "@/hooks/use-api"
import { useDataTableStorage } from "./use-datatable-storage"
interface UseDataTableOptions { tableName: string; endpoint: string }
const EMPTY_ARR: any[] = []
const DEFAULT_STORAGE = {
  query: { pageIndex: 0, pageSize: undefined as number | undefined, search: "", appliedSearchValues: {}, dateRange: {}, sortBy: undefined, sortOrder: undefined },
  ui: { columnVisibility: {} as Record<string, boolean> },
}
export const useDataTable = ({ tableName, endpoint }: UseDataTableOptions) => {
  const idKey = `id_${tableName}`
  const { storedValue, setStorage, clearStorage } = useDataTableStorage(tableName, DEFAULT_STORAGE)
  const { query, ui } = storedValue
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder } = query
  const rawPageIndex = query.pageIndex || 0
  const patchQuery = (patch: Record<string, any>, resetPage = false) => setStorage((prev) => ({ ...prev, query: { ...prev.query, ...patch, ...(resetPage && { pageIndex: 0 }) } }))
  const apiConfig = useMemo(() => ({
    params: { ...appliedSearchValues, page: rawPageIndex + 1,
      ...(query.pageSize && { per_page: query.pageSize }),
      ...(search && { search }),
      ...(sortBy && { sort_by: sortBy, sort_order: sortOrder || "desc" }),
      ...(dateRange.from && { from: dateRange.from }),
      ...(dateRange.to && { to: dateRange.to }),
    }
  }), [query])
  const { data: res, isLoading, error, refetch } = useApi(endpoint, { enabled: Boolean(endpoint), config: apiConfig })
  const data = res?.data ?? EMPTY_ARR
  const columns = res?.columns ?? EMPTY_ARR
  const totalRows = res?.total ?? 0
  const backendPerPage = res?.per_page ?? 10
  const pageSize = query.pageSize || backendPerPage
  const { columnVisibility, visibleColumns } = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    const visible = columns.filter((col: any) => {
      const isVis = ui.columnVisibility[col.accessor] ?? !col.hidden
      visibility[col.accessor] = isVis
      return isVis
    })
    return { columnVisibility: visibility, visibleColumns: visible }
  }, [columns, ui.columnVisibility])
  const toggleColumn = (accessor: string) => setStorage((prev) => ({ ...prev, ui: { ...prev.ui, columnVisibility: { ...prev.ui.columnVisibility, [accessor]: !columnVisibility[accessor] } } }))
  const handleSort = (accessor: string) => {
    const next = sortBy !== accessor ? "asc" : sortOrder === "asc" ? "desc" : undefined; patchQuery({ sortBy: next ? accessor : undefined, sortOrder: next }, true)
  }
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))
  const goTo = (p: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, p - 1)) })
  const pagination = { pageIndex, pageSize, totalRows, totalPages, isFirstPage: pageIndex === 0, isLastPage: pageIndex >= totalPages - 1,
    goToPage: goTo,
    goToFirstPage: () => goTo(1),
    goToPreviousPage: () => goTo(pageIndex),
    goToNextPage: () => goTo(pageIndex + 2),
    goToLastPage: () => goTo(totalPages),
    changePageSize: (size: number) => patchQuery({ pageSize: Math.max(size, 1) }, true),
  }
  const searchFields = useMemo(() => columns.filter((c: any) => c.searchable).map((c: any) => ({ id: c.accessor, name: c.accessor, label: c.header, type: c.type })), [columns])
  const activeSearchCount = Object.values(appliedSearchValues).filter(Boolean).length
  const getId = (row: any) => row?.[idKey] ?? row?.id
  const getRowKey = (row: any, i: number) => getId(row) ?? i
  const setSearchValues = (values: any) => patchQuery({ appliedSearchValues: values || {} }, true)
  const isFiltered = Boolean(activeSearchCount || search || dateRange.from || dateRange.to || sortBy || pageIndex > 0 || (query.pageSize && query.pageSize !== backendPerPage))
  return {
    getId, getRowKey, data, columns, totalRows, visibleColumns, columnVisibility, pagination, searchFields, activeSearchCount, globalSearch: search, appliedSearchValues, dateRange, 
    isFiltered, loading: isLoading, error, sortBy, sortOrder, handleSort, resetAll: clearStorage, toggleColumn, setSearchValues, fetchData: refetch,
    clearSearchValues: () => setSearchValues({}),
    setGlobalSearch: (s: string) => patchQuery({ search: s }, true),
    setDateRange: (range: any) => patchQuery({ dateRange: range || {} }, true),
  }
}