import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { SmartDropdown } from "@/components/smart-dropdown"
import { AsyncState } from "@/components/async-state"
import { cn } from "@/lib/utils"

export interface SmartTableProps {
  data: any[]; columns: any[]; sort?: { column?: string; order?: "asc" | "desc" };
  onSort: (k: string, order: "asc" | "desc") => void; onHideColumn: (k: string) => void;
  loading?: boolean; error?: any; onRetry?: () => void; readOnly?: boolean;
  selectedIds: (string | number)[]; onToggle: (id?: string | number) => void;
  emptyMessage?: string; // <-- Mensaje personalizado cuando no hay datos
  renderCell: (acc: string, row: any, type?: string) => React.ReactNode;
  renderActions?: (row: any, id: string | number) => React.ReactNode;
}

function SelectionCell({ isHeader, checked, data = [], selectedIds = [], onChange }: any) {
  const Tag = isHeader ? TableHead : TableCell
  const isAllSelected = data.length > 0 && selectedIds.length === data.length
  const status = isHeader ? (isAllSelected ? true : selectedIds.length > 0 ? "indeterminate" : false) : checked
  return (
    <Tag className={cn(isHeader && "bg-background")}>
      <div className="flex justify-center"><Checkbox checked={status} onCheckedChange={onChange} /></div>
    </Tag>
  )
}

export function SmartTable({
  data, columns, sort, onSort, onHideColumn, loading, error, onRetry,
  readOnly = false, selectedIds, onToggle, emptyMessage, renderCell, renderActions
}: SmartTableProps) {
  const hasSelection = !readOnly
  const hasActions = !readOnly && Boolean(renderActions)
  const totalCols = columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0)

  if ((!columns.length || !data.length) && (loading || error)) {
    return (
      <div className="relative flex-1 min-h-0 border bg-card rounded-md overflow-hidden flex items-center justify-center">
        <AsyncState isLoading={!!loading} error={error} onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div className={cn("relative flex-1 min-h-0 border bg-card rounded-md overflow-hidden flex flex-col transition-opacity", loading && "opacity-80")}>
      <div className="w-full overflow-auto flex-1">
        <Table className="min-w-full">
          <thead>
            <TableRow>
              {hasSelection ? <SelectionCell isHeader data={data} selectedIds={selectedIds} onChange={() => onToggle()} /> : null}
              {columns.map((col) => {
                const isSorted = sort?.column === col.accessor
                const icon = !isSorted ? "chevrons-up-down" : sort?.order === "desc" ? "chevron-down" : "chevron-up"
                return (
                  <TableHead key={col.accessor} className="px-1 bg-background">
                    <SmartDropdown
                      buttonLabel={col.header} icon={icon} iconPosition="right" size="sm" variant="ghost" closeOnSelect
                      items={[
                        { label: "Asc", icon: "arrow-up", action: () => onSort(col.accessor, "asc") },
                        { label: "Desc", icon: "arrow-down", action: () => onSort(col.accessor, "desc") },
                        "-",
                        { label: "Ocultar", icon: "eye-off", action: () => onHideColumn(col.accessor) },
                      ]}
                    />
                  </TableHead>
                )
              })}
              {hasActions ? <TableHead className="sticky bg-background w-[1%]" /> : null}
            </TableRow>
          </thead>
          <TableBody>
            {!data.length ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalCols} className="h-32 text-center text-sm text-muted-foreground">
                  {emptyMessage ?? "No results."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isSelected = selectedIds.includes(row.id)
                return (
                  <TableRow key={row.id} className={cn("hover:bg-muted/50", isSelected && "bg-muted/30")}>
                    {hasSelection ? <SelectionCell checked={isSelected} onChange={() => onToggle(row.id)} /> : null}
                    {columns.map((c) => (
                      <TableCell key={c.accessor} className="px-4 py-0.5 whitespace-nowrap">
                        {renderCell(c.accessor, row, c.type)}
                      </TableCell>
                    ))}
                    {hasActions ? (
                      <TableCell className="sticky right-0 bg-background w-[1%] px-0 py-0">
                        {renderActions!(row, row.id)}
                      </TableCell>
                    ) : null}
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
export default SmartTable