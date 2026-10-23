import { useState, useMemo, useEffect, useId } from "react"
import { SmartTable } from "./datatable/smart-table"
import { TablePagination } from "./datatable/table-pagination"
import { TableToolbar } from "./datatable/table-toolbar"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { ActionButtons } from "@/components/action-buttons"
import { useApi } from "@/hooks/use-api"
import { useRouter } from "@/hooks/use-router"
import { useLocalStorage } from "@/hooks/use-local-storage"

export interface TableQuery { pageIndex?: number; pageSize?: number; search?: string; sortBy?: string; sortOrder?: "asc" | "desc"; appliedSearchValues?: Record<string, any>; dateRange?: { from?: string; to?: string }; [key: string]: any }
export interface TableStorage { query: TableQuery; ui: { columnVisibility?: Record<string, boolean>; [key: string]: any } }

const EMPTY_ARR: any[] = []
const DEFAULT_STORAGE: TableStorage = { query: { pageIndex: 0, appliedSearchValues: {}, dateRange: {} }, ui: { columnVisibility: {} } }

export interface DynamicTableContentProps {
  tableName: string; crudEndpoint?: string; maxHeight?: string; readOnly?: boolean;
  selectable?: boolean; onSelectionChange?: (ids: (string | number)[]) => void;
  renderCell?: (acc: string, row: any, type?: string) => React.ReactNode;
  renderActions?: (row: any, id: string | number) => React.ReactNode;
}

export function DynamicTableContent({
  tableName, crudEndpoint, maxHeight = "75vh", readOnly = false,
  selectable = true, onSelectionChange, renderCell, renderActions,
}: DynamicTableContentProps) {
  const baseId = useId()
  const [mounted, setMounted] = useState(false)
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const [storage, setStorage] = useLocalStorage<TableStorage>(`dt_${tableName}`, DEFAULT_STORAGE)
  const { query = DEFAULT_STORAGE.query, ui = DEFAULT_STORAGE.ui } = mounted ? storage : DEFAULT_STORAGE
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder, pageIndex: rawPageIndex = 0 } = query

  // 1. Columnas
  const [cachedCols, setCachedCols] = useLocalStorage<any[]>(`dt_cols_${tableName}`, EMPTY_ARR)
  const { data: colsData, isLoading: loadingColumns } = useApi<any[]>(!cachedCols.length && tableName ? `/schema/${tableName}/columns` : null)
  useEffect(() => { if (!cachedCols.length && colsData?.length) setCachedCols(colsData) }, [cachedCols.length, colsData, setCachedCols])
  const columns = cachedCols.length ? cachedCols : (colsData || EMPTY_ARR)

  const patchQuery = (patch: Partial<TableQuery>, resetPage = false) => setStorage((p) => ({ ...p, query: { ...p.query, ...patch, ...(resetPage && { pageIndex: 0 }) } }))
  const toggleColumnVis = (col: string) => setStorage((p) => ({ ...p, ui: { ...p.ui, columnVisibility: { ...p.ui?.columnVisibility, [col]: !p.ui?.columnVisibility?.[col] } } }))
  const hideColumn = (col: string) => setStorage((p) => ({ ...p, ui: { ...p.ui, columnVisibility: { ...p.ui?.columnVisibility, [col]: false } } }))

  const handleClearSelection = () => {
    setSelectedIds([])
    onSelectionChange?.([])
  }

  const handleShowAllColumns = () => {
    const allVisible = columns.reduce((acc, c) => ({ ...acc, [c.accessor]: true }), {})
    setStorage((p) => ({ ...p, ui: { ...p.ui, columnVisibility: allVisible } }))
  }

  // 2. Data
  const queryParams = { ...appliedSearchValues, page: rawPageIndex + 1, per_page: query.pageSize, search: search || undefined, sort_by: sortBy, sort_order: sortBy ? (sortOrder || "desc") : undefined, from: dateRange?.from, to: dateRange?.to }
  const { data: rawData, raw, isLoading: loadingData, error, refetch: fetchData } = useApi(`/table/${tableName}/data`, { enabled: columns.length > 0 && mounted, params: queryParams })
  const data = Array.isArray(rawData) ? rawData : EMPTY_ARR
  const totalRows = raw?.total ?? 0, pageSize = query.pageSize || raw?.per_page || 10
  const loading = !mounted || loadingColumns || loadingData

  const { columnVisibility, visibleColumns } = useMemo(() => {
    const vis: Record<string, boolean> = {}, list: any[] = []
    for (const c of columns) {
      const v = ui.columnVisibility?.[c.accessor] ?? !c.hidden
      vis[c.accessor] = v
      if (v) list.push(c)
    }
    return { columnVisibility: vis, visibleColumns: list }
  }, [columns, ui.columnVisibility])

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))

  const toggleSelectAll = () => {
    const allIds = data.map((r: any) => r.id)
    const next = data.length && allIds.every((id: any) => selectedIds.includes(id)) ? [] : allIds
    setSelectedIds(next); onSelectionChange?.(next)
  }
  const toggleSelectRow = (id: string | number) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]
    setSelectedIds(next); onSelectionChange?.(next)
  }

  // 3. Borrado Masivo
  const handleDeleteBulk = async () => {
    if (!selectedIds.length) return
    try {
      await router.post(`/crud/${tableName}/bulk-delete`, { ids: selectedIds })
      setSelectedIds([])
      fetchData()
    } catch (e) {
      console.error("Error al eliminar registros:", e)
    }
  }

  const isFiltered = Boolean(Object.values(appliedSearchValues).filter(Boolean).length || search || dateRange?.from || dateRange?.to || sortBy || pageIndex > 0 || (query.pageSize && query.pageSize !== (raw?.per_page ?? 10)))

  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      <TableToolbar
        tableName={tableName} crudEndpoint={crudEndpoint} readOnly={readOnly} search={search}
        onSearch={(s) => patchQuery({ search: s }, true)} appliedSearchValues={appliedSearchValues}
        onApplyFilter={(v) => patchQuery({ appliedSearchValues: v }, true)}
        onClearFilter={() => patchQuery({ appliedSearchValues: {} }, true)}
        dateRange={dateRange} onDateRangeChange={(r) => patchQuery({ dateRange: r || {} }, true)}
        onReset={() => setStorage(DEFAULT_STORAGE)} isFiltered={isFiltered}
        columns={columns} columnVisibility={columnVisibility}
        onToggleColumn={toggleColumnVis}
        onResetColumnsVisibility={() => setStorage((p) => ({ ...p, ui: { ...p.ui, columnVisibility: {} } }))}
        onClearSelection={handleClearSelection}
        onShowAllColumns={handleShowAllColumns}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteBulk}
        queryParams={queryParams} loading={loading} onRefresh={fetchData}
      />
      <SmartTable
        data={data}
        columns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key, order) => patchQuery({ sortBy: key, sortOrder: order }, true)}
        onHideColumn={hideColumn}
        loading={loading}
        error={error}
        onRetry={fetchData}
        readOnly={readOnly}
        selectable={selectable}
        selectedIds={selectedIds}
        onToggleRow={toggleSelectRow}
        onToggleAll={toggleSelectAll}
        renderCell={renderCell ?? ((accessor, row, type) => ( <CellFormatter accessor={accessor} row={row} rowId={row.id} type={type} tableName={tableName} /> ))}
        renderActions={renderActions ?? ((row, id) => ( <ActionButtons row_id={id} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} /> ))}
      />
      <TablePagination pageIndex={pageIndex} pageSize={pageSize} totalRows={totalRows} totalPages={totalPages} baseId={baseId} selectedCount={selectedIds.length}
        onPageChange={(p) => patchQuery({ pageIndex: p - 1 })} 
        onPageSizeChange={(s) => patchQuery({ pageSize: s }, true)}/>
    </div>
  )
}

export default DynamicTableContent