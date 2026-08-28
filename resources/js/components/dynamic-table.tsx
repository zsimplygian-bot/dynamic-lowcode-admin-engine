import { useCallback, useMemo } from "react"
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
import { Loader2 } from "lucide-react"
interface DynamicTableContentProps {
  tableName: string
  columns?: any[]
  crudEndpoint?: string
  dataEndpoint?: string
  maxHeight?: string
}

export function DynamicTableContent({
  tableName,
  columns: initialColumns,
  crudEndpoint,
  dataEndpoint,
  maxHeight = "75vh",
}: DynamicTableContentProps) {
  const tableState = useDataTable({
    tableName,
    endpoint: dataEndpoint,
    columns: initialColumns,
  })

  const {
    data,
    columns,
    columnVisibility,
    toggleColumn,
    resetAll,
    fetchData,
    appliedSearchValues,
    dateRange,
    setSearchValues,
    clearSearchValues,
    setDateRange,
    searchFields,
    activeSearchCount,
    pagination,
    isFiltered,
  } = tableState

  // 1. 👇 Creamos un mapa rápido de tipos { [accessor]: type }
  const columnTypesMap = useMemo(() => {
    const map = new Map<string, string>()
    columns?.forEach((col: any) => {
      if (col.accessor && col.type) {
        map.set(col.accessor, col.type)
      }
    })
    return map
  }, [columns])

  // 2. 👇 Le pasamos el 'type' exacto a CellFormatter
  const renderCell = useCallback(
    (accessor: string, row: any) => (
      <CellFormatter
        accessor={accessor}
        row={row}
        type={columnTypesMap.get(accessor)}
        tableName={tableName}
      />
    ),
    [tableName, columnTypesMap]
  )

  const renderActions = useCallback(
    (row: any) => (
      <ActionButtons
        row_id={row[`id_${tableName}`]}
        tableName={tableName}
        endpoint={crudEndpoint}
        onSuccess={fetchData}
      />
    ),
    [tableName, crudEndpoint, fetchData]
  )

  return (
    <div
      className="flex flex-col gap-2 w-full p-4 overflow-hidden h-fit"
      style={{ maxHeight }}
    >
      {/* Barra de Herramientas y Filtros */}
      <div className="flex items-center gap-2 flex-wrap w-full flex-none">
      <NewRecordButton tableName={tableName} endpoint={crudEndpoint} onSuccess={fetchData} />
      <DataTableSearchDropdown fields={searchFields} appliedValues={appliedSearchValues} activeCount={activeSearchCount} onApply={setSearchValues} onClear={clearSearchValues} />
      <DatePicker variant="button" mode="range" value={dateRange} onChange={setDateRange} />
      <ResetTableButton onReset={resetAll} isFiltered={isFiltered} />
      <ExportMenu tableName={tableName} columns={columns} data={data} />
      <ToggleColumns columns={columns} columnVisibility={columnVisibility} onToggle={toggleColumn} />
      {/* 👇 Spinner sutil pegado a la derecha de ToggleColumns */}
      {tableState.loading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in duration-150 pl-1">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
    </div>

      {/* Tabla Principal */}
      <SmartTable
        tableState={tableState}
        renderCell={renderCell}
        renderActions={renderActions}
      />

      {/* Paginador */}
      <div className="flex-none">
        <DataTableFooter {...pagination} />
      </div>
    </div>
  )
}