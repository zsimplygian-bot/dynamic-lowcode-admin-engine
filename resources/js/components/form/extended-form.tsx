import { memo, useMemo, ReactNode } from "react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { AsyncState } from "@/components/async-state"
import { RecordCard, ColumnMeta } from "@/components/record-card"
import { useApi } from "@/hooks/use-api"
export interface ExtendedFormProps {
  mode?: string
  recordId?: string | number
  tableName?: string
  foreignKey?: string
  children?: ReactNode
  onSuccess?: () => void
  sectionTitle?: string
}
interface ApiResponse<T> {
  columns: ColumnMeta[]
  data: T[]
}
export const ExtendedForm = memo(({ mode = "update", recordId, tableName = "", foreignKey = "", children, onSuccess, sectionTitle }: ExtendedFormProps) => {
  const isEditable = mode === "update" || mode === "store"
  const resolvedForeignKey = `id_${foreignKey}`
  const endpoint = recordId && tableName ? `/tables/${tableName}/actividades?${resolvedForeignKey}=${recordId}` : null
  const { data: response, isLoading, error, refetch: fetchRegistros } = useApi<ApiResponse<any>>(endpoint)
  const columns = response?.columns ?? []
  const listaRegistros = response?.data ?? []
    const initialPayload = useMemo(() => ({
  [resolvedForeignKey]: { value: recordId, disabled: true }
}), [resolvedForeignKey, recordId])
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full text-left items-start overflow-y-auto overflow-x-hidden max-h-[75vh] pr-1">
      {children && <div className="w-full flex-1 shrink-0">{children}</div>}
      {recordId && (
        <div className="w-full flex-1 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle ?? ""}</h3>
            {isEditable && <NewRecordButton tableName={tableName} size="xs" initialValues={initialPayload} onSuccess={fetchRegistros} />}
          </div>
          <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[62vh] pr-1">
            <AsyncState isLoading={isLoading} error={error} onRetry={fetchRegistros} minHeight="min-h-[100px]">
              {listaRegistros.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg w-full">Sin registros</div>
              ) : (
                listaRegistros.map((item: any, index: number) => {
                  const itemId = item[`id_${tableName}`]
                  return (
                    <RecordCard key={itemId ?? index} item={item} tableName={tableName} columns={columns}
                      actions={ isEditable && ( <ActionButtons row_id={itemId} tableName={tableName} size="xs" onSuccess={fetchRegistros} /> )
                      }
                    />
                  )
                })
              )}
            </AsyncState>
          </div>
        </div>
      )}
    </div>
  )
})
ExtendedForm.displayName = "ExtendedForm"