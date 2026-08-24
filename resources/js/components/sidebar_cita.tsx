import { memo, useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { router } from "@inertiajs/react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { Bell, Check, X } from "lucide-react"
import { toast } from "sonner"
import { NewRecordButton } from "@/components/new-record-button"
import { ActionButtons } from "@/components/action-buttons"
import { SmartButton } from "@/components/smart-button"

const CONFIRM_ATENDER = { title: "Confirmar atención", description: "Esta acción marcará la cita como atendida." }
const CONFIRM_CANCELAR = { title: "Confirmar cancelación", description: "Esta acción cancelará la cita." }

const CitaItem = memo(({ cita, onRefresh }: { cita: any; onRefresh: () => void }) => {
  const handleContainerClick = useCallback((e: React.MouseEvent) => { e.stopPropagation() }, [])
  const handleAction = useCallback((id: number, action: "atender" | "cancelar") => () => {
    return new Promise<void>((resolve, reject) => {
      router.post(`/api/cita/${id}/${action}`, {}, { preserveScroll: true, onSuccess: () => { onRefresh(); resolve() }, onError: reject
      })
    })
  }, [onRefresh])
  const fechaFormateada = useMemo(() => ( cita.fecha?.endsWith("00:00:00") ? cita.fecha.split(" ")[0] : cita.fecha ), [cita.fecha])

  return (
    <div {...{ className: "flex items-center justify-between gap-2 px-2 py-2 select-none", onClick: handleContainerClick }}>
      <div {...{ className: "flex-1 min-w-0" }}>
        <div {...{ className: "flex items-center gap-2 text-sm font-medium" }}>
          <Bell {...{ className: "w-4 h-4 text-blue-500 shrink-0" }} /> <span {...{ className: "truncate" }}>{cita.mascota}</span>
          <span {...{ className: "text-xs text-muted-foreground truncate" }}>{cita.cliente}</span>
        </div>
        <div {...{ className: "text-xs  truncate" }}>
          {cita.motivo} — {fechaFormateada}
        </div>
      </div>
      <div {...{ className: "flex items-center gap-1 shrink-0" }}>
        <SmartButton {...{
          icon: Check, size: "xs", buttonColor: "green", tooltip: "Atender", confirmation: CONFIRM_ATENDER, onClick: handleAction(cita.id_cita, "atender")
        }} />
        <SmartButton {...{
          icon: X, size: "xs", variant: "destructive", tooltip: "Cancelar", confirmation: CONFIRM_CANCELAR, onClick: handleAction(cita.id_cita, "cancelar")
        }} />
        <ActionButtons {...{ row_id: cita.id_cita, tableName: "cita", onSuccess: onRefresh, size: "sm" }} />
      </div>
    </div>
  )
})
CitaItem.displayName = "CitaItem"

const EmptyState = memo(() => ( <div {...{ className: "px-2 py-1 text-xs text-muted-foreground" }}> Sin citas próximas </div> ))
EmptyState.displayName = "EmptyState"

export default function CitasDropdown() {
  const [citas, setCitas] = useState<any[]>([])

  const fetchCitas = useCallback(() => {
    axios.get("/api/citas/proximas")
      .then(r => setCitas(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("No se pudieron cargar las citas"))
  }, [])

  useEffect(() => { fetchCitas() }, [fetchCitas])

  const items = useMemo(() => (
    citas.length ? citas.map(c => ({ custom: <CitaItem key={c.id_cita} {...{ cita: c, onRefresh: fetchCitas }} /> })) : [{ custom: <EmptyState /> }]
    ), [citas, fetchCitas])

  return (
    <SmartDropdown {...{
      label: "Citas próximas", labelExtra: <NewRecordButton {...{ tableName: "cita", onSuccess: fetchCitas, size: "xs" }} />, icon: Bell, variant: "ghost",
      badge: citas.length || undefined, badgeClassName: "bg-red-700 text-white", closeOnSelect: false, itemsMaxHeight: 500, items
    }} />
  )
}