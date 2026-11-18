import { useState } from "react"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { MODES } from "@/lib/action-modes"
import { useCan } from "@/hooks/use-can"
import { getTableExtension } from "@/components/business/table_extensions"
interface NewRecordButtonProps { tableName?: string; title?: string; endpoint?: string; fields?: any; initialValues?: any; onSuccess?: (data?: any) => void; disabled?: boolean; [key: string]: any }
export const NewRecordButton = ({ tableName = "", title = "", endpoint, fields, initialValues, onSuccess, disabled = false, ...props }: NewRecordButtonProps) => {
  const { isRole } = useCan()
  const [createdId, setCreatedId] = useState<string | number | null>(null)
  const name = tableName || title
  const label = name.replace(/_/g, " ").trim().toUpperCase()
  const ext = getTableExtension(name)
  return (
    <><SmartModal color={MODES.s.buttonColor} title={`${MODES.s.modalPrefix} ${label}`.trim()} description={MODES.s.description} size="sm"
        trigger={<SmartButton tooltip={`New ${name.replace(/_/g, " ") || "item"}`} icon={MODES.s.icon} buttonColor={MODES.s.buttonColor} variant={MODES.s.variant} disabled={disabled || !isRole("admin")} {...props} />}>
        {({ close }) => (
          <SmartForm tableName={name} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={(res: any) => { const id = res?.props?.flash?.id ?? res?.id ?? res; onSuccess?.(id); close(); if (ext?.autoEdit && id) setCreatedId(id) }} />
        )}
      </SmartModal>
      {createdId && (
        <SmartModal open onOpenChange={(o) => !o && setCreatedId(null)} color={MODES.u.buttonColor} title={`${MODES.u.modalPrefix} ${label} ${createdId}`.trim()} description={MODES.u.description} size={ext?.size || "4xl"}>
          {({ close }) => {
            const form = <SmartForm mode="u" recordId={createdId} tableName={name} fields={fields} endpoint={`${endpoint || `/crud/${name}`}/${createdId}`} onSuccess={() => { onSuccess?.(createdId); close() }} />
            return ext?.render ? ext.render(form, { mode: "u", targetId: createdId, onSuccess }) : form
          }}
        </SmartModal>
      )}
    </>
  )
}
export default NewRecordButton