import { memo, useCallback, ReactNode } from "react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { CellFormatter } from "@/components/datatable/cell-formatter"
import { useApi } from "@/hooks/use-api"

export interface ExtendedFormProps<T = Record<string, any>> {
  mode?: string
  recordId?: string | number
  tableName?: string
  foreignKey?: string
  children?: ReactNode
  onSuccess?: (id?: any) => void
  endpoint?: string
  sectionTitle?: string
  titleKey?: keyof T | string
  renderDetails?: (item: T) => ReactNode
}

interface ColumnMeta {
  accessor: string
  header: string
  hidden?: boolean | string
  type?: string
}

interface ApiResponse<T> {
  columns: ColumnMeta[]
  data: T[]
}

const RecordCard = memo(({ item, isEditable, tableName, resolvedTitleKey, columns, initialPayload, fetchRegistros, renderDetails }: any) => {
  const itemTitle = item[tableName] ?? item[resolvedTitleKey] ?? item.titulo ?? item.nombre ?? item.item ?? ""

  const visibleColumns = Array.isArray(columns)
    ? columns.filter((c: ColumnMeta) => {
        if (c.hidden === true) return false
        const val = item?.[c.accessor]
        return val !== null && val !== undefined && val !== ""
      })
    : []

  return (
    <div className="p-3 rounded-2xl bg-muted/40 border flex flex-col gap-1.5 w-full text-xs">
      <div className="flex items-center justify-between w-full">
        <span className="font-bold text-sm text-foreground tracking-tight">{String(itemTitle)}</span>
        {isEditable && <ActionButtons row_id={item.id ?? item[`id_${tableName}`]} tableName={item.tabla ?? tableName} size="xs" initialValues={initialPayload} onSuccess={fetchRegistros} />}
      </div>

      {renderDetails ? renderDetails(item) : visibleColumns.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground uppercase text-[11px]">
          {visibleColumns.map(({ accessor, header, type }: ColumnMeta, index: number) => (
            <span key={accessor} className="inline-flex items-center gap-1">
              <span className="font-medium opacity-70">{header}:</span>
              <span className="font-semibold text-foreground"><CellFormatter accessor={accessor} row={item} type={type} tableName={tableName} /></span>
              {index < visibleColumns.length - 1 && <span className="ml-1 opacity-30">•</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
RecordCard.displayName = "RecordCard"

export const ExtendedForm = memo(<T extends Record<string, any> = Record<string, any>>({
  mode = "update", recordId, tableName = "", foreignKey = "", children, onSuccess, endpoint, sectionTitle, titleKey = "titulo", renderDetails,
}: ExtendedFormProps<T>) => {
  const isEditable = mode === "update" || mode === "store"
  const resolvedForeignKey = `id_${foreignKey || "cliente"}`
  const resolvedEndpoint = endpoint || (recordId && tableName ? `/tables/${tableName}/actividades?${resolvedForeignKey}=${recordId}` : null)

  const { data: response, isLoading, refetch: fetchRegistros } = useApi<ApiResponse<T>>(resolvedEndpoint, {
    enabled: Boolean(recordId && resolvedEndpoint),
    select: (resData: any) => resData,
  })

  const handleRecordCreated = useCallback((data?: any) => {
    fetchRegistros()
    onSuccess?.(data)
  }, [fetchRegistros, onSuccess])

  const isInitialLoading = isLoading || (Boolean(resolvedEndpoint) && response === undefined)
  const columns = Array.isArray(response) ? [] : response?.columns ?? []
  const listaRegistros = Array.isArray(response) ? response : response?.data ?? []
  const initialPayload = { [resolvedForeignKey]: recordId }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full text-left items-start overflow-y-auto overflow-x-hidden max-h-[75vh] pr-1">
      {children && <div className="w-full flex-1 shrink-0">{children}</div>}

      {recordId && (
        <div className="w-full flex-1 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle ?? ""}</h3>
            {isEditable && <NewRecordButton tableName={tableName} size="xs" initialValues={initialPayload} onSuccess={handleRecordCreated} />}
          </div>

          <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[62vh] pr-1">
            {isInitialLoading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="animate-pulse h-14 bg-muted/50 rounded-xl w-full" />)
            ) : listaRegistros.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg w-full">Sin registros</div>
            ) : (
              listaRegistros.map((item: any, index: number) => (
                <RecordCard key={item.id ?? item[`id_${tableName}`] ?? index} item={item} isEditable={isEditable} tableName={tableName} columns={columns} 
                resolvedTitleKey={titleKey} initialPayload={initialPayload} fetchRegistros={fetchRegistros} renderDetails={renderDetails} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}) as <T extends Record<string, any> = Record<string, any>>(props: ExtendedFormProps<T>) => JSX.Element

;(ExtendedForm as any).displayName = "ExtendedForm"