import { memo, useMemo, ReactNode } from "react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { AsyncState } from "@/components/async-state"
import { RecordCard } from "@/components/record-card"
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
export const ExtendedForm = memo(({ mode = "update", recordId, tableName = "", foreignKey = "", children, sectionTitle }: ExtendedFormProps) => {
  const isEditable = mode === "u" || mode === "s" || mode === "update" || mode === "store"
  const fkField = foreignKey.endsWith("_id") ? foreignKey : `${foreignKey}_id`
  const { data: colsRes } = useApi(`/schema/${tableName}/columns`, { select: (r: any) => r?.data ?? r })
  const { data: dataRes, isLoading, error, refetch } = useApi(`/table/${tableName}/data?${fkField}=${recordId}`)
  const columns = colsRes ?? []
  const listaRegistros = dataRes?.data ?? []
  const initialPayload = useMemo(() => ({ [fkField]: { value: recordId, disabled: true } }), [fkField, recordId])
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full text-left items-start overflow-y-auto overflow-x-hidden max-h-[75vh] pr-1">
      {children && <div className="w-full flex-1 shrink-0">{children}</div>}
      <div className="w-full flex-1 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle ?? ""}</h3>
          {isEditable && <NewRecordButton tableName={tableName} size="xs" initialValues={initialPayload} onSuccess={refetch} />}
        </div>
        <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[62vh] pr-1">
          <AsyncState isLoading={isLoading} error={error} onRetry={refetch} minHeight="min-h-[100px]">
            {listaRegistros.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg w-full">Sin registros</div>
            ) : (
              listaRegistros.map((item: any, i: number) => (
                <RecordCard key={item.id ?? i} item={item} tableName={tableName} columns={columns}
                  actions={isEditable && <ActionButtons row_id={item.id} tableName={tableName} size="xs" onSuccess={refetch} />}
                />
              ))
            )}
          </AsyncState>
        </div>
      </div>
    </div>
  )
})
ExtendedForm.displayName = "ExtendedForm"