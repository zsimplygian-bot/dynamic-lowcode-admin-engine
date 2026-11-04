import { forwardRef } from "react"
import { SmartButton, type SmartButtonProps } from "@/components/smart-button"
export interface ResetButtonProps extends SmartButtonProps { onReset?: (e: React.MouseEvent<HTMLButtonElement>) => void; canReset?: boolean }
export const ResetButton = forwardRef<HTMLButtonElement, ResetButtonProps>(({ onReset, onClick, tooltip = "Restablecer", icon = "rotate-ccw", canReset = true, disabled, ...props }, ref) => (
  <SmartButton ref={ref} icon={icon} tooltip={tooltip} disabled={disabled ?? !canReset} onClick={onReset || onClick} {...props} />
))
ResetButton.displayName = "ResetButton"
export default ResetButton