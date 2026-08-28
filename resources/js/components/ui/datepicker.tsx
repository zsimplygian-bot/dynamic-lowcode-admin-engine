import { useState, useCallback, useMemo, memo } from "react"
import { isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
export interface DateRange { from?: Date; to?: Date }
interface DatePickerProps {
  mode?: "single" | "range"; variant?: "field" | "button"
  value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string }
  onChange?: (val: any) => void; placeholder?: string; disabled?: boolean; className?: string; iconSize?: number
}
const toDate = (s?: any): Date | undefined => {
  if (!s) return undefined
  if (s instanceof Date) return isNaN(s.getTime()) ? undefined : s
  if (typeof s !== "string") return undefined
  const d = new Date(`${s.split(" ")[0]}T00:00:00`)
  return isNaN(d.getTime()) ? undefined : d
}
const toStr = (d?: Date) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : ""
export const DatePicker = memo(({
  mode = "single", variant = "field", value, onChange, placeholder = "-",
  disabled = false, className, iconSize = 18
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [uncontrolledVal, setUncontrolledVal] = useState(value)
  const activeValue = value !== undefined ? value : uncontrolledVal
  const isField = variant === "field"
  // Resolución unificada de Date y Label en un solo pase
  const { selected, label } = useMemo(() => {
    if (!activeValue) return { selected: undefined, label: "" }
    if (mode === "single") {
      const d = toDate(activeValue)
      return { selected: d, label: typeof activeValue === "string" ? activeValue.split(" ")[0] : (d ? toStr(d) : "") }
    }
    const v = activeValue as any
    const from = toDate(v.from ?? v.date_from)
    const to = toDate(v.to ?? v.date_to)
    const range = { from, to }
    const lbl = from ? (!to || isSameDay(from, to) ? toStr(from) : `${toStr(from)} - ${toStr(to)}`) : ""
    return { selected: range, label: lbl }
  }, [activeValue, mode])
  const handleSelect = useCallback((val: any) => {
    if (mode === "single") {
      const formatted = val ? toStr(val) : ""
      setUncontrolledVal(formatted)
      onChange?.(formatted)
      setOpen(false)
    } else {
      const range = val as DateRange | undefined
      const formattedRange = { from: toStr(range?.from), to: toStr(range?.to) }
      setUncontrolledVal(formattedRange)
      onChange?.(formattedRange)
    }
  }, [mode, onChange])
  const textLabel = isField ? (label || placeholder) : label
  const triggerButton = (
    <Button
      type="button" variant={isField ? "ghost" : "default"} disabled={disabled}
      className={cn(
        "cursor-pointer [&_svg]:pointer-events-none transition-colors",
        isField && "border-input placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-80 font-normal",
        isField && (label ? "hover:text-foreground" : "text-muted-foreground"),
        !isField && "flex h-9 items-center justify-center shrink-0",
        !isField && textLabel && "gap-2 px-3",
        !isField && !textLabel && "w-9 p-0 aspect-square",
        className
      )}
    >
      {isField ? (
        <>
          <span className="truncate">{textLabel}</span> <CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0 text-muted-foreground ml-2" />
        </>
      ) : (
        <>
          <CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0" /> {textLabel && <span>{textLabel}</span>}
        </>
      )}
    </Button>
  )
  return (
    <SmartPopover open={open} onOpenChange={setOpen} trigger={triggerButton} align={isField ? "start" : "end"}>
      <Calendar
        mode={mode as any} selected={selected} onSelect={handleSelect} disabled={disabled} locale={es} numberOfMonths={mode === "range" ? 2 : 1} pagedNavigation={mode === "range"}
        fixedWeeks={mode === "single"} />
    </SmartPopover>
  )
})
DatePicker.displayName = "DatePicker"
export default DatePicker