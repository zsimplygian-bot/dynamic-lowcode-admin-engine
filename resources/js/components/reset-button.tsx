import { forwardRef, memo } from "react"
import { RotateCcw } from "lucide-react"
import { SmartButton, type SmartButtonProps } from "@/components/smart-button"
export interface ResetButtonProps extends Omit<SmartButtonProps, "onClick"> {
  onReset: (e: React.MouseEvent<HTMLButtonElement>) => void
  canReset?: boolean
}
export const ResetButton = memo(
  forwardRef<HTMLButtonElement, ResetButtonProps>(
    ({ onReset, canReset, disabled, tooltip = "Restablecer", size = "md", variant = "outline", ...props }, ref) => (
      <SmartButton ref={ref} icon={RotateCcw} onClick={onReset} tooltip={tooltip} size={size} variant={variant}
        disabled={disabled || !(canReset ?? true)}
        {...props}
      />
    )
  )
)
ResetButton.displayName = "ResetButton"
export default ResetButton