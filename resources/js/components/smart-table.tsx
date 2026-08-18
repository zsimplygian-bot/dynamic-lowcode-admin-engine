import React, { useCallback, memo } from "react"
import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { SmartButton } from "@/components/smart-button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const defaultRenderCell = (accessor: string, row: any) => {
  const val = row[accessor]
  return val != null ? <span>{String(val)}</span> : <span {...{ className: "italic text-muted-foreground/50" }}>null</span>
}

const TableRowMemo = memo(({ row, columns, renderCell, renderActions, onSuccess, tableName }: any) => (
  <TableRow {...{ className: "group transition-colors hover:bg-muted/50" }}>
    {columns.map((col: any) => (
      <TableCell key={col.accessor} {...{ className: "px-4 py-0.5 whitespace-nowrap" }}>
        {renderCell(col.accessor, row, { onSuccess, tableName })}
      </TableCell>
    ))}
    {renderActions && (
      <TableCell {...{ className: "sticky right-0 text-right bg-background group-hover:bg-muted/100 shadow-left w-[1%] px-0 py-0 whitespace-nowrap" }}>
        {renderActions(row, onSuccess)}
      </TableCell>
    )}
  </TableRow>
))
TableRowMemo.displayName = "TableRowMemo"

export const SmartTable = memo(({ tableState, renderCell, renderActions, extraHeader, footer }: any) => {
  const { data, visibleColumns, sortBy, sortOrder, loading, isReady, handleSort, fetchData, getRowKey, tableName } = tableState
  const activeRenderCell = renderCell || defaultRenderCell
  const totalColsCount = visibleColumns.length + (renderActions ? 1 : 0)

  return (
    <div {...{ className: "relative w-full flex flex-col overflow-hidden" }}>
      {extraHeader && <div {...{ className: "flex-none mb-2" }}>{extraHeader}</div>}
      <div {...{ className: "relative flex-1 min-h-0 border border-border bg-card rounded-md shadow-sm overflow-hidden flex flex-col" }}>
        {loading && isReady && (
          <div {...{ className: "absolute inset-0 z-30 bg-card/50 backdrop-blur-[1px] flex items-center justify-center" }}>
            <div {...{ className: "flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full shadow-md" }}>
              <Spinner {...{ className: "w-3.5 h-3.5" }} />
              <span>Cargando datos...</span>
            </div>
          </div>
        )}
        <div {...{ className: "w-full overflow-auto max-h-full" }}>
          <Table {...{ className: "min-w-full" }}>
            <thead>
              <TableRow>
                {visibleColumns.map((col: any) => {
                  const isSorted = sortBy === col.accessor
                  const Icon = !isSorted ? ChevronsUpDown : sortOrder === "desc" ? ChevronDown : ChevronUp
                  return (
                    <TableHead key={col.accessor} {...{ className: "px-0 sticky top-0 bg-background z-10 shadow-sm whitespace-nowrap" }}>
                      {col.sortable !== false ? (
                        <SmartButton {...{ mode: "button", label: col.header, icons: [Icon], iconPosition: "right", variant: "ghost", onClick: () => handleSort(col.accessor), className: cn("text-muted-foreground/100 hover:text-foreground", isSorted && "text-primary opacity-100 font-medium") }} />
                      ) : (
                        <span {...{ className: "px-2 text-muted-foreground/80" }}>{col.header}</span>
                      )}
                    </TableHead>
                  )
                })}
                {renderActions && <TableHead {...{ className: "sticky top-0 right-0 z-20 text-right bg-background shadow-sm w-[1%] px-1" }} />}
              </TableRow>
            </thead>
            <TableBody>
              {!isReady || (loading && data.length === 0) ? (
                <TableRow>
                  <TableCell {...{ colSpan: Math.max(totalColsCount, 1), className: "h-40 text-center" }}>
                    <div {...{ className: "flex items-center justify-center gap-2 text-muted-foreground" }}>
                      <Spinner {...{ className: "w-4 h-4" }} />
                      <span>Cargando tabla...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell {...{ colSpan: Math.max(totalColsCount, 1), className: "h-32 text-center text-muted-foreground" }}>
                    No hay resultados disponibles.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row: any, index: number) => (
                  <TableRowMemo key={getRowKey(row, index)} {...{ row, columns: visibleColumns, renderCell: activeRenderCell, renderActions, onSuccess: fetchData, tableName }} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {footer && <div {...{ className: "flex-none pt-2" }}>{footer}</div>}
    </div>
  )
})
SmartTable.displayName = "SmartTable"