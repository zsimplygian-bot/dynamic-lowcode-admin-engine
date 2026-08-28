import { useCallback } from "react"
import { Bell, Check, X } from "lucide-react"
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

  const renderCita = useCallback((cita: Cita, refresh: () => void) => {
    const fechaFormateada = cita.fecha?.endsWith("00:00:00") ? cita.fecha.split(" ")[0] : cita.fecha

    return (
      <AlertItem
        key={cita.id_cita}
        {...{
          id: cita.id_cita,
          icon: Bell,
          title: cita.mascota,
          subtitle: cita.cliente,
          description: `${cita.motivo} — ${fechaFormateada}`,
          tableName: "cita",
          onSuccess: refresh,
          actions: (
            <>
              <SmartButton {...{ icon: Check, size: "xs", buttonColor: "green", tooltip: "Atender", confirmation: CONFIRM_ATENDER, onClick: handleAction(cita.id_cita, "atender", refresh) }} />
              <SmartButton {...{ icon: X, size: "xs", variant: "destructive", tooltip: "Cancelar", confirmation: CONFIRM_CANCELAR, onClick: handleAction(cita.id_cita, "cancelar", refresh) }} />
            </>
          ),
        }}
      />
    )
  }, [handleAction])

  return (
    <AlertDropdown<Cita>
      {...{
        label: "Citas próximas",
        icon: Bell,
        tableName: "cita",
        endpoint: "/api/citas/proximas",
        emptyText: "Sin citas próximas",
        renderItem: renderCita,
      }}
    />
  )
}