import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { EyeIcon } from "lucide-react"
export const InfoButton = ({ row_id, tableName = "registro", endpoint, fields, initialValues, onSuccess, size = "sm", ...props }: any) => (
  <SmartModal {...{
    title: `DETALLE ${(tableName ?? "registro").toUpperCase()}`, description: "Consulta los datos del registro.",
    trigger: <SmartButton {...{ icon: EyeIcon, variant: "ghost", tooltip: "Ver detalle", size, ...props }} />
  }}>
    {({ close }: { close: () => void }) => (
      <DynamicForm {...{ mode: "info", tableName, endpoint, fields, initialValues, recordId: row_id ?? initialValues?.id, onSuccess: (data: any) => { onSuccess?.(data); close() } }} />
    )}
  </SmartModal>
)