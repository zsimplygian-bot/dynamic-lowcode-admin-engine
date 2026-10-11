import { memo, useState } from "react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { HistoriaForm } from "@/components/form/historia-form"
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
  const url = (m === "u" ? up : m === "d" ? del : undefined) || base
  return url && id !== undefined ? `${url}/${id}` : url
}
export const ActionButtons = memo(({ row_id, tableName = "", endpoint, updateEndpoint, deleteEndpoint, fields, initialValues, onSuccess, size = "md", ...props }: ActionButtonsProps) => {
  const [action, setAction] = useState<ActionMode | null>(null)
  const isHistoria = tableName.toLowerCase().trim() === "historia"
  const resolvedEndpoint = endpoint || `/crud/${tableName}`
  const dropdownItems = [
    { key: "copy", label: "Copy ID", icon: "copy", action: () => { if (row_id) { navigator.clipboard.writeText(String(row_id)); toast.success("ID copied") } } },
    { key: "info", label: ACTION_MODES.i.label, icon: ACTION_MODES.i.icon, color: ACTION_MODES.i.textColor, action: () => setAction("i") },
    ...(isHistoria ? [{ key: "print", label: "Print", icon: "printer", color: "text-sky-500", action: () => { if (row_id) window.open(`/historia/${row_id}/pdf`, "_blank") } }] : []),
    { key: "update", label: ACTION_MODES.u.label, icon: ACTION_MODES.u.icon, color: ACTION_MODES.u.textColor, action: () => setAction("u") },
    { key: "delete", label: ACTION_MODES.d.label, icon: ACTION_MODES.d.icon, color: ACTION_MODES.d.textColor, action: () => setAction("d") } ]
  const activeConfig = action ? ACTION_MODES[action] : null
  const recordLabel = row_id ?? ''
  const modalTitle = activeConfig ? `${activeConfig.modalPrefix} ${tableName.toUpperCase()} ${recordLabel}`.trim() : ""
  const descriptionText = activeConfig?.description
  const modalDescription = action === 'd' ? (
    <div className="mx-auto max-w-2xl p-2.5 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-center"> {descriptionText} </div>
  ) : descriptionText
  return (
    <div className="flex items-center gap-1">
      <SmartDropdown label="Actions" icon="more-vertical" variant="ghost" items={dropdownItems} size={size} {...props} />
      {action && activeConfig && (
        <SmartModal open={true} onOpenChange={(o) => { if (!o) setAction(null) }} title={modalTitle} description={modalDescription} size={isHistoria ? "5xl" : "md"} className={isHistoria ? "lg:max-w-[1000px]" : undefined}>
          {({ close }) => {
            const formContent = (
              <SmartForm mode={action} recordId={row_id} tableName={tableName} fields={fields} initialValues={initialValues}
                endpoint={getEndpoint(action, row_id, resolvedEndpoint, updateEndpoint, deleteEndpoint)} onSuccess={(id: any) => { onSuccess?.(id); close() }}
              />
            )
            return isHistoria ? ( <HistoriaForm mode={action} recordId={row_id} tableName={tableName} onSuccess={onSuccess}> {formContent} </HistoriaForm>
            ) : formContent
          }}
        </SmartModal>
      )}
    </div>
  )
})
ActionButtons.displayName = "ActionButtons"