import { useState, useCallback, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmartButton } from "@/components/smart-button"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
export interface DateRange { from?: Date; to?: Date }
interface DatePickerProps {
  mode?: "single" | "range"
  variant?: "field" | "button"
  value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string }
  onChange?: (val: any) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  iconSize?: number
}

const parseStr = (s?: string) => {
  if (!s) return undefined
  const d = parse(s, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

const fmtStr = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : undefined)

export function DatePicker({
  mode = "single", variant = "field", value, onChange, placeholder = "-", disabled = false, className, iconSize = 20,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => {
    if (!value) return undefined
    if (mode === "single") return typeof value === "string" ? parseStr(value) : (value as Date)
    if (typeof value === "object") {
      const v = value as any
      const from = v.from ?? v.date_from
      const to = v.to ?? v.date_to
      return {
        from: typeof from === "string" ? parseStr(from) : from,
        to: typeof to === "string" ? parseStr(to) : to,
      }
    }
    return undefined
  }, [value, mode])

  const label = useMemo(() => {
    if (mode === "single" && selected instanceof Date) return format(selected, "dd/MM/yyyy")
    if (mode === "range" && selected && "from" in selected && selected.from) {
      const fmt = (d: Date) => format(d, "dd/MM/yy")
      return !selected.to || isSameDay(selected.from, selected.to) ? fmt(selected.from) : `${fmt(selected.from)} - ${fmt(selected.to)}`
    }
    return ""
  }, [selected, mode])

  const handleSelect = useCallback((val: any) => {
    if (!onChange) return
    if (mode === "single") {
      onChange(val ? fmtStr(val) : "")
      setOpen(false)
    } else {
      const range = val as DateRange | undefined
      onChange({ from: fmtStr(range?.from), to: fmtStr(range?.to) })
    }
  }, [mode, onChange])

  const isField = variant === "field"

  return (
    <Popover {...{ open, onOpenChange: setOpen }}>
      <PopoverTrigger {...{ asChild: true }}>
        <SmartButton
          {...{
            icons: CalendarIcon,
            iconPosition: isField ? "right" : "left",
            iconSize: isField ? 16 : iconSize,
            label: isField ? (label || placeholder) : (label || undefined),
            variant: isField ? "outline" : "default",
            disabled,
            className: cn(
              isField && "w-full justify-between rounded-md border-input dark:bg-input/30 font-normal shadow-xs transition-[color,box-shadow]",
              isField && !label && "text-muted-foreground",
              className
            ),
          }}
        />
      </PopoverTrigger>
      <PopoverContent {...{ align: isField ? "start" : "end", className: "w-auto p-0 z-50" }}>
        <Calendar {...{ mode: mode as any, selected, onSelect: handleSelect, disabled, locale: es, fixedWeeks: mode === "single" }} />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker