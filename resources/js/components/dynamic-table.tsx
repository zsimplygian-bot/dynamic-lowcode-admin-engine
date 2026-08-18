import { useCallback, useMemo } from "react"
import { SmartTable } from "@/components/smart-table"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { useDataTable } from "@/hooks/use-datatable"
import { ToggleColumns } from "@/components/datatable/toggle-columns"
import { ExportMenu } from "@/components/datatable/export-menu"
import { DataTableFooter } from "@/components/datatable/footer"
import { ResetTableButton } from "@/components/datatable/reset-table-button"
import { DatePicker } from "@/components/ui/datepicker"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { DataTableSearchDropdown } from "@/components/datatable/datatable-search"

export function DynamicTableContent({ tableName, rows, columns: initialColumns, maxHeight = "75vh" }: any) {
  const endpoint = `/crud/${tableName}`
  const tableState = useDataTable({...{ tableName, endpoint: `/tables/${tableName}/data`, initialRows: rows, columns: initialColumns }})
  const { data, columns, visibleColumns, columnVisibility, setColumnVisibility, resetAll, fetchData, appliedSearchValues, setFilters, pagination, isFiltered } = tableState

  const renderCell = useCallback((accessor: string, row: any) => (
    <CellFormatter {...{ accessor, row, tableName }} />
  ), [tableName])

  const renderActions = useCallback((row: any, onSuccess?: () => void) => (
    <ActionButtons {...{ recordId: row.id ?? row[`id_${tableName?.toLowerCase()}`], tableName, endpoint, initialValues: row, onSuccess: () => { onSuccess?.(); fetchData() } }} />
  ), [tableName, endpoint, fetchData])

  const extraHeader = useMemo(() => (
    <div {...{ className: "flex items-center gap-2 flex-wrap w-full" }}>
      <NewRecordButton {...{ tableName, endpoint, onSuccess: fetchData }} />
      
      {/* Búsqueda avanzada sincronizada estrictamente con las columnas visibles */}
      <DataTableSearchDropdown {...{ columns: visibleColumns, appliedSearchValues, setFilters }} />

      <DatePicker {...{ mode: "range", variant: "button", value: appliedSearchValues, onChange: (range: any) => setFilters({ date_from: range?.from, date_to: range?.to }) }} />
      <ResetTableButton {...{ onReset: resetAll, isFiltered }} />
      <ExportMenu {...{ tableName, columns, data }} />
      <ToggleColumns {...{ columns, columnVisibility, setColumnVisibility }} />
    </div>
  ), [tableName, endpoint, fetchData, appliedSearchValues, setFilters, resetAll, isFiltered, visibleColumns, columns, data, columnVisibility, setColumnVisibility])

  return (
    <div {...{ className: "flex flex-col w-full p-4 overflow-hidden h-fit", style: { maxHeight } }}>
      <SmartTable {...{ tableState, renderCell, renderActions, extraHeader, footer: <DataTableFooter {...pagination} /> }} />
    </div>
  )
}