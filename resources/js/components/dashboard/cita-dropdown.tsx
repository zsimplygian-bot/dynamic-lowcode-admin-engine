import { useCallback } from "react"
import { Check, X } from "lucide-react"
import { SmartButton } from "@/components/smart-button"
import { useRouter } from "@/hooks/use-router"
import { AlertDropdown, AlertItem } from "@/components/alert-dropdown"
const CONFIRM_ATENDER  = { title: "Confirmar atención", description: "Esta acción marcará la cita como atendida." }
const CONFIRM_CANCELAR = { title: "Confirmar cancelación", description: "Esta acción cancelará la cita." }
interface Cita {
  id_cita: number
  mascota: string
  cliente: string
  motivo: string
  fecha: string
}
export default function CitasDropdown() {
  const { post } = useRouter()
  const handleAction = useCallback((id: number, action: "atender" | "cancelar", onRefresh: () => void) => async () => {
    await post(`/api/cita/${id}/${action}`)
    onRefresh()
  }, [post])
  const renderCita = useCallback((c: Cita, refresh: () => void) => {
    const fecha = c.fecha?.endsWith("00:00:00") ? c.fecha.split(" ")[0] : c.fecha
    return (
      <AlertItem key={c.id_cita} id={c.id_cita} title={c.mascota} subtitle={c.cliente} description={`${c.motivo} — ${fecha}`}
        tableName="cita" onSuccess={refresh} actions={
          <><SmartButton icon={Check} size="xs" buttonColor="green" tooltip="Atender" confirmation={CONFIRM_ATENDER} onClick={handleAction(c.id_cita, "atender", refresh)} />
            <SmartButton icon={X} size="xs" variant="destructive" tooltip="Cancelar" confirmation={CONFIRM_CANCELAR} onClick={handleAction(c.id_cita, "cancelar", refresh)} />
          </>
        }
      />
    )
  }, [handleAction])
  return ( <AlertDropdown<Cita> label="Citas próximas" tableName="cita" endpoint="/api/citas/proximas" emptyText="Sin citas próximas" renderItem={renderCita}
    />
  )
}