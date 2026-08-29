import { memo, useState } from "react"
import { CopyIcon, MoreVertical, PrinterIcon } from "lucide-react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { ExtendedForm } from "@/components/form/extended-form"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"

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
    { key: "info", label: ACTION_MODES.info.label, icon: ACTION_MODES.info.icon, color: ACTION_MODES.info.textColor, action: () => setAction("info") },
    ...(isHistoria ? [{ key: "print", label: "Imprimir", icon: PrinterIcon, color: "text-sky-500", action: () => { if (resolvedId) window.open(`/historia/${resolvedId}/pdf`, "_blank") } }] : []),
    { key: "update", label: ACTION_MODES.update.label, icon: ACTION_MODES.update.icon, color: ACTION_MODES.update.textColor, action: () => setAction("update") },
    { key: "delete", label: ACTION_MODES.delete.label, icon: ACTION_MODES.delete.icon, color: ACTION_MODES.delete.textColor, action: () => setAction("delete") }
  ]

  const activeConfig = action ? ACTION_MODES[action] : null
  
  const recordLabel = initialValues?.nombre ?? initialValues?.name ?? initialValues?.codigo ?? resolvedId ?? ''
  const modalTitle = activeConfig 
    ? `${activeConfig.modalPrefix} ${tableName.toUpperCase()} ${recordLabel}`.trim() 
    : ""

  const modalDescription = action === 'delete' ? (
    <div className="mx-auto max-w-2xl p-2.5 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-center">
      {activeConfig?.description}
    </div>
  ) : activeConfig?.description

  return (
    <div className="flex items-center gap-1">
      <SmartDropdown label="Acciones" icon={MoreVertical} variant="ghost" items={dropdownItems} size={size} {...props} />
      {action && activeConfig && (
        <SmartModal
          open={true} onOpenChange={(o) => { if (!o) setAction(null) }}
          title={modalTitle} description={modalDescription}
          size={isHistoriaExtended ? "max-w-[95vw] lg:max-w-5xl w-full" : "md"}
        >
          {({ close }) => {
            const formElement = (
              <DynamicForm
                mode={action} recordId={resolvedId} tableName={tableName} fields={fields} initialValues={initialValues}
                endpoint={getEndpoint(action, resolvedId, endpoint, updateEndpoint, deleteEndpoint)}
                onSuccess={(id: any) => { onSuccess?.(id); close(); }}
              />
            )
            return isHistoriaExtended ? (
              <ExtendedForm mode={action} recordId={resolvedId} tableName={tableName} onSuccess={(id: any) => { onSuccess?.(id); close(); }}>
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