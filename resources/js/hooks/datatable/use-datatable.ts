import { useCallback, useMemo } from "react"
import { useApi } from "@/hooks/use-api"
import { useDataTableStorage } from "./use-datatable-storage"
import { useDataTableColumns } from "./use-datatable-columns"
import { useDataTableSearch } from "./use-datatable-search"
import { useDataTablePagination } from "./use-datatable-pagination"

interface UseDataTableOptions {
  tableName: string
  endpoint: string
  columns?: any[]
}

const EMPTY_ARRAY: any[] = []
const EMPTY_OBJECT: Record<string, any> = {}

export const useDataTable = ({ tableName, endpoint, columns = EMPTY_ARRAY }: UseDataTableOptions) => {
  const STORAGE_KEY = `datatable_params_${tableName}`

  const initialStorageValue = useMemo(() => ({ query: EMPTY_OBJECT, ui: EMPTY_OBJECT }), [])
  const { storedValue, setStorage, clearStorage } = useDataTableStorage(STORAGE_KEY, initialStorageValue)
  const { query = EMPTY_OBJECT, ui = EMPTY_OBJECT } = storedValue

  const searchValues = query.appliedSearchValues || EMPTY_OBJECT
  const dateRange = query.dateRange || EMPTY_OBJECT

  const patchQuery = useCallback((patch: Record<string, any> | ((prevQuery: Record<string, any>) => Record<string, any>), resetPage = false) => {
    setStorage((prev: any) => {
      const currentQuery = prev.query || EMPTY_OBJECT
      const updatedQuery = typeof patch === "function" ? patch(currentQuery) : { ...currentQuery, ...patch }
      return { ...prev, query: { ...updatedQuery, ...(resetPage ? { pageIndex: 0 } : {}) } }
    })
  }, [setStorage])

  const apiConfig = useMemo(() => {
    const params: Record<string, any> = { ...searchValues }
    if (query.pageIndex !== undefined) params.page = query.pageIndex + 1
    if (query.pageSize !== undefined) params.per_page = query.pageSize
    if (query.sortBy) { params.sort_by = query.sortBy; params.sort_order = query.sortOrder }
    if (dateRange.from) params.from = dateRange.from
    if (dateRange.to) params.to = dateRange.to
    return { params }
  }, [query.pageIndex, query.pageSize, query.sortBy, query.sortOrder, searchValues, dateRange])

  const { data: res, isLoading, error, setData: setApiResponse, refetch } = useApi(endpoint, { enabled: Boolean(endpoint), config: apiConfig, select: (resData: any) => resData })

  const isValidResponse = useMemo(() => {
    return Boolean(res && typeof res === "object" && Array.isArray(res.data) && Array.isArray(res.columns ?? columns))
  }, [res, columns])

  const tableData = useMemo(() => ({
    data: isValidResponse ? (res?.data ?? EMPTY_ARRAY) : EMPTY_ARRAY,
    columns: isValidResponse && res?.columns ? res.columns : columns,
    totalRows: isValidResponse ? (res?.total ?? 0) : 0
  }), [res, columns, isValidResponse])

  // Modularized logic via specialized sub-hooks
  const { columnVisibility, visibleColumns, toggleColumn } = useDataTableColumns(tableData.columns, ui.columnVisibility, setStorage)
  const { searchFields, activeSearchCount, setSearchValues, clearSearchValues, setDateRange } = useDataTableSearch(tableData.columns, searchValues, patchQuery)
  const pagination = useDataTablePagination(query.pageIndex, query.pageSize, tableData.totalRows, res?.page, res?.per_page, patchQuery)

  const isTableLoading = isLoading || !res
  const isReady = !isLoading && isValidResponse
  
  const fetchData = useCallback(() => { refetch() }, [refetch])
  
  const getRowKey = useCallback((row: any, index: number) => (row?.[`id_${tableName}`] ?? index), [tableName])

  const handleSort = useCallback((accessor: string) => {
    patchQuery(({ sortBy, sortOrder, ...q }) => (
      sortBy !== accessor ? { ...q, sortBy: accessor, sortOrder: "asc" } :
      sortOrder === "asc" ? { ...q, sortBy: accessor, sortOrder: "desc" } : q
    ), true)
  }, [])

  const isFiltered = useMemo(() => {
    const hasCustomVisibility = Object.keys(ui.columnVisibility || EMPTY_OBJECT).length > 0
    const hasActiveSearch = Object.keys(searchValues).length > 0
    const hasActiveDate = Boolean(dateRange.from || dateRange.to)
    return query.pageIndex !== undefined || query.pageSize !== undefined || Boolean(query.sortBy) || hasActiveSearch || hasActiveDate || hasCustomVisibility
  }, [query.pageIndex, query.pageSize, query.sortBy, searchValues, dateRange, ui.columnVisibility])

  const resetAll = clearStorage

  return useMemo(() => ({
    ...query, ...tableData, pagination, visibleColumns, searchFields, activeSearchCount, getRowKey, isFiltered,
    loading: isTableLoading, isReady, isValidResponse, error, columnVisibility,
    handleSort, resetAll, toggleColumn, setSearchValues, clearSearchValues, setDateRange, fetchData, setApiResponse,
  }), [
    query, tableData, pagination, visibleColumns, searchFields, activeSearchCount, getRowKey, isFiltered,
    isTableLoading, isReady, isValidResponse, error, columnVisibility, handleSort, resetAll,
    toggleColumn, setSearchValues, clearSearchValues, setDateRange, fetchData, setApiResponse,
  ])
}