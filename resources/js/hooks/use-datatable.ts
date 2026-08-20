import { useCallback, useMemo } from "react"
import { useApi } from "@/hooks/use-api"
import { useDataTableStorage } from "./use-datatable-storage"

interface UseDataTableOptions {
  tableName: string
  endpoint?: string
  columns?: any[]
}

const EMPTY_ARRAY: any[] = []
const EMPTY_OBJECT: Record<string, any> = {}

export const useDataTable = ({ tableName, endpoint = `/crud/${tableName}`, columns = EMPTY_ARRAY }: UseDataTableOptions) => {
  const STORAGE_KEY = `datatable_params_${tableName}`

  // 1. ESTADO Y PERSISTENCIA
  const initialStorageValue = useMemo(() => ({ query: EMPTY_OBJECT, ui: EMPTY_OBJECT }), [])
  const { storedValue, setStorage, clearStorage } = useDataTableStorage(STORAGE_KEY, initialStorageValue)
  const { query = EMPTY_OBJECT, ui = EMPTY_OBJECT } = storedValue

  const setColumnVisibility = useCallback((updater: any) => {
    setStorage((prev: any) => ({ ...prev, ui: { ...prev.ui, columnVisibility: typeof updater === "function" ? updater(prev.ui?.columnVisibility || EMPTY_OBJECT) : updater } }))
  }, [])

  const toggleColumn = useCallback((accessor: string) => {
    setColumnVisibility((prev: Record<string, boolean>) => ({ ...prev, [accessor]: !(prev[accessor] ?? true) }))
  }, [setColumnVisibility])

  // 2. PETICIÓN API Y GESTIÓN DE DATOS
  const searchValues = query.appliedSearchValues || EMPTY_OBJECT
  const dateRange = query.dateRange || EMPTY_OBJECT

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

  const tableData = useMemo(() => ({
    data: res?.data ?? EMPTY_ARRAY, columns: res?.columns ?? columns, totalRows: res?.total ?? 0
  }), [res, columns])

  const columnVisibility = useMemo(() => {
    const custom = ui.columnVisibility || EMPTY_OBJECT
    const result: Record<string, boolean> = {}
    for (const col of tableData.columns) { result[col.accessor] = custom[col.accessor] ?? !col.hidden }
    return result
  }, [tableData.columns, ui.columnVisibility])

  const visibleColumns = useMemo(() => tableData.columns.filter((c: any) => columnVisibility[c.accessor]), [tableData.columns, columnVisibility])
  const isTableLoading = isLoading || !res

  const fetchData = refetch
  const getRowKey = useCallback((row: any, index: number) => (row?.[`id_${tableName}`] ?? index), [tableName])

  // 3. BÚSQUEDA Y RANGO DE FECHAS
  const searchFields = useMemo(() => {
    const fields: any[] = []
    for (const col of tableData.columns) {
      if (col.searchable) fields.push({ id: col.accessor, name: col.accessor, label: col.header || col.accessor, type: col.type })
    }
    return fields
  }, [tableData.columns])

  const activeSearchCount = useMemo(() => {
    let count = 0
    for (const k in searchValues) { if (searchValues[k]) count++ }
    return count
  }, [searchValues])

  const patchQuery = useCallback((patch: Record<string, any> | ((prevQuery: Record<string, any>) => Record<string, any>), resetPage = true) => {
    setStorage((prev: any) => {
      const currentQuery = prev.query || EMPTY_OBJECT
      const updatedQuery = typeof patch === "function" ? patch(currentQuery) : patch
      return { ...prev, query: { ...currentQuery, ...updatedQuery, ...(resetPage ? { pageIndex: 0 } : {}) } }
    })
  }, [])

  const setSearchValues = useCallback((values: Record<string, any>) => patchQuery({ appliedSearchValues: values || EMPTY_OBJECT }), [])
  const clearSearchValues = useCallback(() => patchQuery({ appliedSearchValues: EMPTY_OBJECT }), [])
  const setDateRange = useCallback((range: { from?: any; to?: any }) => patchQuery({ dateRange: range || EMPTY_OBJECT }), [])

  // 4. ORDENAMIENTO
  const handleSort = useCallback((accessor: string) => {
    patchQuery((q) => {
      if (q.sortBy === accessor) {
        if (q.sortOrder === "asc") return { sortBy: accessor, sortOrder: "desc" }
        const { sortBy, sortOrder, ...rest } = q
        return rest
      }
      return { sortBy: accessor, sortOrder: "asc" }
    })
  }, [])

  // 5. PAGINACIÓN
  const pagination = useMemo(() => {
    const currentPageIndex = query.pageIndex ?? (res?.page ? res.page - 1 : 0)
    const currentPageSize = query.pageSize ?? (res?.per_page || 15)
    const totalPages = Math.max(1, Math.ceil(tableData.totalRows / currentPageSize))
    return {
      pageIndex: currentPageIndex, pageSize: currentPageSize, totalRows: tableData.totalRows, totalPages,
      isFirstPage: currentPageIndex === 0, isLastPage: currentPageIndex >= totalPages - 1,
      goToPage: (page: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, page - 1)) }, false),
      changePageSize: (pageSize: number) => patchQuery({ pageSize: Math.max(pageSize, 1) }),
      goToFirstPage: () => patchQuery({ pageIndex: 0 }, false),
      goToPreviousPage: () => patchQuery({ pageIndex: Math.max(0, currentPageIndex - 1) }, false),
      goToNextPage: () => patchQuery({ pageIndex: Math.min(totalPages - 1, currentPageIndex + 1) }, false),
      goToLastPage: () => patchQuery({ pageIndex: Math.max(0, totalPages - 1) }, false)
    }
  }, [query.pageIndex, query.pageSize, tableData.totalRows, res?.page, res?.per_page])

  // 6. ESTADOS GLOBALES Y REINICIO
  const isFiltered = useMemo(() => {
    const hasCustomVisibility = Object.keys(ui.columnVisibility || EMPTY_OBJECT).length > 0
    const hasActiveSearch = Object.keys(searchValues).length > 0
    const hasActiveDate = Boolean(dateRange.from || dateRange.to)
    return query.pageIndex !== undefined || query.pageSize !== undefined || Boolean(query.sortBy) || hasActiveSearch || hasActiveDate || hasCustomVisibility
  }, [query.pageIndex, query.pageSize, query.sortBy, searchValues, dateRange, ui.columnVisibility])

  const resetAll = clearStorage

  // 7. RETORNO DEL HOOK
  return useMemo(() => ({
    ...query, ...tableData, pagination, visibleColumns, searchFields, activeSearchCount, getRowKey, isFiltered,
    loading: isTableLoading, isReady: !isTableLoading, error, tableName, endpoint, columnVisibility,
    handleSort, resetAll, setColumnVisibility, toggleColumn, setSearchValues, clearSearchValues, setDateRange, fetchData, setApiResponse,
  }), [
    query, tableData, pagination, visibleColumns, searchFields, activeSearchCount, getRowKey, isFiltered,
    isTableLoading, error, tableName, endpoint, columnVisibility, handleSort, resetAll, setColumnVisibility,
    toggleColumn, setSearchValues, clearSearchValues, setDateRange, fetchData, setApiResponse,
  ])
}