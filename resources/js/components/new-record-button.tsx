import { useState } from "react"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { MODES } from "@/lib/action-modes"
import { useCan } from "@/hooks/use-can"

export const NewRecordButton = ({ tableName = "registro", endpoint, fields, initialValues, onSuccess, disabled = false, ...props }: any) => {
  const { isRole } = useCan()
  const [createdId, setCreatedId] = useState<string | number | null>(null)
  const isHistoria = tableName.toLowerCase() === "historia"
  const isDisabled = disabled || !isRole("admin")

  return (
    <>
      <SmartModal color={MODES.s.buttonColor} title={`${MODES.s.modalPrefix} ${tableName.toUpperCase()}`} description={MODES.s.description} trigger={<SmartButton tooltip={`Nuevo ${tableName}`} icon={MODES.s.icon} buttonColor={MODES.s.buttonColor} variant={MODES.s.variant} disabled={isDisabled} {...props} />}>
        {({ close }) => (
          <SmartForm tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={(page: any) => { const id = page?.props?.flash?.id; onSuccess?.(id); close(); if (isHistoria && id) setCreatedId(id) }} />
        )}
      </SmartModal>
      {createdId && (
        <SmartModal open onOpenChange={(open) => !open && setCreatedId(null)} color={MODES.u.buttonColor} title={`${MODES.u.modalPrefix} ${tableName.toUpperCase()} ${createdId}`} description={MODES.u.description} size="4xl">
          {({ close }) => (
            <HistoriaForm mode="u" recordId={createdId} tableName={tableName} onSuccess={onSuccess} form={<SmartForm mode="u" recordId={createdId} tableName={tableName} fields={fields} endpoint={`/crud/${tableName}/${createdId}`} onSuccess={() => { onSuccess?.(createdId); close() }} />} />
          )}
        </SmartModal>
      )}
    </>
  )
}
export default NewRecordButton