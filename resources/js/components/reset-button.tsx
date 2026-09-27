import { forwardRef } from "react"
import { SmartButton, type SmartButtonProps } from "@/components/smart-button"
import { useTranslation } from "@/hooks/use-translation"
export interface ResetButtonProps extends Omit<SmartButtonProps, "onClick"> {
  onReset: (e: React.MouseEvent<HTMLButtonElement>) => void
  canReset?: boolean
}
export const ResetButton = forwardRef<HTMLButtonElement, ResetButtonProps>(
  ({ onReset, canReset, disabled, tooltip, size = "md", variant, ...props }, ref) => {
    const t = useTranslation()
    const tooltipText = tooltip ?? t("Restablecer")
    return (
      <SmartButton ref={ref} icon="rotate-ccw" onClick={onReset} tooltip={tooltipText} size={size} variant={variant}
        disabled={disabled || !(canReset ?? true)}
        {...props}
      />
    )
  }
)
export default ResetButton