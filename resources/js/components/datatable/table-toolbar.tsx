import { useState, useEffect, useMemo } from "react"
import { SmartButton } from "@/components/smart-button"
import { SmartDropdown } from "@/components/smart-dropdown"
import { NewRecordButton } from "@/components/new-record-button"
import { ResetButton } from "@/components/reset-button"
import { DatePicker } from "@/components/date-picker"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { useApi } from "@/hooks/use-api"
import { useLocalStorage } from "@/hooks/use-local-storage"

const t = (s: string) => s

async function exportTableToExcel(tableName: string, columns: any[], params?: Record<string, any>) {
  if (!columns.length) return
  try {
    const q = new URLSearchParams()
    if (params) Object.entries(params).forEach(([k, v]) => v != null && v !== "" && q.append(k, String(v)))
    const rawRes = await fetch(`/table/${tableName}/export?${q}`)
    const json = await rawRes.json()
    if (!json?.data?.length) return
    const XLSX = await import("xlsx")
    const ws = XLSX.utils.aoa_to_sheet([columns.map((c) => c.header), ...json.data.map((r: any) => columns.map((c) => r[c.accessor]))])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tableName.toUpperCase())
    XLSX.writeFile(wb, `${tableName}_${Date.now()}.xlsx`)
  } catch (e) { console.error("Error al exportar:", e) }
}

function SearchFormContent({ tableName, appliedValues = {}, onApply, onClear, transformFields }: any) {
  const [vals, setVals] = useState(appliedValues)
  useEffect(() => setVals(appliedValues), [appliedValues])

  const [fields, setFields] = useLocalStorage<FieldConfig[]>(`dt_fields_${tableName}`, [])
  const needsFields = !fields.length && Boolean(tableName)
  const { data: fetchedFields, isLoading, error, refetch } = useApi<FieldConfig[]>(
    needsFields ? `/schema/${tableName}/fields?mode=filter` : null,
    { enabled: needsFields }
  )
  useEffect(() => { if (fetchedFields?.length) setFields(fetchedFields) }, [fetchedFields, setFields])

  // Aplica la transformación personalizada si la página la provee; si no, usa los campos tal cual
  const formFields = useMemo(() => (transformFields ? transformFields(fields) : fields), [fields, transformFields])
  const hasValues = Object.values(vals).some((v) => v != null && v !== "")

  return (
    <div className="flex flex-col gap-2 min-w-[280px] p-1" onClick={(e) => e.stopPropagation()}>
      <AsyncState isLoading={needsFields && isLoading} error={error} onRetry={refetch}>
        <div className="w-full pl-2 max-h-[380px] overflow-y-auto pr-1">
          {!formFields.length ? (
            <span className="text-xs text-muted-foreground px-2 py-4 block text-center">
              No hay campos disponibles para filtrar
            </span>
          ) : (
            <FormGroup
              fields={formFields}
              values={vals}
              layout="horizontal"
              onChange={(k: string, v: any) => setVals((p: any) => ({ ...p, [k]: v }))}
            />
          )}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t mt-1">
          <SmartButton variant="default" size="sm" icon="check" disabled={!hasValues} className="flex-1 justify-center" onClick={() => onApply(vals)} label="Apply" />
          <ResetButton onReset={() => { setVals({}); onClear() }} canReset={hasValues} size="sm" variant="ghost" className="flex-1 justify-center" label="Clear" />
        </div>
      </AsyncState>
    </div>
  )
}

export interface TableToolbarProps {
  tableName: string; crudEndpoint?: string; readOnly?: boolean; search?: string; onSearch: (s: string) => void;
  appliedSearchValues: Record<string, any>; onApplyFilter: (vals: any) => void; onClearFilter: () => void;
  dateRange: { from?: string; to?: string }; onDateRangeChange: (r: any) => void; onReset: () => void; isFiltered: boolean;
  columns: any[]; columnVisibility: Record<string, boolean>; onToggleColumn: (accessor: string) => void;
  onResetColumnsVisibility?: () => void; onClearSelection?: () => void; onShowAllColumns?: () => void;
  queryParams: Record<string, any>; selectedCount?: number; onDeleteSelected?: () => void; loading?: boolean; onRefresh?: () => void;
  transformFilterFields?: (fields: FieldConfig[]) => FieldConfig[]; // <-- Inyección genérica
}

export function TableToolbar({
  tableName, crudEndpoint, readOnly, search = "", onSearch, appliedSearchValues, onApplyFilter, onClearFilter,
  dateRange, onDateRangeChange, onReset, isFiltered, columns, columnVisibility, onToggleColumn, onResetColumnsVisibility,
  onClearSelection, onShowAllColumns, queryParams, selectedCount = 0, onDeleteSelected, onRefresh, transformFilterFields
}: TableToolbarProps) {
  const [filteredColumns, setFilteredColumns] = useState(columns)
  useEffect(() => setFilteredColumns(columns), [columns])
  const activeCount = Object.values(appliedSearchValues).filter(Boolean).length
  const exportCols = columns.filter((c) => columnVisibility[c.accessor] ?? !c.hidden)

  return (
    <div className="flex items-center gap-2 flex-wrap w-full flex-none">
      {!readOnly && <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={onRefresh} />}
      <div><SearchInput key={search} defaultValue={search} onSearchSubmit={onSearch} filterOnEnter /></div>
      <SmartDropdown icon="filter" variant="outline" badge={activeCount || undefined} align="start" label="Advanced filter:" disableHover
        items={[{ type: "custom", content: <SearchFormContent tableName={tableName} appliedValues={appliedSearchValues} onApply={onApplyFilter} onClear={onClearFilter} transformFields={transformFilterFields} /> }]} />
      <DatePicker variant="button" mode="range" value={dateRange} onChange={onDateRangeChange} />
      <SmartDropdown label={t("Export")} variant="outline" icon="download"
        items={[{ label: t("Excel"), color: "text-green-500", icon: "file-spreadsheet", action: () => exportTableToExcel(tableName, exportCols, queryParams) }]} />
      <SmartDropdown label={t("Visible columns:")} variant="outline" icon="eye" items={[
        { type: "custom", content: <SearchInput items={columns} searchKey="header" onFiltered={setFilteredColumns} /> },
        "-", ...filteredColumns.map((c) => ({ type: "checkbox" as const, label: c.header, checked: columnVisibility[c.accessor] ?? !c.hidden, onChange: () => onToggleColumn(c.accessor) })),
        "-", { label: "Reset columns", icon: "rotate-ccw", alignContent: "center", action: onResetColumnsVisibility }
      ]} />
      <SmartDropdown label={t("Table Settings")} variant="outline" icon="settings"
        items={[{ label: t("Clear Selection"), icon: "check-square", disabled: selectedCount === 0, action: onClearSelection }, { label: t("Show All Columns"), icon: "eye-off", action: onShowAllColumns }]} />
      <ResetButton onReset={onReset} variant="outline" canReset={isFiltered} />
      {!readOnly && selectedCount > 0 && <SmartButton variant="destructive" size="sm" icon="trash-2" tooltip="Delete rows" label={`${selectedCount}`} onClick={onDeleteSelected} confirmation />}
    </div>
  )
}
export default TableToolbar