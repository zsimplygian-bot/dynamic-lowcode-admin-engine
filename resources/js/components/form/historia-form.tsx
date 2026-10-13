import { memo, useMemo, ReactNode } from "react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { AsyncState } from "@/components/async-state"
import { useApi } from "@/hooks/use-api"
import { ActionMode } from "@/lib/action-modes"

export interface ActividadItem {
  id: number | string
  item: string
  titulo?: string
  detalle?: string
  precio?: number
  fecha_dia: string
  fecha: string
  tabla: string
}

export interface HistoriaFormProps {
  mode?: ActionMode
  recordId?: string | number
  form: ReactNode
  onSuccess?: (id?: any) => void
  subtablas?: readonly string[]
  sectionTitle?: string
}

const DEFAULT_SUBTABLAS = ["historia_seguimiento", "historia_producto", "historia_procedimiento", "historia_anamnesis"] as const

export const HistoriaForm = memo(({ mode, recordId, form, onSuccess, subtablas = DEFAULT_SUBTABLAS, sectionTitle = "ACTIVIDADES" }: HistoriaFormProps) => {
  const isEditable = mode === "u"
  const { data: actividades, isLoading, error, refetch } = useApi<ActividadItem[]>(
    recordId ? `/api/historia/${recordId}/actividades` : null,
    { enabled: Boolean(recordId) }
  )

  const initialPayload = useMemo(() => ({ historia_id: { value: recordId, disabled: true } }), [recordId])

  const handleCreated = (data?: any) => {
    refetch()
    onSuccess?.(data)
  }

  const grupos = useMemo(() => {
    if (!actividades?.length) return []
    const map = new Map<string, ActividadItem[]>()
    for (const item of actividades) {
      const key = item.fecha_dia || "Sin fecha"
      const list = map.get(key)
      if (list) list.push(item)
      else map.set(key, [item])
    }
    return Array.from(map.entries())
  }, [actividades])

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full text-left items-start overflow-y-auto overflow-x-hidden max-h-[75vh]">
      <div className="w-full lg:w-[450px] shrink-0">{form}</div>
      <div className="w-full lg:w-[485px] shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle}</h3>
          {isEditable && recordId && (
            <div className="flex items-center gap-1.5">
              {subtablas.map((sub) => (
                <NewRecordButton key={sub} tableName={sub} size="xs" initialValues={initialPayload} onSuccess={handleCreated} />
              ))}
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-3 overflow-y-auto max-h-[62vh] pr-1">
          {!recordId ? (
            <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg">Guarda el registro para agregar actividades</div>
          ) : (
            <AsyncState isLoading={isLoading} error={error} onRetry={refetch} minHeight="min-h-[100px]">
              {grupos.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg">Sin registros</div>
              ) : (
                grupos.map(([fecha, items]) => (
                  <div key={fecha} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wide">{fecha}</span>
                    {items.map((act) => {
                      const fields = [
                        act.titulo && { label: act.item.slice(0, -1), value: act.titulo },
                        act.detalle && { label: "Detalle", value: act.detalle },
                        Boolean(act.precio) && { label: "Precio S/", value: `S/ ${act.precio}` }
                      ].filter(Boolean) as { label: string; value: string }[]

                      return (
                        <div key={act.id} className="p-3 rounded-2xl bg-muted/40 border flex flex-col gap-1.5 w-full text-xs">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm text-foreground tracking-tight">{act.item}</span>
                            {isEditable && (
                              <ActionButtons row_id={act.id} tableName={act.tabla} endpoint={`/crud/${act.tabla}`} size="xs" onSuccess={refetch} />
                            )}
                          </div>
                          {fields.length > 0 && (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground uppercase text-[11px]">
                              {fields.map(({ label, value }, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                  <span className="font-medium opacity-90">{label}:</span>
                                  <span className="font-semibold text-foreground">{value}</span>
                                  {idx < fields.length - 1 && <span className="ml-1 opacity-30">•</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </AsyncState>
          )}
        </div>
      </div>
    </div>
  )
})
HistoriaForm.displayName = "HistoriaForm"