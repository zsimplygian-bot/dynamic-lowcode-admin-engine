import { memo, ReactNode } from "react"
import { CellFormatter } from "@/components/datatable/cell-formatter"
export interface ColumnMeta {
  accessor: string
  header: string
  hidden?: boolean | string
  type?: string
}
interface RecordCardProps {
  item: any
  tableName: string
  columns: ColumnMeta[]
  actions?: ReactNode
}
export const RecordCard = memo(({ item, tableName, columns, actions }: RecordCardProps) => {
  const itemTitle = item[tableName]
  const itemId = item[`id_${tableName}`]
  const visibleColumns = Array.isArray(columns) ? columns.filter((c) => !c.hidden) : []
  return (
    <div className="p-3 rounded-2xl bg-muted/40 border flex flex-col gap-1.5 w-full text-xs">
      <div className="flex items-center justify-between w-full">
        <span className="font-bold text-sm text-foreground tracking-tight">{String(itemTitle)}</span>
        {actions}
      </div>
      {visibleColumns.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground uppercase text-[11px]">
          {visibleColumns.map(({ accessor, header, type }: ColumnMeta, index: number) => (
            <span key={accessor} className="inline-flex items-center gap-1">
              <span className="font-medium opacity-90">{header}:</span>
              <span className="font-semibold text-foreground">
                <CellFormatter accessor={accessor} row={item} rowId={itemId} type={type} tableName={tableName} />
              </span>
              {index < visibleColumns.length - 1 && <span className="ml-1 opacity-30">•</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
RecordCard.displayName = "RecordCard"