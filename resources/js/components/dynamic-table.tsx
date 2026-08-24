import { useCallback } from "react"
import { SmartTable } from "@/components/smart-table"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { useDataTable } from "@/hooks/datatable/use-datatable"
import { ToggleColumns } from "@/components/datatable/toggle-columns"
import { ExportMenu } from "@/components/datatable/export-menu"
import { DataTableFooter } from "@/components/datatable/footer"
import { ResetTableButton } from "@/components/datatable/reset-table-button"
import { DatePicker } from "@/components/ui/datepicker"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { DataTableSearchDropdown } from "@/components/datatable/datatable-search"
export function DynamicTableContent({ tableName, columns: initialColumns, crudEndpoint, dataEndpoint, maxHeight = "75vh" }: any) {
  const tableState = useDataTable({ ...{ tableName, endpoint: dataEndpoint, columns: initialColumns } })
  const { data, columns, columnVisibility, toggleColumn, resetAll, fetchData, appliedSearchValues, dateRange, setSearchValues, clearSearchValues, 
    setDateRange, searchFields, activeSearchCount, pagination, isFiltered } = tableState
  const renderCell = useCallback((accessor: string, row: any) => <CellFormatter {...{ accessor, row, tableName }} />, [tableName])
  const renderActions = useCallback((row: any) => (
    <ActionButtons {...{ row_id: row[`id_${tableName}`], tableName, endpoint: crudEndpoint, onSuccess: fetchData }} />
  ), [tableName, crudEndpoint, fetchData])
  return (
    <div {...{ className: "flex flex-col gap-2 w-full p-4 overflow-hidden h-fit", style: { maxHeight } }}>
      <div {...{ className: "flex items-center gap-2 flex-wrap w-full flex-none" }}>
        <NewRecordButton {...{ tableName, endpoint: crudEndpoint, onSuccess: fetchData }} />
        <DataTableSearchDropdown {...{ fields: searchFields, appliedValues: appliedSearchValues, activeCount: activeSearchCount, onApply: setSearchValues, onClear: clearSearchValues }} />
        <DatePicker {...{ variant: "button", mode: "range", value: dateRange, onChange: setDateRange }} />
        <ResetTableButton {...{ onReset: resetAll, isFiltered }} />
        <ExportMenu {...{ tableName, columns, data }} />
        <ToggleColumns {...{ columns, columnVisibility, onToggle: toggleColumn }} />
      </div>
      <SmartTable {...{ tableState, renderCell, renderActions }} />
      <div {...{ className: "flex-none" }}> <DataTableFooter {...pagination} /> </div>
    </div>
  )
}