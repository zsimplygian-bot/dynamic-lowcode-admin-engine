import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { ACTION_MODES } from "@/lib/action-modes"
const config = ACTION_MODES.s
export const NewRecordButton = ({ tableName = "registro", endpoint, fields, initialValues, onSuccess, ...props }: any) => {
  return (
    <SmartModal title={`${config.modalPrefix} ${tableName.toUpperCase()}`} description={config.description}
      trigger={<SmartButton tooltip={`Nuevo ${tableName}`} icon={config.icon} buttonColor={config.buttonColor} variant={config.variant} {...props} />} >
      {({ close }) => ( <SmartForm tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={() => { onSuccess?.(); close(); }} /> )}
    </SmartModal>
  )
}