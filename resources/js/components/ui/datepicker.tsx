import { useState, useCallback, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface DateRange {
  from?: Date
  to?: Date
}

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
  mode = "single",
  variant = "field",
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  iconSize = 20,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => {
    if (!value) return undefined

    if (mode === "single") {
      return typeof value === "string" ? parseStr(value) : (value as Date)
    }

    if (typeof value === "object") {
      if ("from" in value || "to" in value) {
        const v = value as any
        return {
          from: typeof v.from === "string" ? parseStr(v.from) : v.from,
          to: typeof v.to === "string" ? parseStr(v.to) : v.to,
        }
      }
      if ("date_from" in value || "date_to" in value) {
        const v = value as any
        return {
          from: parseStr(v.date_from),
          to: parseStr(v.date_to),
        }
      }
    }

    return undefined
  }, [value, mode])

  const label = useMemo(() => {
    if (mode === "single" && selected instanceof Date) {
      return format(selected, "dd/MM/yyyy")
    }
    if (mode === "range" && selected && "from" in selected && selected.from) {
      const fmt = (d: Date) => format(d, "dd/MM/yy")
      const isSingle = !selected.to || isSameDay(selected.from, selected.to)
      return isSingle ? fmt(selected.from) : `${fmt(selected.from)} - ${fmt(selected.to)}`
    }
    return ""
  }, [selected, mode])

  const handleSelect = useCallback(
    (val: any) => {
      if (!onChange) return

      if (mode === "single") {
        onChange(val ? fmtStr(val) : "")
        setOpen(false)
      } else {
        const range = val as DateRange | undefined
        onChange({
          from: fmtStr(range?.from),
          to: fmtStr(range?.to),
        })
      }
    },
    [mode, onChange]
  )

  return (
    <Popover {...{ open, onOpenChange: setOpen }}>
      <PopoverTrigger {...{ asChild: true }}>
        {variant === "button" ? (
          <Button {...{ className: cn("rounded-full", !label && "w-9 px-0", className) }}>
            <CalendarIcon {...{ style: { width: iconSize, height: iconSize } }} />
            {label && <span>{label}</span>}
          </Button>
        ) : (
          <button
            {...{
              type: "button",
              disabled,
              className: cn(
                "border-input dark:bg-input/30 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:cursor-not-allowed disabled:opacity-90 disabled:bg-muted/20",
                !label && "text-muted-foreground",
                className
              ),
            }}
          >
            <span {...{ className: "truncate" }}>{label || placeholder}</span>
            <CalendarIcon {...{ className: "h-4 w-4 shrink-0 text-muted-foreground opacity-70 ml-2" }} />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent {...{ align: variant === "button" ? "end" : "start", className: "w-auto p-0 z-50" }}>
        <Calendar
          {...{
            mode: mode as any,
            selected,
            onSelect: handleSelect,
            disabled,
            locale: es,
            fixedWeeks: mode === "single",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker