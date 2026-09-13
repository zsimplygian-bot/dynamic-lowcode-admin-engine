import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { ACTION_MODES } from "@/lib/action-modes"
import { useTranslation } from "@/hooks/use-translation"
const config = ACTION_MODES.info
export const InfoButton = ({ row_id, tableName = "registro", endpoint, fields, initialValues, ...props }: any) => {
  const t = useTranslation()
  const title = `${t(config.modalPrefix)} ${(tableName ?? "registro").toUpperCase()}`.trim()
  const description = typeof config.description === "string" ? t(config.description) : config.description
  return (
    <SmartModal title={title} description={description}
      trigger={<SmartButton tooltip={`${t(config.label)} ${tableName}`} icon={config.icon} buttonColor={config.buttonColor} variant={config.variant} {...props} />} >
      {({ close }) => (
        <DynamicForm mode="info" tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} recordId={row_id ?? initialValues?.id} onSuccess={close} />
      )}
    </SmartModal>
  )
}