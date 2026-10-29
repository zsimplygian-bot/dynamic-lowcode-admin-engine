import { useState } from "react"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { MODES } from "@/lib/action-modes"

const createCfg = MODES.s
const editCfg = MODES.u

export const NewRecordButton = ({ tableName = "registro", endpoint, fields, initialValues, onSuccess, ...props }: any) => {
  const [createdId, setCreatedId] = useState<string | number | null>(null)
  const isHistoria = tableName === "historia"

  return (
    <>
      <SmartModal
        color={createCfg.buttonColor} // Borde superior azul
        title={`${createCfg.modalPrefix} ${tableName.toUpperCase()}`}
        description={createCfg.description}
        trigger={<SmartButton tooltip={`Nuevo ${tableName}`} icon={createCfg.icon} buttonColor={createCfg.buttonColor} variant={createCfg.variant} {...props} />}
      >
        {({ close }) => (
          <SmartForm
            tableName={tableName}
            endpoint={endpoint}
            fields={fields}
            initialValues={initialValues}
            onSuccess={(page: any) => {
              const id = page?.props?.id
              onSuccess?.(id)
              close()
              if (isHistoria && id) setCreatedId(id)
            }}
          />
        )}
      </SmartModal>

      {createdId && (
        <SmartModal
          open
          onOpenChange={(open) => !open && setCreatedId(null)}
          color={editCfg.buttonColor} // Borde superior verde
          title={`${editCfg.modalPrefix} ${tableName.toUpperCase()} ${createdId}`}
          description={editCfg.description}
          size="5xl"
          className="lg:max-w-[1000px]"
        >
          {({ close }) => (
            <HistoriaForm
              mode="u"
              recordId={createdId}
              tableName={tableName}
              onSuccess={onSuccess}
              form={
                <SmartForm
                  mode="u"
                  recordId={createdId}
                  tableName={tableName}
                  fields={fields}
                  endpoint={`/crud/${tableName}/${createdId}`}
                  onSuccess={() => { onSuccess?.(createdId); close() }}
                />
              }
            />
          )}
        </SmartModal>
      )}
    </>
  )
}

export default NewRecordButton