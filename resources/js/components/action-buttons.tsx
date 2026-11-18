import { memo } from "react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { MODES, Mode, useMode } from "@/lib/action-modes"
import { useCan } from "@/hooks/use-can"
import { getTableExtension } from "@/components/business/table_extensions"
interface ActionButtonsProps {
  row_id?: string | number; tableName?: string; title?: string; endpoint?: string; fields?: any[]; initialValues?: any; onSuccess?: (id?: any) => void; size?: "xs" | "sm" | "md" | "lg"
}
export const ActionButtons = memo(({ row_id, tableName = "", title = "", endpoint, fields, initialValues, onSuccess, size = "md", ...props }: ActionButtonsProps) => {
  const { isRole } = useCan()
  const { mode, setMode, config, reset } = useMode()
  const ext = getTableExtension(tableName)
  const targetId = row_id ?? initialValues?.id ?? initialValues?.name ?? ""
  const targetUrl = `${endpoint || `/crud/${tableName}`}/${targetId}`
  const isDelete = mode === "d"
  const modeItem = (m: Mode) => ({ label: MODES[m].label, icon: MODES[m].icon, color: MODES[m].textColor, action: () => setMode(m) })
  const items = [
    { label: "Copy ID", icon: "copy", action: () => { navigator.clipboard.writeText(String(targetId)); toast.success("ID copied successfully.") } }, "-",
    modeItem("i"), ...(isRole("admin") ? [modeItem("u"), modeItem("d")] : []),
    ...(ext?.actions ? ["-", ...ext.actions(targetId)] : [])
  ]
  const deleteNotice = <div className="p-2.5 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-center">{config?.description}</div>
  const label = Array.from(new Set([tableName || title, targetId])).filter(Boolean).join(" ").replace(/_/g, " ").toUpperCase()

  return (
    <div className="flex items-center gap-1">
      <SmartDropdown label="Actions" icon="more-vertical" variant="ghost" items={items} size={size} {...props} />
      {config && (
        <SmartModal open onOpenChange={(o) => !o && reset()} color={config.buttonColor} title={`${config.modalPrefix} ${label}`} description={isDelete ? deleteNotice : config.description} size={ext?.size || "sm"}>
          {({ close }) => {
            const form = <SmartForm mode={mode!} recordId={targetId} tableName={tableName} fields={fields} initialValues={initialValues} endpoint={targetUrl} onSuccess={(id) => { onSuccess?.(id); close() }} />
            return ext?.render ? ext.render(form, { mode: mode!, targetId, onSuccess }) : form
          }}
        </SmartModal>
      )}
    </div>
  )
})
ActionButtons.displayName = "ActionButtons"
export default ActionButtons