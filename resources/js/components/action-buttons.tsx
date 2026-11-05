import { memo } from "react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { MODES, Mode, useMode } from "@/lib/action-modes"
import { useCan } from "@/hooks/use-can"

interface ActionButtonsProps { row_id?: string | number; tableName?: string; endpoint?: string; updateEndpoint?: string; deleteEndpoint?: string; fields?: any[]; initialValues?: any; onSuccess?: (id?: any) => void; size?: "xs" | "sm" | "md" | "lg"; [key: string]: any }

export const ActionButtons = memo(({ row_id, tableName = "", endpoint, updateEndpoint, deleteEndpoint, fields, initialValues, onSuccess, size = "md", ...props }: ActionButtonsProps) => {
  const { isRole } = useCan()
  const { mode, setMode, config, reset } = useMode()
  const targetId = row_id ?? initialValues?.name ?? initialValues?.id ?? ""
  const isHistoria = tableName.toLowerCase() === "historia"
  const baseEndpoint = (mode === "u" ? updateEndpoint : mode === "d" ? deleteEndpoint : undefined) || endpoint || `/crud/${tableName}`
  const targetUrl = `${baseEndpoint}/${targetId}`
  const modeItem = (m: Mode) => ({ label: MODES[m].label, icon: MODES[m].icon, color: MODES[m].textColor, action: () => setMode(m) })
  const items = [
    { label: "Copy ID", icon: "copy", action: () => { navigator.clipboard.writeText(String(targetId)); toast.success("Copied") } }, "-",
    modeItem("i"),
    ...(isRole("admin") ? [modeItem("u"), modeItem("d")] : []),
    "-", ...(isHistoria ? [{ label: "Print", icon: "printer", color: "text-sky-500", action: () => window.open(`/historia/${targetId}/pdf`, "_blank") }] : []),
  ]
  return (
    <div className="flex items-center gap-1">
      <SmartDropdown label="Actions" icon="more-vertical" variant="ghost" items={items} size={size} {...props} />
      {config && (
        <SmartModal open onOpenChange={(o) => !o && reset()} color={config.buttonColor} title={`${config.modalPrefix} ${(tableName || endpoint).toUpperCase()} ${targetId}`} description={mode === "d" ? <div className="p-2.5 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-center">{config.description}</div> : config.description} size={isHistoria ? "4xl" : "sm"}>
          {({ close }) => {
            const form = <SmartForm mode={mode!} recordId={targetId} tableName={tableName} fields={fields} initialValues={initialValues} endpoint={targetUrl} onSuccess={(id) => { onSuccess?.(id); close() }} />
            return isHistoria ? <HistoriaForm mode={mode!} recordId={targetId} tableName={tableName} onSuccess={onSuccess} form={form} /> : form
          }}
        </SmartModal>
      )}
    </div>
  )
})
ActionButtons.displayName = "ActionButtons"
export default ActionButtons