import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { Plus } from "lucide-react"

export const NewRecordButton = ({ tableName = "registro", endpoint = `/crud/${tableName}`, fields, initialValues, onSuccess, ...props }: any) => (
  <SmartModal
    title={`NUEVO ${tableName.toUpperCase()}`}
    description="Completa la información requerida"
    trigger={<SmartButton tooltip={`Nuevo ${tableName}`} icon={Plus} {...props} />}
  >
    {({ close }: { close: () => void }) => (
      <DynamicForm tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={(data: any) => { onSuccess?.(data); close(); }} />
    )}
  </SmartModal>
)