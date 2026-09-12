import { useState, useMemo, useCallback } from "react"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { SmartTable } from "@/components/smart-table"
import { SmartButton } from "@/components/smart-button"
import { SmartDropdown } from "@/components/smart-dropdown"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { ToggleColumns } from "@/components/datatable/toggle-columns"
import { ExportMenu } from "@/components/datatable/export-menu"
import { ResetButton } from "@/components/reset-button"
import { DatePicker } from "@/components/date-picker"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { DataTableSearchDropdown } from "@/components/datatable/datatable-search"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
import { Input } from "@/components/ui/input"
import { useApi } from "@/hooks/use-api"
import { useTranslation } from "@/hooks/use-translation"

interface DynamicTableContentProps {
  tableName: string
  crudEndpoint?: string
  dataEndpoint?: string
  maxHeight?: string
}

const EMPTY_ARR: any[] = []
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
const DEFAULT_STORAGE = {
  query: { pageIndex: 0, pageSize: undefined as number | undefined, search: "", appliedSearchValues: {}, dateRange: {}, sortBy: undefined, sortOrder: undefined },
  ui: { columnVisibility: {} as Record<string, boolean> },
}

export function DynamicTableContent({ tableName, crudEndpoint, dataEndpoint = `/table/${tableName}/data`, maxHeight = "75vh" }: DynamicTableContentProps) {
  const t = useTranslation()

  // 1. Almacenamiento local síncrono
  const storageKey = `dt_${tableName}`
  const [storage, setStorage] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_STORAGE
    try {
      const item = localStorage.getItem(storageKey)
      return item ? JSON.parse(item) : DEFAULT_STORAGE
    } catch {
      return DEFAULT_STORAGE
    }
  })

  const updateStorage = (updater: any) => {
    setStorage((prev: any) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const clearStorage = () => {
    try { localStorage.removeItem(storageKey) } catch {}
    setStorage(DEFAULT_STORAGE)
  }

  const patchQuery = (patch: Record<string, any>, resetPage = false) =>
    updateStorage((prev: any) => ({ ...prev, query: { ...prev.query, ...patch, ...(resetPage && { pageIndex: 0 }) } }))

  // 2. Consulta API
  const { query, ui } = storage
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder } = query
  const rawPageIndex = query.pageIndex || 0

  const apiConfig = useMemo(() => ({
    params: {
      ...appliedSearchValues,
      page: rawPageIndex + 1,
      ...(query.pageSize && { per_page: query.pageSize }),
      ...(search && { search }),
      ...(sortBy && { sort_by: sortBy, sort_order: sortOrder || "desc" }),
      ...(dateRange.from && { from: dateRange.from }),
      ...(dateRange.to && { to: dateRange.to }),
    }
  }), [query])

  const { data: res, isLoading: loading, error, refetch: fetchData } = useApi(dataEndpoint, { enabled: Boolean(dataEndpoint), config: apiConfig })
  const data = res?.data ?? EMPTY_ARR
  const columns = res?.columns ?? EMPTY_ARR
  const totalRows = res?.total ?? 0
  const backendPerPage = res?.per_page ?? 10
  const pageSize = query.pageSize || backendPerPage

  // 3. Columnas y ordenamiento
  const { columnVisibility, visibleColumns } = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    const visible = columns.filter((col: any) => {
      const isVis = ui.columnVisibility[col.accessor] ?? !col.hidden
      visibility[col.accessor] = isVis
      return isVis
    })
    return { columnVisibility: visibility, visibleColumns: visible }
  }, [columns, ui.columnVisibility])

  const toggleColumn = (accessor: string) =>
    updateStorage((prev: any) => ({ ...prev, ui: { ...prev.ui, columnVisibility: { ...prev.ui.columnVisibility, [accessor]: !columnVisibility[accessor] } } }))

  const handleSort = (accessor: string) => {
    const next = sortBy !== accessor ? "asc" : sortOrder === "asc" ? "desc" : undefined
    patchQuery({ sortBy: next ? accessor : undefined, sortOrder: next }, true)
  }

  // 4. Paginación
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))
  const goTo = (p: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, p - 1)) })
  const pagination = {
    pageIndex, pageSize, totalRows, totalPages, isFirstPage: pageIndex === 0, isLastPage: pageIndex >= totalPages - 1,
    goToPage: goTo,
    goToFirstPage: () => goTo(1),
    goToPreviousPage: () => goTo(pageIndex),
    goToNextPage: () => goTo(pageIndex + 2),
    goToLastPage: () => goTo(totalPages),
    changePageSize: (size: number) => patchQuery({ pageSize: Math.max(size, 1) }, true),
  }

  // 5. Búsqueda y Helpers
  const idKey = `id_${tableName}`
  const getId = useCallback((row: any) => row?.[idKey] ?? row?.id, [idKey])
  const getRowKey = useCallback((row: any, i: number) => getId(row) ?? i, [getId])
  const searchFields = useMemo(() => columns.filter((c: any) => c.searchable).map((c: any) => ({ id: c.accessor, name: c.accessor, label: c.header, type: c.type })), [columns])
  const activeSearchCount = Object.values(appliedSearchValues).filter(Boolean).length
  const setSearchValues = (values: any) => patchQuery({ appliedSearchValues: values || {} }, true)
  const isFiltered = Boolean(activeSearchCount || search || dateRange.from || dateRange.to || sortBy || pageIndex > 0 || (query.pageSize && query.pageSize !== backendPerPage))
  // Objeto para SmartTable
  const tableState = {
    getId, getRowKey, data, columns, totalRows, visibleColumns, columnVisibility, pagination, searchFields, activeSearchCount, globalSearch: search, appliedSearchValues, dateRange,
    isFiltered, loading, error, sortBy, sortOrder, handleSort, resetAll: clearStorage, toggleColumn, setSearchValues, fetchData,
    clearSearchValues: () => setSearchValues({}),
    setGlobalSearch: (s: string) => patchQuery({ search: s }, true),
    setDateRange: (range: any) => patchQuery({ dateRange: range || {} }, true),
  }
  const renderCell = useCallback((accessor: string, row: any, type?: string) => (
    <CellFormatter accessor={accessor} row={row} rowId={getId(row)} type={type} tableName={tableName} />
  ), [tableName, getId])
  const renderActions = useCallback((row: any) => (
    <ActionButtons row_id={getId(row)} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
  ), [tableName, crudEndpoint, fetchData, getId])
  const pageSizeItems = useMemo(() => PAGE_SIZES.map((n) => ({ label: String(n), action: () => pagination.changePageSize(n) })), [pagination.changePageSize])
  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      {/* Header y Filtros */}
      <div className="flex items-center gap-2 flex-wrap w-full flex-none">
        <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
        <div><SearchInput key={search} defaultValue={search} onSearchSubmit={tableState.setGlobalSearch} filterOnEnter /></div>
        <DataTableSearchDropdown fields={searchFields} appliedValues={appliedSearchValues} activeCount={activeSearchCount} onApply={setSearchValues} onClear={tableState.clearSearchValues} />
        <DatePicker variant="button" mode="range" value={dateRange} onChange={tableState.setDateRange} />
        <ResetButton onReset={clearStorage} canReset={isFiltered} />
        <ExportMenu tableName={tableName} columns={columns} data={data} />
        <ToggleColumns columns={columns} columnVisibility={columnVisibility} onToggle={toggleColumn} />
        <AsyncState isLoading={loading} variant="inline" />
      </div>
      {/* Tabla Principal */}
      <SmartTable tableState={tableState} renderCell={renderCell} renderActions={renderActions} />
      {/* Footer Integrado Directo */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full flex-none">
        <div className="flex items-center justify-center gap-2 pl-1">
          <div className="text-left">
            <div className="font-bold tabular-nums text-xs sm:text-sm">{totalRows}</div>
            <div className="text-muted-foreground">{t("Records")}</div>
          </div>
          <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
            <span>{t("Page")}</span>
            <Input key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1}
              className="w-16 h-8 text-xs text-center" onKeyDown={(e) => { if (e.key === "Enter") pagination.goToPage(+e.currentTarget.value) }} />
            <span>{t("of")} <strong className="font-semibold">{totalPages}</strong></span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t("Rows:")}</span>
            <SmartDropdown buttonLabel={String(pageSize)} items={pageSizeItems} labelExtra={
              <Input type="number" min={1} placeholder={t("Custom...")} className="w-36 h-8 text-xs"
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { pagination.changePageSize(+e.currentTarget.value); e.currentTarget.value = "" } }} />
            } />
          </div>
          <div className="flex items-center gap-1">
            <SmartButton icon={ChevronsLeft} tooltip={t("First page")} disabled={pagination.isFirstPage} onClick={pagination.goToFirstPage} />
            <SmartButton icon={ChevronLeft} tooltip={t("Previous page")} disabled={pagination.isFirstPage} onClick={pagination.goToPreviousPage} />
            <SmartButton icon={ChevronRight} tooltip={t("Next page")} disabled={pagination.isLastPage} onClick={pagination.goToNextPage} />
            <SmartButton icon={ChevronsRight} tooltip={t("Last page")} disabled={pagination.isLastPage} onClick={pagination.goToLastPage} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DynamicTableContent