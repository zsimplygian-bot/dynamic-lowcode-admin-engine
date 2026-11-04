import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { useMode } from "@/lib/action-modes"
interface InfoButtonProps { row_id?: string | number; tableName?: string; endpoint?: string; fields?: any[]; initialValues?: any; onSuccess?: (data?: any) => void; [key: string]: any }
export const InfoButton = ({ row_id, tableName = "registro", endpoint, fields, initialValues, onSuccess, ...props }: InfoButtonProps) => {
  const { config, open, reset, isOpen } = useMode("i")
  const targetUrl = endpoint || `/crud/${tableName}`
  return (
    <><SmartButton tooltip={`${config.label} ${tableName}`} icon={config.icon} buttonColor={config.buttonColor} variant={config.variant} onClick={() => open()} {...props} />
      {isOpen && (
        <SmartModal open onOpenChange={(o) => !o && reset()} color={config.buttonColor} title={`${config.modalPrefix} ${tableName.toUpperCase()}`} description={config.description} size="sm">
          {({ close }) => (
            <SmartForm mode="i" recordId={row_id ?? initialValues?.id} tableName={tableName} fields={fields} initialValues={initialValues} endpoint={targetUrl} 
              onSuccess={(data) => { onSuccess?.(data); close() }} />
          )}
        </SmartModal>
      )}
    </>
  )
}
export default InfoButton