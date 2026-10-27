import { useState, useMemo, useEffect, useId } from "react"
import { SmartTable } from "./datatable/smart-table"
import { TablePagination } from "./datatable/table-pagination"
import { TableToolbar } from "./datatable/table-toolbar"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { ActionButtons } from "@/components/action-buttons"
import { useApi } from "@/hooks/use-api"
import { useRouter } from "@/hooks/use-router"
import { useLocalStorage } from "@/hooks/use-local-storage"
export interface TableQuery {
  pageIndex?: number; pageSize?: number; search?: string; sortBy?: string;
  sortOrder?: "asc" | "desc"; appliedSearchValues?: Record<string, any>;
  dateRange?: { from?: string; to?: string }; [key: string]: any
}
export interface TableStorage { query: TableQuery; ui: { columnVisibility?: Record<string, boolean>; [key: string]: any } }
const EMPTY_ARR: any[] = []
const DEFAULT_STORAGE: TableStorage = { query: { pageIndex: 0, pageSize: 10, appliedSearchValues: {}, dateRange: {} }, ui: { columnVisibility: {} }, }
export interface DynamicTableContentProps { tableName: string; crudEndpoint?: string; maxHeight?: string; readOnly?: boolean; onSelectionChange?: (ids: (string | number)[]) => void;
  renderCell?: (acc: string, row: any, type?: string) => React.ReactNode; renderActions?: (row: any, id: string | number) => React.ReactNode;
}
export function DynamicTableContent({ tableName, crudEndpoint, maxHeight = "75vh", readOnly = false, onSelectionChange, renderCell, renderActions }: DynamicTableContentProps) {
  const baseId = useId()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])
  // 1. Storage y Consulta (Carga directa, sin necesidad de 'mounted')
  const [storage, setStorage] = useLocalStorage<TableStorage>(`dt_${tableName}`, DEFAULT_STORAGE)
  const { query = DEFAULT_STORAGE.query, ui = DEFAULT_STORAGE.ui } = storage
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder, pageIndex: rawPageIndex = 0, pageSize = 10 } = query
  const patchStorage = (section: keyof TableStorage, patch: any) =>
    setStorage((p) => ({ ...p, [section]: { ...p[section], ...patch } }))
  const patchQuery = (patch: Partial<TableQuery>, resetPage = false) =>
    patchStorage("query", { ...patch, ...(resetPage ? { pageIndex: 0 } : {}) })
  // 2. Columnas (Tu caché estricto: solo pide si el caché está vacío o lo limpias con el botón)
  const [columns, setColumns] = useLocalStorage<any[]>(`dt_cols_${tableName}`, EMPTY_ARR)
  const needsCols = !columns.length && Boolean(tableName)
  const { data: fetchedCols, isLoading: loadingCols } = useApi<any[]>(
    needsCols ? `/schema/${tableName}/columns` : null,
    { enabled: needsCols }
  )
  useEffect(() => {
    if (fetchedCols?.length) setColumns(fetchedCols)
  }, [fetchedCols, setColumns])
  // 3. Visibilidad de columnas calculada
  const { columnVisibility, visibleColumns } = useMemo(() => {
    const vis: Record<string, boolean> = {}, list: any[] = []
    for (const c of columns) {
      const isVis = ui.columnVisibility?.[c.accessor] ?? !c.hidden
      vis[c.accessor] = isVis
      if (isVis) list.push(c)
    }
    return { columnVisibility: vis, visibleColumns: list }
  }, [columns, ui.columnVisibility])
  const toggleColumnVis = (col: string) => patchStorage("ui", { columnVisibility: { ...ui.columnVisibility, [col]: !columnVisibility[col] } })
  const hideColumn = (col: string) => patchStorage("ui", { columnVisibility: { ...ui.columnVisibility, [col]: false } })
  const handleShowAllColumns = () => patchStorage("ui", { columnVisibility: Object.fromEntries(columns.map((c) => [c.accessor, true])) })
  // 4. Parámetros y Carga de Datos
  const queryParams = {
    ...appliedSearchValues,
    page: rawPageIndex + 1,
    per_page: pageSize,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortBy ? (sortOrder || "desc") : undefined,
    from: dateRange?.from,
    to: dateRange?.to,
  }
  const { data = EMPTY_ARR, raw, isLoading: loadingData, error, refetch: fetchData } = useApi<any[]>(
    `/table/${tableName}/data`, { enabled: columns.length > 0, params: queryParams, initialData: EMPTY_ARR }
  )
  const totalRows = raw?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))
  const loading = loadingCols || loadingData
  // 5. Selección y Borrado Masivo
  const handleClearSelection = () => { setSelectedIds([]); onSelectionChange?.([]) }
  const toggleSelect = (id?: string | number) => {
    const next = id == null
      ? (selectedIds.length === data.length ? [] : data.map((r: any) => r.id))
      : (selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id])
    setSelectedIds(next)
    onSelectionChange?.(next)
  }
  const handleDeleteBulk = async () => {
    if (!selectedIds.length) return
    await router.post(`/crud/${tableName}/bulk-delete`, { ids: selectedIds })
    handleClearSelection()
    fetchData()
  }
  const isFiltered = Boolean(
    search || dateRange?.from || dateRange?.to || sortBy || pageIndex > 0 || pageSize !== 10 ||
    Object.values(appliedSearchValues).some(Boolean)
  )
  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      <TableToolbar
        tableName={tableName} crudEndpoint={crudEndpoint} readOnly={readOnly} search={search} onSearch={(s) => patchQuery({ search: s }, true)}
        appliedSearchValues={appliedSearchValues} onApplyFilter={(v) => patchQuery({ appliedSearchValues: v }, true)}
        onClearFilter={() => patchQuery({ appliedSearchValues: {} }, true)} dateRange={dateRange} onDateRangeChange={(r) => patchQuery({ dateRange: r || {} }, true)}
        onReset={() => setStorage(DEFAULT_STORAGE)} isFiltered={isFiltered} columns={columns} columnVisibility={columnVisibility} onToggleColumn={toggleColumnVis}
        onResetColumnsVisibility={() => patchStorage("ui", { columnVisibility: {} })} onClearSelection={handleClearSelection} onShowAllColumns={handleShowAllColumns}
        selectedCount={selectedIds.length} onDeleteSelected={handleDeleteBulk} queryParams={queryParams} loading={loading} onRefresh={fetchData}
      />
      <SmartTable
        data={data} columns={visibleColumns} sort={{ column: sortBy, order: sortOrder }} onSort={(key, order) => patchQuery({ sortBy: key, sortOrder: order }, true)}
        onHideColumn={hideColumn} loading={loading} error={error} onRetry={fetchData} readOnly={readOnly} selectedIds={selectedIds} onToggle={toggleSelect}
        renderCell={renderCell ?? ((acc, row, type) => <CellFormatter accessor={acc} row={row} rowId={row.id} type={type} tableName={tableName} />)}
        renderActions={renderActions ?? ((row, id) => <ActionButtons row_id={id} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />)}
      />
      <TablePagination
        pageIndex={pageIndex} pageSize={pageSize} totalRows={totalRows} totalPages={totalPages} baseId={baseId} selectedCount={selectedIds.length}
        onPageChange={(p) => patchQuery({ pageIndex: p - 1 })} onPageSizeChange={(s) => patchQuery({ pageSize: s }, true)}
      />
    </div>
  )
}
export default DynamicTableContent