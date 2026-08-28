import { useCallback, useMemo, useRef } from "react"
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

export const useDataTable = ({ tableName, endpoint, columns: initialColumns = EMPTY_ARRAY }: UseDataTableOptions) => {
  const STORAGE_KEY = `datatable_params_${tableName}`

  const initialStorageValue = useMemo(() => ({ query: EMPTY_OBJECT, ui: EMPTY_OBJECT }), [])
  const { storedValue, setStorage, clearStorage } = useDataTableStorage(STORAGE_KEY, initialStorageValue)
  const { query = EMPTY_OBJECT, ui = EMPTY_OBJECT } = storedValue

  const searchValues = query.appliedSearchValues || EMPTY_OBJECT
  const dateRange = query.dateRange || EMPTY_OBJECT

  // Función segura para actualizar el query state y reiniciar a página 1 si es necesario
  const patchQuery = useCallback(
    (patch: Record<string, any> | ((prevQuery: Record<string, any>) => Record<string, any>), resetPage = false) => {
      setStorage((prev: any) => {
        const currentQuery = prev.query || EMPTY_OBJECT
        const updatedQuery = typeof patch === "function" ? patch(currentQuery) : { ...currentQuery, ...patch }
        return {
          ...prev,
          query: {
            ...updatedQuery,
            ...(resetPage ? { pageIndex: 0 } : {}),
          },
        }
      })
    },
    [setStorage]
  )

  // Configuración de parámetros de la API memoizada con precisión
  const apiConfig = useMemo(() => {
    const params: Record<string, any> = { ...searchValues }

    if (query.pageIndex !== undefined) params.page = query.pageIndex + 1
    if (query.pageSize !== undefined) params.per_page = query.pageSize
    if (query.sortBy) {
      params.sort_by = query.sortBy
      params.sort_order = query.sortOrder || "desc"
    }
    if (dateRange.from) params.from = dateRange.from
    if (dateRange.to) params.to = dateRange.to

    return { params }
  }, [query.pageIndex, query.pageSize, query.sortBy, query.sortOrder, searchValues, dateRange])

  const { data: res, isLoading, error, setData: setApiResponse, refetch } = useApi(endpoint, {
    enabled: Boolean(endpoint),
    config: apiConfig,
    select: (resData: any) => resData,
  })

  // Guardamos en memoria el último set de datos válido para evitar parpadeos durante refetch
  const lastValidDataRef = useRef<{ data: any[]; columns: any[]; total: number }>({
    data: EMPTY_ARRAY,
    columns: initialColumns,
    total: 0,
  })

  const isValidResponse = Boolean(
    res && typeof res === "object" && Array.isArray(res.data) && Array.isArray(res.columns ?? initialColumns)
  )

  if (isValidResponse) {
    lastValidDataRef.current = {
      data: res.data,
      columns: res.columns ?? initialColumns,
      total: res.total ?? 0,
    }
  }

  const tableData = useMemo(() => ({
    data: isValidResponse ? res.data : lastValidDataRef.current.data,
    columns: isValidResponse && res?.columns ? res.columns : (lastValidDataRef.current.columns.length ? lastValidDataRef.current.columns : initialColumns),
    totalRows: isValidResponse ? (res?.total ?? 0) : lastValidDataRef.current.total,
  }), [res, initialColumns, isValidResponse])

  // Sub-hooks modulares
  const { columnVisibility, visibleColumns, toggleColumn } = useDataTableColumns(tableData.columns, ui.columnVisibility, setStorage)
  const { searchFields, activeSearchCount, setSearchValues, clearSearchValues, setDateRange } = useDataTableSearch(tableData.columns, searchValues, patchQuery)
  const pagination = useDataTablePagination(query.pageIndex, query.pageSize, tableData.totalRows, res?.page, res?.per_page, patchQuery)

  // 👇 Ahora loading refleja el estado real de la petición en curso (incluyendo navegación y filtros)
  const isTableLoading = isLoading
  const isReady = isValidResponse || lastValidDataRef.current.data.length > 0

  const fetchData = useCallback(() => {
    refetch()
  }, [refetch])

  // Fallback seguro: id_tabla -> id -> index
  const getRowKey = useCallback(
    (row: any, index: number) => row?.[`id_${tableName}`] ?? row?.id ?? index,
    [tableName]
  )

  // Manejo de ordenamiento cíclico: ASC -> DESC -> Sin orden
  const handleSort = useCallback(
    (accessor: string) => {
      patchQuery(({ sortBy, sortOrder, ...q }) => {
        if (sortBy !== accessor) {
          return { ...q, sortBy: accessor, sortOrder: "asc" }
        }
        if (sortOrder === "asc") {
          return { ...q, sortBy: accessor, sortOrder: "desc" }
        }
        // Tercer click: remueve el ordenamiento
        return q
      }, true)
    },
    [patchQuery]
  )

  const isFiltered = useMemo(() => {
    const hasCustomVisibility = Object.keys(ui.columnVisibility || EMPTY_OBJECT).length > 0
    const hasActiveSearch = Object.keys(searchValues).length > 0
    const hasActiveDate = Boolean(dateRange.from || dateRange.to)

    return (
      query.pageIndex !== undefined ||
      query.pageSize !== undefined ||
      Boolean(query.sortBy) ||
      hasActiveSearch ||
      hasActiveDate ||
      hasCustomVisibility
    )
  }, [query.pageIndex, query.pageSize, query.sortBy, searchValues, dateRange, ui.columnVisibility])

  return useMemo(
    () => ({
      // Query State explícito
      pageIndex: query.pageIndex ?? 0,
      pageSize: query.pageSize ?? 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      query,

      // Data & Columns
      data: tableData.data,
      columns: tableData.columns,
      totalRows: tableData.totalRows,
      visibleColumns,
      columnVisibility,

      // Sub-hook states
      pagination,
      searchFields,
      activeSearchCount,

      // Status Flags
      loading: isTableLoading,
      isFetching: isLoading && lastValidDataRef.current.data.length > 0,
      isInitialLoading: isLoading && !isValidResponse && lastValidDataRef.current.data.length === 0,
      isReady,
      isValidResponse,
      isFiltered,
      error,

      // Actions / Handlers
      getRowKey,
      handleSort,
      resetAll: clearStorage,
      toggleColumn,
      setSearchValues,
      clearSearchValues,
      setDateRange,
      fetchData,
      setApiResponse,
    }),
    [
      query,
      tableData,
      visibleColumns,
      columnVisibility,
      pagination,
      searchFields,
      activeSearchCount,
      isTableLoading,
      isLoading,
      isValidResponse,
      isReady,
      isFiltered,
      error,
      getRowKey,
      handleSort,
      clearStorage,
      toggleColumn,
      setSearchValues,
      clearSearchValues,
      setDateRange,
      fetchData,
      setApiResponse,
    ]
  )
}