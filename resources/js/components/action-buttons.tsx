import { memo, useState } from "react"
import { CopyIcon, MoreVertical, PrinterIcon } from "lucide-react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useTranslation } from "@/hooks/use-translation"

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

export const ActionButtons = memo(({ row_id, tableName = "", endpoint, updateEndpoint, deleteEndpoint, fields, initialValues, onSuccess, size = "md", ...props }: ActionButtonsProps) => {
  const t = useTranslation()
  const [action, setAction] = useState<ActionMode | null>(null)
  const isHistoria = tableName.toLowerCase().trim() === "historia"
  const resolvedEndpoint = endpoint || `/crud/${tableName}`

  const dropdownItems = [
    { key: "copy", label: t("Copy ID"), icon: CopyIcon, action: () => { if (row_id) { navigator.clipboard.writeText(String(row_id)); toast.success(t("ID copied")) } } },
    { key: "info", label: t(ACTION_MODES.info.label), icon: ACTION_MODES.info.icon, color: ACTION_MODES.info.textColor, action: () => setAction("info") },
    ...(isHistoria ? [{ key: "print", label: t("Print"), icon: PrinterIcon, color: "text-sky-500", action: () => { if (row_id) window.open(`/historia/${row_id}/pdf`, "_blank") } }] : []),
    { key: "update", label: t(ACTION_MODES.update.label), icon: ACTION_MODES.update.icon, color: ACTION_MODES.update.textColor, action: () => setAction("update") },
    { key: "delete", label: t(ACTION_MODES.delete.label), icon: ACTION_MODES.delete.icon, color: ACTION_MODES.delete.textColor, action: () => setAction("delete") }
  ]

  const activeConfig = action ? ACTION_MODES[action] : null
  const recordLabel = row_id ?? ''
  const modalTitle = activeConfig ? `${t(activeConfig.modalPrefix)} ${tableName.toUpperCase()} ${recordLabel}`.trim() : ""
  const descriptionText = typeof activeConfig?.description === 'string' ? t(activeConfig.description) : activeConfig?.description
  const modalDescription = action === 'delete' ? (
    <div className="mx-auto max-w-2xl p-2.5 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-center">
      {descriptionText}
    </div>
  ) : descriptionText

  return (
    <div className="flex items-center gap-1">
      <SmartDropdown label={t("Actions")} icon={MoreVertical} variant="ghost" items={dropdownItems} size={size} {...props} />
      {action && activeConfig && (
        <SmartModal open={true} onOpenChange={(o) => { if (!o) setAction(null) }} title={modalTitle} description={modalDescription} size={isHistoria ? "5xl" : "md"} className={isHistoria ? "max-w-[95vw] lg:max-w-[1000px]" : undefined}>
          {({ close }) => {
            const formContent = (
              <DynamicForm mode={action} recordId={row_id} tableName={tableName} fields={fields} initialValues={initialValues}
                endpoint={getEndpoint(action, row_id, resolvedEndpoint, updateEndpoint, deleteEndpoint)} onSuccess={(id: any) => { onSuccess?.(id); close() }}
              />
            )

            return isHistoria ? (
              <HistoriaForm mode={action} recordId={row_id} tableName={tableName} onSuccess={onSuccess}>
                {formContent}
              </HistoriaForm>
            ) : formContent
          }}
        </SmartModal>
      )}
    </div>
  )
})
ActionButtons.displayName = "ActionButtons"