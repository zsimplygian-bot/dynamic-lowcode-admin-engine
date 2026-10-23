import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { SmartDropdown } from "@/components/smart-dropdown"
import { AsyncState } from "@/components/async-state"
import { cn } from "@/lib/utils"
export interface SmartTableProps {
  data: any[]
  columns: any[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort: (k: string, order: "asc" | "desc") => void
  onHideColumn: (k: string) => void
  loading?: boolean
  error?: any
  onRetry?: () => void
  readOnly?: boolean
  selectable?: boolean
  selectedIds: (string | number)[]
  onToggleRow: (id: string | number) => void
  onToggleAll: () => void
  renderCell: (acc: string, row: any, type?: string) => React.ReactNode
  renderActions?: (row: any, id: string | number) => React.ReactNode
}
function SelectionCell({ isHeader, checked, onChange }: { isHeader?: boolean; checked: boolean | "indeterminate"; onChange: () => void }) {
  const Tag = isHeader ? TableHead : TableCell
  return (
    <Tag className="w-8 px-2 py-0 sticky top-0 bg-background z-10 shadow-sm text-center">
      <div className="flex items-center justify-center"> <Checkbox checked={checked} onCheckedChange={onChange} /> </div>
    </Tag>
  )
}
export function SmartTable({
  data, columns, sortBy, sortOrder, onSort, onHideColumn, loading, error, onRetry,
  readOnly = false, selectable = true, selectedIds,
  onToggleRow, onToggleAll, renderCell, renderActions,
}: SmartTableProps) {
  const hasActions = !readOnly && Boolean(renderActions)
  const isBodyState = Boolean((loading && !data.length) || error)
  const totalCols = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)
  if (!columns.length && isBodyState) {
    return (
      <div className="relative flex-1 min-h-0 border bg-card rounded-md shadow-sm overflow-hidden flex items-center justify-center p-8">
        <AsyncState isLoading={Boolean(loading)} error={error} loadingLabel="Cargando información..." onRetry={onRetry} minHeight="min-h-[140px]" />
      </div>
    )
  }
  const isAllSelected = data.length > 0 && selectedIds.length === data.length
  const headerChecked = isAllSelected ? true : selectedIds.length > 0 ? "indeterminate" : false
  return (
    <div className="relative flex-1 min-h-0 border bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
      <div className="w-full overflow-auto flex-1">
        <Table className="min-w-full">
          <thead>
            <TableRow>
              {selectable && <SelectionCell isHeader checked={headerChecked} onChange={onToggleAll} />}
              {columns.map((col) => {
                const isSorted = sortBy === col.accessor
                return (
                  <TableHead key={col.accessor} className="px-1 sticky top-0 bg-background z-10 shadow-sm whitespace-nowrap text-left">
                    <SmartDropdown buttonLabel={col.header} icon={!isSorted ? "chevrons-up-down" : sortOrder === "desc" ? "chevron-down" : "chevron-up"} iconPosition="right" size="sm"
                      variant="ghost" closeOnSelect className={cn(isSorted && "text-primary font-medium")}
                      items={[{ label: "Asc", icon: "arrow-up", action: () => onSort(col.accessor, "asc") },
                              { label: "Desc", icon: "arrow-down", action: () => onSort(col.accessor, "desc") },
                        "-", { label: "Ocultar", icon: "eye-off", action: () => onHideColumn(col.accessor) }
                      ]} />
                  </TableHead>
                )
              })}
              {hasActions && <TableHead className="sticky top-0 right-0 z-20 text-right bg-background shadow-sm w-[1%] px-1" />}
            </TableRow>
          </thead>
          <TableBody>
            {isBodyState ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalCols} className="p-4 h-40">
                  <div className="sticky left-0 w-full flex justify-center">
                    <AsyncState isLoading={Boolean(loading)} error={error} loadingLabel="Cargando información..." onRetry={onRetry} minHeight="min-h-0" />
                  </div>
                </TableCell>
              </TableRow>
            ) : !data.length ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalCols} className="h-32 text-center text-sm text-muted-foreground"> No hay resultados disponibles. </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isSelected = selectedIds.includes(row.id)
                return (
                  <TableRow key={row.id} className={cn("group hover:bg-muted/50 h-[33px]", isSelected && "bg-muted/30")}>
                    {selectable && <SelectionCell checked={isSelected} onChange={() => onToggleRow(row.id)} />}
                    {columns.map((c) => (
                      <TableCell key={c.accessor} className="px-4 py-0.5 whitespace-nowrap">
                        {renderCell(c.accessor, row, c.type)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell className="sticky right-0 text-right bg-background group-hover:bg-muted shadow-left w-[1%] px-0 py-0 whitespace-nowrap">
                        {renderActions!(row, row.id)}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}