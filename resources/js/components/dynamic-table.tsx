import { useState, useMemo, useCallback, useEffect, useId } from "react"
import * as XLSX from "xlsx"
import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { SmartButton } from "@/components/smart-button"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { ResetButton } from "@/components/reset-button"
import { DatePicker } from "@/components/date-picker"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { Input } from "@/components/ui/input"
import { useApi } from "@/hooks/use-api"
import { useTranslation } from "@/hooks/use-translation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
const EMPTY_ARR: any[] = []
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
const DEFAULT_STORAGE = { query: { pageIndex: 0, appliedSearchValues: {}, dateRange: {} }, ui: { columnVisibility: {} } }
const defaultRenderCell = (acc: string, row: any) => row?.[acc] ?? ""
export type TableViewMode = "table" | "grid"
/** Exportación a Excel aislada */
async function exportTableToExcel(tableName: string, columns: any[], params?: Record<string, any>) {
  if (!columns.length) return
  try {
    const q = new URLSearchParams()
    if (params) Object.entries(params).forEach(([k, v]) => v != null && v !== "" && q.append(k, String(v)))
    const rawRes = await fetch(`/table/${tableName}/export?${q.toString()}`)
    const json = await rawRes.json()
    const exportData = json?.data ?? EMPTY_ARR
    if (!exportData.length) return
    const ws = XLSX.utils.aoa_to_sheet([columns.map((c: any) => c.header), ...exportData.map((r: any) => columns.map((c: any) => r[c.accessor]))])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tableName.toUpperCase())
    XLSX.writeFile(wb, `${tableName}_${Date.now()}.xlsx`)
  } catch (e) {
    console.error("Error al exportar:", e)
  }
}
// --- FILTRO AVANZADO (CON CACHÉ EN LOCALSTORAGE) ---
function SearchFormContent({ tableName, appliedValues = {}, onApply, onClear }: { tableName: string; appliedValues?: Record<string, any>; onApply: (v: any) => void; onClear: () => void }) {
  const [vals, setVals] = useState(appliedValues)
  const [cachedFields, setCachedFields] = useLocalStorage<FieldConfig[]>(`dt_fields_${tableName}`, EMPTY_ARR)
  const hasCachedFields = cachedFields.length > 0
  // Solo consulta la API si no existen campos cacheados localmente
  const { data: fetchedFields, isLoading, error, refetch } = useApi<FieldConfig[]>(!hasCachedFields && tableName ? `/schema/${tableName}/fields?mode=filter` : null, { select: (r: any) => r?.data ?? r })
  useEffect(() => {
    if (!hasCachedFields && fetchedFields?.length) setCachedFields(fetchedFields)
  }, [hasCachedFields, fetchedFields, setCachedFields])
  const fields = hasCachedFields ? cachedFields : (fetchedFields || EMPTY_ARR)
  useEffect(() => setVals(appliedValues || {}), [appliedValues])
  const hasValues = Object.values(vals).some((v) => v != null && v !== "")
  return (
    <div className="flex flex-col gap-2 min-w-[280px]" onClick={(e) => e.stopPropagation()}>
      <AsyncState isLoading={!hasCachedFields && isLoading} error={error} onRetry={refetch} minHeight="min-h-[160px]">
        <div className="w-full pl-2 max-h-[380px] overflow-y-auto pr-1">
          {fields.length === 0 ? <span className="text-xs text-muted-foreground px-2 py-4 block text-center">No hay campos disponibles para filtrar</span> 
          : <FormGroup fields={fields} values={vals} layout="horizontal" onChange={(k: string, v: any) => setVals((p: any) => ({ ...p, [k]: v }))} />}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t mt-1">
          <SmartButton variant="default" size="sm" icon="check" disabled={!hasValues || (!hasCachedFields && isLoading)} className="flex-1 justify-center" onClick={() => hasValues && onApply(vals)} label="Aplicar" />
          <ResetButton onReset={() => { setVals({}); onClear() }} canReset={hasValues} size="sm" variant="ghost" className="flex-1 justify-center" label="Limpiar" tooltip="" />
        </div>
      </AsyncState>
    </div>
  )
}
// --- VISTA DE DATOS (TABLA O GRID) ---
export function SmartTable({ data = EMPTY_ARR, visibleColumns = EMPTY_ARR, sortBy, sortOrder, loading, error, handleSort, getRowKey, fetchData, renderCell = defaultRenderCell, renderActions, renderCard, viewMode = "table" }: any) {
  const isTableLoading = Boolean(loading && data.length === 0)
  return (
    <div className="relative flex-1 min-h-0 border border-border bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
      <div className="w-full overflow-auto max-h-full flex-1">
        {isTableLoading || error ? (
          <div className="p-8 flex items-center justify-center">
            <AsyncState isLoading={isTableLoading} error={error} loadingLabel="Cargando información..." onRetry={fetchData} minHeight="min-h-[140px]" />
          </div>
        ) : !data.length ? ( <div className="p-8 text-center text-sm text-muted-foreground">No hay resultados disponibles.</div>
        ) : viewMode === "grid" ? (
          /* MODO GRID (PELÍCULAS / CARDS) */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {data.map((row: any, i: number) => renderCard ? renderCard(row, { index: i, columns: visibleColumns, renderActions }) : (
              <div key={getRowKey?.(row, i) ?? i} className="group relative flex flex-col bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden">
                <div className="p-3 flex-1 flex flex-col gap-1.5">
                  {visibleColumns.map((c: any, idx: number) => (
                    <div key={c.accessor} className={cn("flex flex-col", idx === 0 && "font-semibold text-sm text-foreground pb-1 border-b border-border/40")}>
                      {idx > 0 && <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{c.header}</span>}
                      <div className="truncate text-xs text-foreground/90">{renderCell(c.accessor, row, c.type)}</div>
                    </div>
                  ))}
                </div>
                {renderActions && <div className="px-3 py-1.5 border-t bg-muted/20 flex justify-end items-center gap-1">{renderActions(row)}</div>}
              </div>
            ))}
          </div>
        ) : (
          /* MODO TABLA */
          <Table className="min-w-full">
            <thead>
              <TableRow>
                {visibleColumns.map((col: any) => {
                  const isSorted = sortBy === col.accessor
                  return (
                    <TableHead key={col.accessor} className="px-0 sticky top-0 bg-background z-10 shadow-sm whitespace-nowrap text-left">
                      <SmartButton label={col.header} size="sm" iconPosition="right" variant="ghost" onClick={() => handleSort?.(col.accessor)} icon={!isSorted ? "chevrons-up-down" : sortOrder === "desc" ? "chevron-down" : "chevron-up"} className={cn("text-muted-foreground hover:text-foreground", isSorted && "text-primary opacity-100 font-medium")} />
                    </TableHead>
                  )
                })}
                {renderActions && <TableHead className="sticky top-0 right-0 z-20 text-right bg-background shadow-sm w-[1%] px-1" />}
              </TableRow>
            </thead>
            <TableBody>
              {data.map((row: any, i: number) => (
                <TableRow key={getRowKey?.(row, i) ?? i} className="group transition-colors hover:bg-muted/50 h-[33px]">
                  {visibleColumns.map((c: any) => <TableCell key={c.accessor} className="px-4 py-0.5 whitespace-nowrap">{renderCell(c.accessor, row, c.type)}</TableCell>)}
                  {renderActions && <TableCell className="sticky right-0 text-right bg-background group-hover:bg-muted shadow-left w-[1%] px-0 py-0 whitespace-nowrap">{renderActions(row)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
// --- COMPONENTE PRINCIPAL ---
export function DynamicTableContent({ tableName, crudEndpoint, maxHeight = "75vh", defaultViewMode = "table", allowViewToggle = true, renderCard }: any) {
  const baseId = useId(), t = useTranslation(), [mounted, setMounted] = useState(false), [viewMode, setViewMode] = useState<TableViewMode>(defaultViewMode)
  const storageKey = `dt_${tableName}`, idKey = `id_${tableName}`
  useEffect(() => setMounted(true), [])
  const [storage, setStorage] = useLocalStorage(storageKey, DEFAULT_STORAGE)
  const { query = {}, ui = {} } = mounted ? storage : DEFAULT_STORAGE
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder, pageIndex: rawPageIndex = 0 } = query
  // Columnas cacheadas por tabla en localStorage
  const [cachedCols, setCachedCols] = useLocalStorage<any[]>(`dt_cols_${tableName}`, EMPTY_ARR)
  const hasCachedCols = cachedCols.length > 0
  const { data: fetchedCols, isLoading: loadingColumns } = useApi<any[]>(!hasCachedCols && tableName ? `/schema/${tableName}/columns` : null, { select: (r: any) => r?.data ?? r })
  useEffect(() => {
    if (!hasCachedCols && fetchedCols?.length) setCachedCols(fetchedCols)
  }, [hasCachedCols, fetchedCols, setCachedCols])
  const columns = hasCachedCols ? cachedCols : (fetchedCols || EMPTY_ARR)
  const patchQuery = (patch: any, resetPage = false) => setStorage((prev: any) => ({ ...prev, query: { ...prev.query, ...patch, ...(resetPage && { pageIndex: 0 }) } }))
  const clearStorage = () => setStorage(DEFAULT_STORAGE)
  const apiConfig = useMemo(() => ({
    params: {
      ...appliedSearchValues, page: rawPageIndex + 1,
      ...(query.pageSize && { per_page: query.pageSize }),
      ...(search && { search }),
      ...(sortBy && { sort_by: sortBy, sort_order: sortOrder || "desc" }),
      ...(dateRange?.from && { from: dateRange.from }),
      ...(dateRange?.to && { to: dateRange.to }),
    }
  }), [appliedSearchValues, rawPageIndex, query.pageSize, search, sortBy, sortOrder, dateRange?.from, dateRange?.to])
  const { data: res, isLoading: loadingData, error, refetch: fetchData } = useApi(`/table/${tableName}/data`, { enabled: columns.length > 0, config: apiConfig })
  const data = res?.data ?? EMPTY_ARR, totalRows = res?.total ?? 0, pageSize = query.pageSize || res?.per_page || 10
  const loading = !mounted || (!hasCachedCols && loadingColumns) || loadingData
  const { columnVisibility, visibleColumns } = useMemo(() => {
    const vis: Record<string, boolean> = {}, list: any[] = []
    for (const c of columns) {
      const v = ui.columnVisibility?.[c.accessor] ?? !c.hidden
      vis[c.accessor] = v
      if (v) list.push(c)
    }
    return { columnVisibility: vis, visibleColumns: list }
  }, [columns, ui.columnVisibility])
  const toggleColumn = (key: string) => setStorage((prev: any) => ({ ...prev, ui: { ...prev.ui, columnVisibility: { ...prev.ui?.columnVisibility, [key]: !columnVisibility[key] } } }))
  const handleSort = (key: string) => {
    const next = sortBy !== key ? "asc" : sortOrder === "asc" ? "desc" : undefined
    patchQuery({ sortBy: next ? key : undefined, sortOrder: next }, true)
  }
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))
  const goTo = (p: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, p - 1)) })
  const changePageSize = (size: number) => patchQuery({ pageSize: Math.max(size, 1) }, true)
  const getId = (row: any) => row?.[idKey] ?? row?.id
  const getRowKey = (row: any, i: number) => getId(row) ?? i
  const activeSearchCount = Object.values(appliedSearchValues).filter(Boolean).length
  const isFiltered = Boolean(activeSearchCount || search || dateRange?.from || dateRange?.to || sortBy || pageIndex > 0 || (query.pageSize && query.pageSize !== (res?.per_page ?? 10)))
  const searchMenuItems: SDItem[] = [
    { type: "custom", custom: <SearchFormContent tableName={tableName} appliedValues={appliedSearchValues} onApply={(v: any) => patchQuery({ appliedSearchValues: v }, true)} onClear={() => patchQuery({ appliedSearchValues: {} }, true)} /> }
  ]
  const toggleColumnItems = columns.map(({ header: label, accessor: key, hidden }: any) => ({ type: "checkbox" as const, label, checked: columnVisibility[key] ?? !hidden, onChange: () => toggleColumn(key) }))
  const exportMenuItems = [{ label: t("Excel"), color: "text-green-500", icon: "file-spreadsheet", action: () => exportTableToExcel(tableName, columns, apiConfig.params) }]
  const pageSizeItems = PAGE_SIZES.map((n) => ({ label: String(n), action: () => changePageSize(n) }))
  const renderCell = (accessor: string, row: any, type?: string) => <CellFormatter accessor={accessor} row={row} rowId={getId(row)} type={type} tableName={tableName} />
  const renderActions = (row: any) => <ActionButtons row_id={getId(row)} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      {/* TOOLBAR */}
      <div className="flex items-center gap-2 flex-wrap w-full flex-none">
        <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
        <div><SearchInput key={search} defaultValue={search} onSearchSubmit={(s) => patchQuery({ search: s }, true)} filterOnEnter /></div>
        <SmartDropdown icon="filter" variant="default" badge={activeSearchCount > 0 ? activeSearchCount : undefined} align="start" items={searchMenuItems} label="Filtro avanzado" disableHover />
        <DatePicker variant="button" mode="range" value={dateRange} onChange={(r) => patchQuery({ dateRange: r || {} }, true)} />
        <ResetButton onReset={clearStorage} canReset={!!isFiltered} />
        <SmartDropdown label={t("Export")} icon="download" items={exportMenuItems} />
        <SmartDropdown label={t("Visible columns:")} icon="eye" items={toggleColumnItems} />
        {allowViewToggle && (
          <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
            <SmartButton variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" icon="table" tooltip="Vista de tabla" onClick={() => setViewMode("table")} />
            <SmartButton variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" icon="layout-grid" tooltip="Vista en cuadrícula (grid)" onClick={() => setViewMode("grid")} />
          </div>
        )}
        <AsyncState isLoading={loading} variant="inline" />
      </div>
      {/* COMPONENTE DE DATOS */}
      <SmartTable data={data} visibleColumns={visibleColumns} sortBy={sortBy} sortOrder={sortOrder} loading={loading} error={error} handleSort={handleSort} getRowKey={getRowKey} fetchData={fetchData} renderCell={renderCell} renderActions={renderActions} renderCard={renderCard} viewMode={viewMode} />
      {/* PAGINACIÓN INTEGRADA */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full flex-none">
        <div className="flex items-center justify-center gap-2 pl-1">
          <div className="text-left"><div className="font-bold">{totalRows}</div><div className="text-muted-foreground">{t("Records")}</div></div>
          <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
            <span>{t("Page")}</span>
            <Input id={`${baseId}-page`} name={`${baseId}-page`} key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1} className="w-16 h-8 text-sm text-left" onKeyDown={(e) => { if (e.key === "Enter") goTo(+e.currentTarget.value) }} />
            <span>{t("of")} <strong className="font-semibold">{totalPages}</strong></span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t("Rows:")}</span>
            <SmartDropdown buttonLabel={String(pageSize)} items={pageSizeItems} labelExtra={<Input id={`${baseId}-pagesize`} name={`${baseId}-pagesize`} type="number" min={1} placeholder={t("Custom...")} className="w-36 h-8 text-sm" onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { changePageSize(+e.currentTarget.value); e.currentTarget.value = "" } }} />} />
          </div>
          <div className="flex items-center gap-1">
            <SmartButton icon="chevrons-left" tooltip={t("First page")} disabled={pageIndex === 0} onClick={() => goTo(1)} />
            <SmartButton icon="chevron-left" tooltip={t("Previous page")} disabled={pageIndex === 0} onClick={() => goTo(pageIndex)} />
            <SmartButton icon="chevron-right" tooltip={t("Next page")} disabled={pageIndex >= totalPages - 1} onClick={() => goTo(pageIndex + 2)} />
            <SmartButton icon="chevrons-right" tooltip={t("Last page")} disabled={pageIndex >= totalPages - 1} onClick={() => goTo(totalPages)} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default DynamicTableContent