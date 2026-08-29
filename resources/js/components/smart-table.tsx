import { memo, useState, useEffect, useRef } from "react"
import { Table, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, Loader2 } from "lucide-react"
import { SmartButton } from "@/components/smart-button"
import { cn } from "@/lib/utils"

const ROW_HEIGHT = 33
const OVERSCAN = 20 // Ampliado para absorber scrolls o arrastres ultra rápidos

const defaultRenderCell = (accessor: string, row: any) => row[accessor] ?? ""

const TableStatus = memo(({ icon: Icon, text, colSpan, isError }: any) => (
  <TableRow>
    <TableCell colSpan={Math.max(colSpan, 1)} className="h-32 text-center text-muted-foreground">
      <div className={cn("flex items-center justify-center gap-2", isError && "text-destructive font-medium")}>
        {Icon && <Icon className="w-4 h-4 animate-spin text-primary" />}
        <span>{text}</span>
      </div>
    </TableCell>
  </TableRow>
))
TableStatus.displayName = "TableStatus"

const TableRowMemo = memo(
  ({ row, columns, renderCell, renderActions }: any) => (
    <TableRow className="group transition-colors hover:bg-muted/50 h-[33px]">
      {columns.map((col: any) => (
        <TableCell key={col.accessor} className="px-4 py-0.5 whitespace-nowrap">
          {renderCell(col.accessor, row)}
        </TableCell>
      ))}
      {renderActions && (
        <TableCell className="sticky right-0 text-right bg-background group-hover:bg-muted/100 shadow-left w-[1%] px-0 py-0 whitespace-nowrap">
          {renderActions(row)}
        </TableCell>
      )}
    </TableRow>
  ),
  (prev, next) => prev.row === next.row && prev.columns === next.columns
)
TableRowMemo.displayName = "TableRowMemo"

export const SmartTable = memo(({ tableState, renderCell, renderActions }: any) => {
  const { data, visibleColumns, sortBy, sortOrder, loading, isReady, error, handleSort, getRowKey } = tableState
  const activeRenderCell = renderCell || defaultRenderCell
  const totalCols = visibleColumns.length + (renderActions ? 1 : 0)
  const totalRows = data?.length || 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ scrollTop: 0, height: 600 })

  // 1. Unificamos Scroll Listener pasivo + ResizeObserver en un solo Hook compacto
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let frameId: number
    const onScroll = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => setViewport((v) => ({ ...v, scrollTop: el.scrollTop })))
    }

    const observer = new ResizeObserver(([entry]) => setViewport((v) => ({ ...v, height: entry.contentRect.height })))
    observer.observe(el)
    el.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      el.removeEventListener("scroll", onScroll)
    }
  }, [])

  // 2. Reseteo inmediato del scroll al reordenar
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [sortBy, sortOrder])

  // 3. Cálculos de ventana de filas
  const startIndex = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(totalRows, Math.ceil((viewport.scrollTop + viewport.height) / ROW_HEIGHT) + OVERSCAN)

  const visibleRows = data ? data.slice(startIndex, endIndex) : []
  const paddingTop = startIndex * ROW_HEIGHT
  const paddingBottom = (totalRows - endIndex) * ROW_HEIGHT

  return (
    <div className="relative flex-1 min-h-0 border border-border bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
      <div ref={scrollRef} className="w-full overflow-auto max-h-full">
        <Table className="min-w-full">
          <thead>
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
          </thead>
          <TableBody>
            {loading && (!data || data.length === 0) || (!isReady && !error) ? (
              <TableStatus colSpan={totalCols} icon={Loader2} text="Cargando información..." />
            ) : error ? (
              <TableStatus colSpan={totalCols} icon={AlertCircle} text="No se pudo obtener una respuesta válida del servidor." isError />
            ) : totalRows === 0 ? (
              <TableStatus colSpan={totalCols} text="No hay resultados disponibles." />
            ) : (
              <>
                {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }}><td colSpan={totalCols} className="p-0" /></tr>}
                {visibleRows.map((row: any, i: number) => (
                  <TableRowMemo key={getRowKey(row, startIndex + i)} row={row} columns={visibleColumns} renderCell={activeRenderCell} renderActions={renderActions} />
                ))}
                {paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }}><td colSpan={totalCols} className="p-0" /></tr>}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})

SmartTable.displayName = "SmartTable"