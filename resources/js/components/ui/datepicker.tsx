import { useState, useCallback, useMemo, useEffect, memo } from "react"
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

const toDate = (s?: string) => (!s || typeof s !== "string") ? undefined : (d => isNaN(d.getTime()) ? undefined : d)(new Date(`${s}T00:00:00`))
const toStr = (d?: Date) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : ""

export const DatePicker = memo(({ mode = "single", variant = "field", value, onChange, placeholder = "-", disabled = false, className, iconSize = 18 }: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value)
  const isField = variant === "field"

  useEffect(() => { setInternalValue(value) }, [value])

  const selected = useMemo(() => {
    if (!internalValue) return undefined
    if (mode === "single") return typeof internalValue === "string" ? toDate(internalValue) : (internalValue as Date)
    const v = internalValue as any, from = v.from ?? v.date_from, to = v.to ?? v.date_to
    return { from: typeof from === "string" ? toDate(from) : from, to: typeof to === "string" ? toDate(to) : to }
  }, [internalValue, mode])

  const label = useMemo(() => {
    if (mode === "single" && typeof internalValue === "string") return internalValue
    if (mode === "single" && selected instanceof Date) return toStr(selected)
    if (mode === "range" && selected && "from" in selected && selected.from) {
      return !selected.to || isSameDay(selected.from, selected.to) ? toStr(selected.from) : `${toStr(selected.from)} - ${toStr(selected.to)}`
    }
    return ""
  }, [internalValue, selected, mode])

  const handleSelect = useCallback((val: any) => {
    if (mode === "single") {
      const formatted = val ? toStr(val) : ""
      setInternalValue(formatted); onChange?.(formatted); setOpen(false)
    } else {
      const range = val as DateRange | undefined, formattedRange = { from: toStr(range?.from), to: toStr(range?.to) }
      setInternalValue(formattedRange); onChange?.(formattedRange)
    }
  }, [mode, onChange])

  const textLabel = isField ? (label || placeholder) : label

  const triggerButton = useMemo(() => (
    <Button {...{
      type: "button", variant: isField ? "ghost" : "default", disabled,
      className: cn("cursor-pointer [&_svg]:pointer-events-none",
        isField && "border-input placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none hover:bg-transparent hover:border-input dark:hover:bg-input/30 active:bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-80 md:text-sm font-normal",
        isField && label && "hover:text-foreground", isField && !label && "text-muted-foreground hover:text-muted-foreground",
        !isField && "flex h-9 items-center justify-center shrink-0", !isField && textLabel && "gap-2 px-3", !isField && !textLabel && "w-9 p-0 aspect-square", className)
    }}>
      {isField ? (
        <>
          <span {...{ className: "truncate" }}>{textLabel}</span>
          <CalendarIcon {...{ className: "shrink-0 text-muted-foreground ml-2", style: { width: iconSize, height: iconSize } }} />
        </>
      ) : (
        <>
          <CalendarIcon {...{ className: "shrink-0", style: { width: iconSize, height: iconSize } }} />
          {textLabel && <span>{textLabel}</span>}
        </>
      )}
    </Button>
  ), [isField, disabled, label, textLabel, className, iconSize])

  return (
    <SmartPopover {...{ open, onOpenChange: setOpen, trigger: triggerButton, align: isField ? "start" : "end" }}>
      <Calendar {...{ mode: mode as any, selected, onSelect: handleSelect, disabled, locale: es, numberOfMonths: mode === "range" ? 2 : 1, pagedNavigation: mode === "range", fixedWeeks: mode === "single" }} />
    </SmartPopover>
  )
})

DatePicker.displayName = "DatePicker"
export default DatePicker