import { useState } from "react"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { ACTION_MODES } from "@/lib/action-modes"
const config = ACTION_MODES.s
const editConfig = ACTION_MODES.u
export const NewRecordButton = ({ tableName = "registro", endpoint, fields, initialValues, onSuccess, ...props }: any) => {
  const [createdId, setCreatedId] = useState<string | number | null>(null)
  return (
    <><SmartModal title={`${config.modalPrefix} ${tableName.toUpperCase()}`} description={config.description} trigger={<SmartButton tooltip={`Nuevo ${tableName}`} icon={config.icon} buttonColor={config.buttonColor} variant={config.variant} {...props} />}>
        {({ close }) => (
          <SmartForm tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={(page: any) => {
            const id = page?.props?.id
            onSuccess?.(id)
            close()
            if (tableName === "historia" && id) setCreatedId(id)
          }} />
        )}
      </SmartModal>
      {createdId && (
        <SmartModal open={true} onOpenChange={(open) => !open && setCreatedId(null)} title={`${editConfig.modalPrefix} ${tableName.toUpperCase()} ${createdId}`} description={editConfig.description} size="5xl" className="lg:max-w-[1000px]">
          {({ close }) => (
            <HistoriaForm mode="u" recordId={createdId} tableName={tableName} onSuccess={onSuccess} form={<SmartForm mode="u" recordId={createdId} tableName={tableName} fields={fields} endpoint={`/crud/${tableName}/${createdId}`} onSuccess={() => { onSuccess?.(createdId); close() }} />} />
          )}
        </SmartModal>
      )}
    </>
  )
}