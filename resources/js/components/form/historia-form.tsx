import { memo, useMemo } from "react"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { useApi } from "@/hooks/use-api"
export interface ActividadItem { id: number | string; item: string; titulo?: string; detalle?: string; precio?: number; fecha_dia: string; fecha: string; tabla?: string }
export interface HistoriaFormProps { mode?: string; recordId?: string | number; children: React.ReactNode; onSuccess?: (id?: any) => void; subtablas?: readonly string[]; sectionTitle?: string }
const DEFAULT_SUBTABLAS = ["historia_seguimiento", "historia_producto", "historia_procedimiento", "historia_anamnesis"] as const
export const HistoriaForm = memo(({ mode, recordId, children, onSuccess, subtablas = DEFAULT_SUBTABLAS, sectionTitle = "ACTIVIDADES" }: HistoriaFormProps) => {
  const isEditable = mode === "update"
  const endpoint = recordId ? `/api/historia/${recordId}/actividades` : null
  const { data: actividades, isLoading, refetch } = useApi<ActividadItem[]>(
    endpoint,
    { enabled: Boolean(recordId), initialData: undefined }
  )
  const initialPayload = useMemo(() => ({
    id_historia: { value: recordId, hidden: true }
  }), [recordId])
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
      <div className="w-full lg:w-[450px] shrink-0">{children}</div>
      <div className="w-full lg:w-[485px] shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle}</h3>
          {isEditable && recordId && (
            <div className="flex items-center gap-1.5">
              {subtablas.map((sub) => (
                <NewRecordButton key={sub} tableName={sub.startsWith("historia_") ? sub : `historia_${sub}`} size="xs" initialValues={initialPayload} onSuccess={handleCreated} />
              ))}
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-3 overflow-y-auto max-h-[62vh] pr-1">
          {!recordId ? (
            <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg">Guarda el registro para agregar actividades</div>
          ) : isLoading || actividades === undefined ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-20 bg-muted/50 rounded-xl" />
              </div>
            ))
          ) : grupos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-xs border rounded-lg">Sin registros</div>
          ) : (
            grupos.map(([fecha, items]) => (
              <div key={fecha} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground tracking-wide">{fecha}</span>
                {items.map((act) => {
                  const targetTable = act.tabla || `historia_${act.item.toLowerCase().replace(/s$/, "")}`
                  return (
                    <div key={act.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-xs text-foreground">{act.item}</span>
                        {isEditable && (
                          <ActionButtons row_id={act.id} tableName={targetTable} endpoint={`/crud/${targetTable}`} size="xs" initialValues={initialPayload} onSuccess={refetch} />
                        )}
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/40 border flex flex-col gap-0.5 text-xs">
                        {act.titulo && <div><span className="font-medium text-foreground">{act.item.slice(0, -1)}: </span><span className="text-muted-foreground uppercase">{act.titulo}</span></div>}
                        {act.detalle && <div><span className="font-medium text-foreground">Detalle: </span><span className="text-muted-foreground uppercase">{act.detalle}</span></div>}
                        {Boolean(act.precio && act.precio > 0) && <div><span className="font-medium text-foreground">Precio S/: </span><span className="text-muted-foreground font-semibold">{act.precio}</span></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
})