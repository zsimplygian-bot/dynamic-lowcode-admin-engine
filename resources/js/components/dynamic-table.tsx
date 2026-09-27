import { useState, useMemo, useCallback, useEffect, memo, useId } from "react"
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
import { FormGroup } from "@/components/form-group"
import { Input } from "@/components/ui/input"
import { useVirtualList } from "@/hooks/use-virtual-list"
import { useApi } from "@/hooks/use-api"
import { useTranslation } from "@/hooks/use-translation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
const EMPTY_ARR: any[] = []
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
const DEFAULT_STORAGE = { query: { pageIndex: 0, appliedSearchValues: {}, dateRange: {} }, ui: { columnVisibility: {} } }
const defaultRenderCell = (acc: string, row: any) => row?.[acc] ?? ""
const TableRowMemo = memo(({ row, columns, renderCell, renderActions }: any) => (
  <TableRow className="group transition-colors hover:bg-muted/50 h-[33px]">
    {columns.map((c: any) => <TableCell key={c.accessor} className="px-4 py-0.5 whitespace-nowrap">{renderCell(c.accessor, row, c.type)}</TableCell>)}
    {renderActions && <TableCell className="sticky right-0 text-right bg-background group-hover:bg-muted/100 shadow-left w-[1%] px-0 py-0 whitespace-nowrap">{renderActions(row)}</TableCell>}
  </TableRow>
), (prev, next) => prev.row === next.row && prev.columns === next.columns)
export const SmartTable = memo((props: any) => {
  const { data = EMPTY_ARR, visibleColumns = EMPTY_ARR, sortBy, sortOrder, loading, error, handleSort, getRowKey, fetchData, renderCell = defaultRenderCell, renderActions, virtualized = true } = props.tableState || props
  const totalCols = visibleColumns.length + (renderActions ? 1 : 0), totalRows = data.length
  const { scrollRef, visibleRows, startIndex, paddingTop, paddingBottom } = useVirtualList({ data, enabled: virtualized, resetTrigger: `${sortBy}_${sortOrder}` })
  const isTableLoading = Boolean(loading && totalRows === 0)
  return (
    <div className="relative flex-1 min-h-0 border border-border bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
      <div ref={scrollRef} className="w-full overflow-auto max-h-full">
        <Table className="min-w-full">
          <thead>
            <TableRow>
              {visibleColumns.map((col: any) => {
                const isSorted = sortBy === col.accessor
                return (
                  <TableHead key={col.accessor} className="px-0 sticky top-0 bg-background z-10 shadow-sm whitespace-nowrap text-left">
                    <SmartButton label={col.header} size="sm" iconPosition="right" variant="ghost" onClick={() => handleSort?.(col.accessor)}
                      icon={!isSorted ? "chevrons-up-down" : sortOrder === "desc" ? "chevron-down" : "chevron-up"}
                      className={cn("text-muted-foreground hover:text-foreground", isSorted && "text-primary opacity-100 font-medium")} />
                  </TableHead>
                )
              })}
              {renderActions && <TableHead className="sticky top-0 right-0 z-20 text-right bg-background shadow-sm w-[1%] px-1" />}
            </TableRow>
          </thead>
          <TableBody>
            {isTableLoading || error ? (
              <TableRow><TableCell colSpan={totalCols} className="text-center"><AsyncState isLoading={isTableLoading} error={error} loadingLabel="Cargando información..." onRetry={fetchData} minHeight="min-h-[100px]" /></TableCell></TableRow>
            ) : !totalRows ? ( <TableRow><TableCell colSpan={totalCols} className="text-center text-muted-foreground">No hay resultados disponibles.</TableCell></TableRow>
            ) : (
              <>{virtualized && paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }}><td colSpan={totalCols} className="p-0" /></tr>}
                {visibleRows.map((row: any, i: number) => (
                  <TableRowMemo key={getRowKey?.(row, startIndex + i) ?? i} row={row} columns={visibleColumns} renderCell={renderCell} renderActions={renderActions} />
                ))}
                {virtualized && paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }}><td colSpan={totalCols} className="p-0" /></tr>}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
const SearchFormContent = memo(function SearchFormContent({ fields = EMPTY_ARR, appliedValues = {}, onApply, onClear }: any) {
  const [vals, setVals] = useState(appliedValues)
  useEffect(() => setVals(appliedValues || {}), [appliedValues])
  const has = Object.values(vals).some((v) => v != null && v !== "")
  if (!fields.length) return <span className="text-xs text-muted-foreground px-2 py-2">No hay campos disponibles</span>
  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="w-100 pl-2 max-h-[400px] overflow-y-auto pr-1">
        <FormGroup fields={fields} values={vals} layout="horizontal" onChange={(k: string, v: any) => setVals((p: any) => ({ ...p, [k]: v }))} />
      </div>
      <div className="flex items-center gap-2 pt-1 border-t">
        <SmartButton variant="default" size="sm" icon="check" disabled={!has} className="flex-1 justify-center" onClick={() => has && onApply(vals)} label="Aplicar" />
        <ResetButton onReset={() => { setVals({}); onClear() }} canReset={has} size="sm" variant="ghost" className="flex-1 justify-center" label="Limpiar" tooltip="" />
      </div>
    </div>
  )
})
export function DynamicTableContent({ tableName, crudEndpoint, dataEndpoint = `/table/${tableName}/data`, maxHeight = "75vh" }: any) {
  const baseId = useId()
  const t = useTranslation()
  const [mounted, setMounted] = useState(false)
  const storageKey = `dt_${tableName}`, idKey = `id_${tableName}`, columnsStorageKey = `dt_columns_${tableName}`
  useEffect(() => setMounted(true), [])
  const [storage, setStorage] = useLocalStorage(storageKey, DEFAULT_STORAGE)
  const [persistedColumns, setPersistedColumns] = useLocalStorage<any[] | null>(columnsStorageKey, null)
  const activeColumns = mounted ? persistedColumns : null
  const columnsUrl = !activeColumns && tableName ? `/schema/${tableName}/columns` : null
  const { data: fetchedColumns, isLoading: loadingColumns } = useApi<any[]>(columnsUrl, {
    enabled: Boolean(columnsUrl),
    select: (r: any) => r?.data ?? r
  })
  useEffect(() => {
    if (mounted && fetchedColumns && fetchedColumns.length > 0 && !persistedColumns) {
      setPersistedColumns(fetchedColumns)
    }
  }, [mounted, fetchedColumns, persistedColumns, setPersistedColumns])
  const columns = activeColumns ?? fetchedColumns ?? EMPTY_ARR
  const hasColumns = columns.length > 0
  const patchQuery = useCallback((patch: any, resetPage = false) => {
    setStorage((prev: any) => ({ ...prev, query: { ...prev.query, ...patch, ...(resetPage && { pageIndex: 0 }) } }))
  }, [setStorage])
  const clearStorage = useCallback(() => setStorage(DEFAULT_STORAGE), [setStorage])
  const { query = {}, ui = {} } = mounted ? storage : DEFAULT_STORAGE
  const { search = "", appliedSearchValues = {}, dateRange = {}, sortBy, sortOrder, pageIndex: rawPageIndex = 0 } = query
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
  const { data: res, isLoading: loadingData, error, refetch: fetchData } = useApi(dataEndpoint, {
    enabled: Boolean(dataEndpoint && hasColumns),
    config: apiConfig
  })
  const data = res?.data ?? EMPTY_ARR, totalRows = res?.total ?? 0
  const pageSize = query.pageSize || res?.per_page || 10
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
  const toggleColumn = useCallback((key: string) => {
    setStorage((prev: any) => ({ ...prev, ui: { ...prev.ui, columnVisibility: { ...prev.ui?.columnVisibility, [key]: !columnVisibility[key] } } }))
  }, [setStorage, columnVisibility])
  const handleSort = useCallback((key: string) => {
    const next = sortBy !== key ? "asc" : sortOrder === "asc" ? "desc" : undefined
    patchQuery({ sortBy: next ? key : undefined, sortOrder: next }, true)
  }, [sortBy, sortOrder, patchQuery])
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndex = Math.max(0, Math.min(rawPageIndex, totalPages - 1))
  const goTo = useCallback((p: number) => patchQuery({ pageIndex: Math.max(0, Math.min(totalPages - 1, p - 1)) }), [patchQuery, totalPages])
  const changePageSize = useCallback((size: number) => patchQuery({ pageSize: Math.max(size, 1) }, true), [patchQuery])
  const getId = useCallback((row: any) => row?.[idKey] ?? row?.id, [idKey])
  const getRowKey = useCallback((row: any, i: number) => getId(row) ?? i, [getId])
  const searchFields = useMemo(() => columns.filter((c: any) => c.searchable).map((c: any) => ({ id: c.accessor, name: c.accessor, label: c.header, type: c.type, options: c.options })), [columns])
  const activeSearchCount = Object.values(appliedSearchValues).filter(Boolean).length
  const isFiltered = Boolean(activeSearchCount || search || dateRange?.from || dateRange?.to || sortBy || pageIndex > 0 || (query.pageSize && query.pageSize !== (res?.per_page ?? 10)))
  const searchMenuItems = useMemo<SDItem[]>(() => [
    { type: "custom", custom: <SearchFormContent fields={searchFields} appliedValues={appliedSearchValues} onApply={(v: any) => 
      patchQuery({ appliedSearchValues: v }, true)} onClear={() => patchQuery({ appliedSearchValues: {} }, true)} /> }
  ], [searchFields, appliedSearchValues, patchQuery])
  const toggleColumnItems = useMemo(() => columns.map(({ header: label, accessor: key, hidden }: any) => ({
    type: "checkbox" as const, label, checked: columnVisibility[key] ?? !hidden, onChange: () => toggleColumn(key)
  })), [columns, columnVisibility, toggleColumn])
  const exportToExcel = useCallback(async () => {
    if (!columns.length) return
    try {
      const q = new URLSearchParams()
      if (apiConfig.params) {
        Object.entries(apiConfig.params).forEach(([k, v]) => {
          if (v != null && v !== "") q.append(k, String(v))
        })
      }
      const rawRes = await fetch(`/table/${tableName}/export?${q.toString()}`)
      const json = await rawRes.json()
      const exportData = json?.data ?? EMPTY_ARR
      if (!exportData.length) return
      const ws = XLSX.utils.aoa_to_sheet([
        columns.map((c: any) => c.header),
        ...exportData.map((r: any) => columns.map((c: any) => r[c.accessor]))
      ])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, tableName.toUpperCase())
      XLSX.writeFile(wb, `${tableName}_${Date.now()}.xlsx`)
    } catch (e) {
      console.error("Error al exportar:", e)
    }
  }, [tableName, columns, apiConfig.params])
  const exportMenuItems = useMemo(() => [{ label: t("Excel"), color: "text-green-500", icon: "file-spreadsheet", action: exportToExcel }], [exportToExcel, t])
  const pageSizeItems = useMemo(() => PAGE_SIZES.map((n) => ({ label: String(n), action: () => changePageSize(n) })), [changePageSize])
  const renderCell = useCallback((accessor: string, row: any, type?: string) => <CellFormatter accessor={accessor} row={row} rowId={getId(row)} type={type} tableName={tableName} />, [tableName, getId])
  const renderActions = useCallback((row: any) => <ActionButtons row_id={getId(row)} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />, [tableName, crudEndpoint, fetchData, getId])
  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      <div className="flex items-center gap-2 flex-wrap w-full flex-none">
        <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
        <div><SearchInput key={search} defaultValue={search} onSearchSubmit={(s) => patchQuery({ search: s }, true)} filterOnEnter /></div>
        <SmartDropdown icon="filter" variant="default" badge={activeSearchCount > 0 ? activeSearchCount : undefined} align="start" items={searchMenuItems} label="Filtro avanzado" disableHover />
        <DatePicker variant="button" mode="range" value={dateRange} onChange={(r) => patchQuery({ dateRange: r || {} }, true)} />
        <ResetButton onReset={clearStorage} canReset={!!isFiltered} />
        <SmartDropdown label={t("Export")} icon="download" items={exportMenuItems} />
        <SmartDropdown label={t("Visible columns:")} icon="eye" items={toggleColumnItems} />
        <AsyncState isLoading={loading} variant="inline" />
      </div>
      <SmartTable data={data} visibleColumns={visibleColumns} sortBy={sortBy} sortOrder={sortOrder} loading={loading} error={error} handleSort={handleSort} getRowKey={getRowKey} fetchData={fetchData} renderCell={renderCell} renderActions={renderActions} />
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full flex-none">
        <div className="flex items-center justify-center gap-2 pl-1">
          <div className="text-left"> <div className="font-bold">{totalRows}</div> <div className="text-muted-foreground">{t("Records")}</div> </div>
          <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
            <span>{t("Page")}</span>
            <Input id={`${baseId}-page`} name={`${baseId}-page`} key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1} className="w-16 h-8 text-sm text-left" 
            onKeyDown={(e) => { if (e.key === "Enter") goTo(+e.currentTarget.value) }} /> <span>{t("of")} <strong className="font-semibold">{totalPages}</strong></span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t("Rows:")}</span>
            <SmartDropdown buttonLabel={String(pageSize)} items={pageSizeItems} labelExtra={<Input id={`${baseId}-pagesize`} name={`${baseId}-pagesize`} type="number" min={1} placeholder={t("Custom...")} className="w-36 h-8 text-sm" 
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { changePageSize(+e.currentTarget.value); e.currentTarget.value = "" } }} />} />
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