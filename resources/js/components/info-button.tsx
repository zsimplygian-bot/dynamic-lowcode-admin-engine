import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { SmartForm } from "@/components/smart-form"
import { MODES } from "@/lib/action-modes"
interface InfoButtonProps { row_id?: number; tableName?: string}
export const InfoButton = ({ row_id, tableName, ...props }: InfoButtonProps) => (
  <SmartModal color={MODES.i.buttonColor} title={`${MODES.i.modalPrefix} ${tableName!.toUpperCase()}`} description={MODES.i.description} size="sm" 
    trigger={<SmartButton tooltip={`${MODES.i.label} ${tableName}`} icon={MODES.i.icon} buttonColor={MODES.i.buttonColor} variant={MODES.i.variant} {...props} />}>
    <SmartForm mode="i" recordId={row_id} tableName={tableName} />
  </SmartModal>
)
export default InfoButton