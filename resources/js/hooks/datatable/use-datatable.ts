import { useCallback, useMemo, useRef } from "react"
import { useApi } from "@/hooks/use-api"
import { useDataTableStorage } from "./use-datatable-storage"
import { useDataTableColumns } from "./use-datatable-columns"
import { useDataTableSearch } from "./use-datatable-search"
import { useDataTablePagination } from "./use-datatable-pagination"
import { useDataTableSort } from "./use-datatable-sort"
interface UseDataTableOptions { tableName: string; endpoint: string }
const EMPTY_ARR: any[] = [], EMPTY_OBJ: Record<string, any> = {}
export const useDataTable = ({ tableName, endpoint }: UseDataTableOptions) => {
  const idKey = `id_${tableName}`
  const { storedValue, setStorage, clearStorage } = useDataTableStorage(tableName, useMemo(() => ({ query: EMPTY_OBJ, ui: EMPTY_OBJ }), []))
  const { query = EMPTY_OBJ, ui = EMPTY_OBJ } = storedValue
  const searchValues = query.appliedSearchValues || EMPTY_OBJ, dateRange = query.dateRange || EMPTY_OBJ
  const patchQuery = useCallback((patch: any, resetPage = false) => {
    setStorage((prev: any) => ({
      ...prev, query: { ...prev.query, ...(typeof patch === "function" ? patch(prev.query || EMPTY_OBJ) : patch), ...(resetPage && { pageIndex: 0 }) }
    }))
  }, [setStorage])
  const { sortBy, sortOrder, handleSort } = useDataTableSort(query.sortBy, query.sortOrder, patchQuery)
  const lastValidRef = useRef({ data: EMPTY_ARR, columns: EMPTY_ARR, total: 0 })
  const pagination = useDataTablePagination(query.pageIndex, query.pageSize, lastValidRef.current.total, undefined, undefined, patchQuery)
  const apiConfig = useMemo(() => {
    const params: Record<string, any> = { ...searchValues, page: pagination.pageIndex + 1, per_page: pagination.pageSize }
    if (sortBy) { params.sort_by = sortBy; params.sort_order = sortOrder }
    if (dateRange.from) params.from = dateRange.from
    if (dateRange.to) params.to = dateRange.to
    return { params }
  }, [pagination.pageIndex, pagination.pageSize, searchValues, sortBy, sortOrder, dateRange.from, dateRange.to])
  const { data: res, isLoading, error, setData: setApiResponse, refetch } = useApi(endpoint, { enabled: Boolean(endpoint), config: apiConfig })
  if (res?.data) lastValidRef.current = { data: res.data, columns: res.columns ?? EMPTY_ARR, total: res.total ?? 0 }
  const currentRes = res?.data ? res : lastValidRef.current
  const { data = EMPTY_ARR, columns = EMPTY_ARR, total: totalRows = 0 } = currentRes
  const { columnVisibility, visibleColumns, toggleColumn } = useDataTableColumns(columns, ui.columnVisibility, setStorage)
  const { searchFields, activeSearchCount, setSearchValues, clearSearchValues, setDateRange } = useDataTableSearch(columns, searchValues, patchQuery)
  const getId = useCallback((row: any) => row?.[idKey] ?? row?.id, [idKey])
  const getRowKey = useCallback((row: any, i: number) => getId(row) ?? i, [getId])
  const isFiltered = Boolean(activeSearchCount > 0 || dateRange.from || dateRange.to || sortBy || 
    pagination.pageSize !== 10 || pagination.pageIndex > 0 || Object.values(ui.columnVisibility || EMPTY_OBJ).some((v) => v === false))
  const isReady = Boolean(res?.data || lastValidRef.current.data.length > 0)
  return useMemo(() => ({
    idKey, getId, getRowKey, pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, sortBy, sortOrder, query,
    data, columns, totalRows, visibleColumns, columnVisibility, pagination, searchFields, activeSearchCount,
    appliedSearchValues: searchValues, dateRange, loading: isLoading, isFetching: isLoading && lastValidRef.current.data.length > 0,
    isInitialLoading: isLoading && !res?.data && lastValidRef.current.data.length === 0, isReady, isValidResponse: Boolean(res?.data),
    isFiltered, error, handleSort, resetAll: clearStorage, toggleColumn, setSearchValues, clearSearchValues, setDateRange,
    fetchData: refetch, setApiResponse,
  }), [ idKey, getId, getRowKey, pagination, sortBy, sortOrder, query, data, columns, totalRows, visibleColumns, columnVisibility, searchFields, activeSearchCount, searchValues, dateRange, 
    isLoading, res, isReady, isFiltered, error, handleSort, clearStorage, toggleColumn, setSearchValues, clearSearchValues, setDateRange, refetch, setApiResponse ])
}