import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { Plus } from "lucide-react"
export const NewRecordButton = ({ tableName = "registro", endpoint, onSuccess, size = "md", variant, ...props }: any) => (
  <SmartModal {...{
    title: `NUEVO ${(tableName ?? "registro").toUpperCase()}`, description: "Completa la información requerida",
    trigger: <SmartButton {...{ size, variant, tooltip: `Nuevo ${tableName}`, icons: [Plus], ...props }} />
  }}>
    {({ close }: { close: () => void }) => (
      <DynamicForm {...{ tableName, endpoint, onSuccess: (data: any) => { onSuccess?.(data); close(); } }} />
    )}
  </SmartModal>
)