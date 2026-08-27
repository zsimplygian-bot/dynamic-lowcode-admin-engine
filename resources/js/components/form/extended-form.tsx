import { memo, useState, useEffect, useCallback, useMemo } from "react"
import axios from "axios"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"

export interface ActividadItem {
  id: number | string
  item: string
  titulo?: string
  detalle?: string
  precio?: number
  fecha_dia: string
  fecha: string
  tabla?: string
}

export interface ExtendedFormProps {
  mode?: string
  recordId?: string | number
  tableName?: string
  children: React.ReactNode
  onSuccess?: (id?: any) => void
  subtablas?: readonly string[]
  endpoint?: string
  foreignKey?: string
  sectionTitle?: string
}

const toSingularTableName = (item: string): string => {
  const clean = item.toLowerCase().trim()
  if (clean === "anamnesis") return clean
  return clean.endsWith("s") ? clean.slice(0, -1) : clean
}

export const ExtendedForm = memo(({
  mode,
  recordId,
  tableName = "",
  children,
  onSuccess,
  subtablas = ["seguimiento", "producto", "procedimiento", "anamnesis"],
  endpoint,
  foreignKey,
  sectionTitle = "ACTIVIDADES"
}: ExtendedFormProps) => {
  const [actividades, setActividades] = useState<ActividadItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const resolvedEndpoint = endpoint || (recordId && tableName ? `/api/${tableName}/${recordId}/actividades` : "")
  const resolvedForeignKey = foreignKey || (tableName ? `id_${tableName}` : "id_relacion")

  const fetchActividades = useCallback(async (signal?: AbortSignal) => {
    if (!resolvedEndpoint) return
    setLoading(true)
    try {
      const { data } = await axios.get(resolvedEndpoint, { signal })
      setActividades(data)
    } catch (error) {
      if (!axios.isCancel(error)) console.error("Error al cargar actividades:", error)
    } finally {
      setLoading(false)
    }
  }, [resolvedEndpoint])

  useEffect(() => {
    if (!resolvedEndpoint) return
    const controller = new AbortController()
    fetchActividades(controller.signal)
    return () => controller.abort()
  }, [resolvedEndpoint, fetchActividades])

  const handleRecordCreated = useCallback((data?: any) => {
    fetchActividades()
    onSuccess?.(data)
  }, [fetchActividades, onSuccess])

  const initialPayload = useMemo(() => ({ [resolvedForeignKey]: recordId }), [resolvedForeignKey, recordId])
  const prefix = useMemo(() => (tableName ? `${tableName}_` : ""), [tableName])

  const grupos = useMemo(() => {
    const map = new Map<string, ActividadItem[]>()
    for (const item of actividades) {
      const key = item.fecha_dia || "Sin fecha"
      const list = map.get(key)
      if (list) {
        list.push(item)
      } else {
        map.set(key, [item])
      }
    }
    return Array.from(map.entries())
  }, [actividades])

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full text-left items-start overflow-y-auto overflow-x-hidden max-h-[75vh] pr-1">
      <div className="w-full lg:w-[450px] shrink-0">{children}</div>
      {recordId && (
        <div className="w-full lg:w-[500px] shrink-0 flex flex-col gap-3 rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between pb-1 border-b">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">{sectionTitle}</h3>
            {mode === "update" && (
              <div className="flex items-center gap-1.5">
                {subtablas.map((sub) => (
                  <NewRecordButton key={sub} {...{ tableName: `${prefix}${sub}`, size: "xs", initialValues: initialPayload, onSuccess: handleRecordCreated }} />
                ))}
              </div>
            )}
          </div>
          <div className="w-full flex flex-col gap-3 overflow-y-auto max-h-[62vh] pr-1">
            {loading ? (
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
                    const targetTable = act.tabla || `${prefix}${toSingularTableName(act.item)}`
                    return (
                      <div key={act.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between px-1">
                          <span className="font-semibold text-xs text-foreground">{act.item}</span>
                          <ActionButtons {...{ row_id: act.id, tableName: targetTable, size: "xs", initialValues: initialPayload, onSuccess: fetchActividades }} />
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border flex flex-col gap-0.5 text-xs">
                          {act.titulo && <div><span className="font-medium text-foreground">{act.item.slice(0, -1)}: </span><span className="text-muted-foreground uppercase">{act.titulo}</span></div>}
                          {act.detalle && <div><span className="font-medium text-foreground">Detalle: </span><span className="text-muted-foreground uppercase">{act.detalle}</span></div>}
                          {act.precio !== undefined && act.precio > 0 && <div><span className="font-medium text-foreground">Precio S/: </span><span className="text-muted-foreground font-semibold">{act.precio}</span></div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
})
ExtendedForm.displayName = "ExtendedForm"