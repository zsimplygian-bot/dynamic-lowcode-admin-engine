import { memo, useState } from "react"
import { CopyIcon, EyeIcon, EditIcon, TrashIcon, MoreVertical, PrinterIcon } from "lucide-react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { ExtendedForm } from "@/components/form/extended-form"
interface ActionButtonsProps {
  row_id?: string | number
  tableName?: string
  endpoint?: string
  updateEndpoint?: string
  deleteEndpoint?: string
  fields?: any[]
  initialValues?: Record<string, any>
  onSuccess?: (id?: any) => void
  size?: "xs" | "sm" | "md" | "lg"
  [key: string]: any
}
const DeleteWarning = () => (
  <div className="p-2 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-left">
    ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
  </div>
)
const ACTIONS: Record<ActionMode, { label: string; icon: any; color: string; prefix: string; description: React.ReactNode }> = {
  info: { label: "Detalle", icon: EyeIcon, color: "text-blue-500", prefix: "DETALLE", description: "Consulta los datos del registro." },
  update: { label: "Editar", icon: EditIcon, color: "text-green-500", prefix: "EDITAR", description: "Actualiza los datos del registro." },
  delete: { label: "Eliminar", icon: TrashIcon, color: "text-red-500", prefix: "ELIMINAR", description: <DeleteWarning /> }
}
const getEndpoint = (m: ActionMode, id?: string | number, base?: string, up?: string, del?: string) => {
  const url = (m === "update" ? up : m === "delete" ? del : undefined) || base
  return url && id !== undefined ? `${url}/${id}` : url
}
export const ActionButtons = memo(({ row_id, tableName = "registro", endpoint = `/crud/${tableName}`, updateEndpoint, deleteEndpoint, fields, initialValues, onSuccess, size = "md", ...props }: ActionButtonsProps) => {
  const [action, setAction] = useState<ActionMode | null>(null)
  const resolvedId = row_id ?? initialValues?.id ?? (tableName ? initialValues?.[`id_${tableName.toLowerCase().trim()}`] : undefined)
  const isHistoria = tableName?.toLowerCase().trim() === "historia"
  const isHistoriaExtended = isHistoria && action !== null
  const dropdownItems = [
    { key: "copy", label: "Copiar ID", icon: CopyIcon, action: () => { if (resolvedId) { navigator.clipboard.writeText(String(resolvedId)); toast.success("ID copiado") } } },
    { key: "info", label: ACTIONS.info.label, icon: ACTIONS.info.icon, color: ACTIONS.info.color, action: () => setAction("info") },
    ...(isHistoria ? [{ key: "print", label: "Imprimir", icon: PrinterIcon, color: "text-sky-500", action: () => { if (resolvedId) window.open(`/historia/${resolvedId}/pdf`, "_blank") } }] : []),
    { key: "update", label: ACTIONS.update.label, icon: ACTIONS.update.icon, color: ACTIONS.update.color, action: () => setAction("update") },
    { key: "delete", label: ACTIONS.delete.label, icon: ACTIONS.delete.icon, color: ACTIONS.delete.color, action: () => setAction("delete") }
  ]
  const activeConfig = action ? ACTIONS[action] : null
  const modalTitle = activeConfig ? `${activeConfig.prefix} ${tableName.toUpperCase()}` : ""
  return (
    <div className="flex items-center gap-1">
      <SmartDropdown {...{ label: "Acciones", icon: MoreVertical, variant: "ghost", items: dropdownItems, size, ...props }} />
      {action && activeConfig && (
        <SmartModal {...{ open: true, onOpenChange: (o) => { if (!o) setAction(null) }, title: modalTitle, description: activeConfig.description, size: isHistoriaExtended ? "max-w-[95vw] lg:max-w-5xl w-full" : "md" }}>
          {({ close }) => {
            const formElement = (
              <DynamicForm {...{ mode: action, recordId: resolvedId, endpoint: getEndpoint(action, resolvedId, endpoint, updateEndpoint, deleteEndpoint), tableName, fields, initialValues, onSuccess: (id: any) => { onSuccess?.(id); close() } }} />
            )
            return isHistoriaExtended ? (
              <ExtendedForm {...{ mode: action, recordId: resolvedId, tableName, onSuccess }}>
                {formElement}
              </ExtendedForm>
            ) : formElement
          }}
        </SmartModal>
      )}
    </div>
  )
})

ActionButtons.displayName = "ActionButtons"