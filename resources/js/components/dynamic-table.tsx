import { useCallback } from "react"
import { SmartTable } from "@/components/smart-table"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { useDataTable } from "@/hooks/datatable/use-datatable"
import { ToggleColumns } from "@/components/datatable/toggle-columns"
import { ExportMenu } from "@/components/datatable/export-menu"
import { DataTableFooter } from "@/components/datatable/footer"
import { ResetButton } from "@/components/reset-button"
import { DatePicker } from "@/components/date-picker"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { DataTableSearchDropdown } from "@/components/datatable/datatable-search"
import { AsyncState } from "@/components/async-state"
import { SearchInput } from "@/components/search-input"
interface DynamicTableContentProps { tableName: string; crudEndpoint?: string; dataEndpoint?: string; maxHeight?: string }
export function DynamicTableContent({ tableName, crudEndpoint, dataEndpoint = `/tables/${tableName}/data`, maxHeight = "75vh" }: DynamicTableContentProps) {
  const tableState = useDataTable({ tableName, endpoint: dataEndpoint })
  const { data, columns, columnVisibility, toggleColumn, resetAll, fetchData, appliedSearchValues, globalSearch, dateRange, setSearchValues, clearSearchValues, setGlobalSearch, setDateRange,
    searchFields, activeSearchCount, pagination, isFiltered, loading, getId } = tableState
  const renderCell = useCallback(
    (accessor: string, row: any) => {
      const col = columns?.find((c: any) => c.accessor === accessor)
      return <CellFormatter accessor={accessor} row={row} rowId={getId(row)} type={col?.type} tableName={tableName} />
    }, [tableName, columns, getId]
  )
  const renderActions = useCallback(
    (row: any) => (<ActionButtons row_id={getId(row)} tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />), [tableName, crudEndpoint, fetchData, getId]
  )
  return (
    <div className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit" style={{ maxHeight }}>
      <div className="flex items-center gap-2 flex-wrap w-full flex-none">
        <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={() => { resetAll(); fetchData() }} />
        <div>
          <SearchInput key={globalSearch} defaultValue={globalSearch} onSearchSubmit={setGlobalSearch} filterOnEnter/>
        </div>
        <DataTableSearchDropdown fields={searchFields} appliedValues={appliedSearchValues} activeCount={activeSearchCount} onApply={setSearchValues} onClear={clearSearchValues} />
        <DatePicker variant="button" mode="range" value={dateRange} onChange={setDateRange} />
        <ResetButton onReset={resetAll} canReset={isFiltered} />
        <ExportMenu tableName={tableName} columns={columns} data={data} />
        <ToggleColumns columns={columns} columnVisibility={columnVisibility} onToggle={toggleColumn} />
        <AsyncState isLoading={loading} variant="inline" />
      </div>
      <SmartTable tableState={tableState} renderCell={renderCell} renderActions={renderActions} />
      <div className="flex-none"><DataTableFooter {...pagination} /></div>
    </div>
  )
}