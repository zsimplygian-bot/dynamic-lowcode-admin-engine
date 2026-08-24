import { memo, useRef } from "react"
import { ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ClockProps {
  value?: string; disabled?: boolean; placeholder?: string; onChange?: (value: string) => void
}

export const Clock = memo(({ value = "", disabled = false, placeholder = "00:00", onChange }: ClockProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div {...{ onClick: () => !disabled && inputRef.current?.showPicker?.(), className: "relative w-full cursor-pointer" }}>
      <Input {...{ ref: inputRef, type: "time", value, disabled, placeholder, onChange: (e) => onChange?.(e.target.value), className: "w-full cursor-pointer pr-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden" }} />
      <ClockIcon {...{ className: "absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }} />
    </div>
  )
})

Clock.displayName = "Clock"
export default Clock