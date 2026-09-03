import { memo } from "react"
import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { SmartButton } from "@/components/smart-button"
import { AsyncState } from "@/components/async-state"
import { useVirtualList } from "@/hooks/use-virtual-list"
import { cn } from "@/lib/utils"
const defaultRenderCell = (accessor: string, row: any) => row[accessor] ?? ""
const TableRowMemo = memo(
  ({ row, columns, renderCell, renderActions }: any) => (
    <TableRow className="group transition-colors hover:bg-muted/50 h-[33px]">
      {columns.map((col: any) => (
        <TableCell key={col.accessor} className="px-4 py-0.5 whitespace-nowrap"> {renderCell(col.accessor, row)} </TableCell>
      ))}
      {renderActions && (
        <TableCell className="sticky right-0 text-right bg-background group-hover:bg-muted/100 shadow-left w-[1%] px-0 py-0 whitespace-nowrap"> {renderActions(row)} </TableCell>
      )}
    </TableRow>
  ), (prev, next) => prev.row === next.row && prev.columns === next.columns
)
TableRowMemo.displayName = "TableRowMemo"
interface SmartTableProps {
  tableState: any
  renderCell?: (accessor: string, row: any) => React.ReactNode
  renderActions?: (row: any) => React.ReactNode
  virtualized?: boolean
}
export const SmartTable = memo(({ tableState, renderCell, renderActions, virtualized = true }: SmartTableProps) => {
  const { data, visibleColumns, sortBy, sortOrder, loading, isReady, error, handleSort, getRowKey, fetchData } = tableState
  const activeRenderCell = renderCell || defaultRenderCell
  const totalCols = visibleColumns.length + (renderActions ? 1 : 0)
  const totalRows = data?.length || 0
  const { scrollRef, visibleRows, startIndex, paddingTop, paddingBottom } = useVirtualList({ data, enabled: virtualized, resetTrigger: `${sortBy}_${sortOrder}`, })
  const isTableLoading = (loading && (!data || data.length === 0)) || (!isReady && !error)
  return (
    <div className="relative flex-1 min-h-0 border border-border bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
      <div ref={scrollRef} className="w-full overflow-auto max-h-full">
        <Table className="min-w-full">
            <TableRow>
              {visibleColumns.map((col: any) => {
                const isSorted = sortBy === col.accessor
                const Icon = !isSorted ? ChevronsUpDown : sortOrder === "desc" ? ChevronDown : ChevronUp
                return (
                  <TableHead key={col.accessor} className="px-0 sticky top-0 bg-background z-10 shadow-sm whitespace-nowrap">
                    <SmartButton label={col.header} size="sm" icon={Icon} iconPosition="right" variant="ghost" 
                      onClick={() => handleSort(col.accessor)} className={cn("text-muted-foreground hover:text-foreground", isSorted && "text-primary opacity-100 font-medium")} />
                  </TableHead>
                )
              })}
              {renderActions && <TableHead className="sticky top-0 right-0 z-20 text-right bg-background shadow-sm w-[1%] px-1" />}
            </TableRow>
          <TableBody>
            {isTableLoading || error ? (
              <TableRow>
                <TableCell colSpan={totalCols} className="text-center">
                  <AsyncState isLoading={isTableLoading} error={error} loadingLabel="Cargando información..." onRetry={fetchData} minHeight="min-h-[100px]" />
                </TableCell>
              </TableRow>
            ) : totalRows === 0 ? ( <TableRow> <TableCell colSpan={totalCols} className="text-center text-muted-foreground">  No hay resultados disponibles. </TableCell> </TableRow>
            ) : (
              <>
                {virtualized && paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }}><td colSpan={totalCols} className="p-0" /></tr>}
                {visibleRows.map((row: any, i: number) => (
                  <TableRowMemo key={getRowKey(row, startIndex + i)} row={row} columns={visibleColumns} renderCell={activeRenderCell} renderActions={renderActions} />
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
SmartTable.displayName = "SmartTable"