import { useCallback, useMemo, memo } from "react"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inputStyles } from "@/lib/input-styles"
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
  const isField = variant === "field"
  const { selected, label } = useMemo(() => {
    if (!value) return { selected: undefined, label: "" }
    if (mode === "single") {
      const d = toDate(value)
      return { selected: d, label: typeof value === "string" ? value.split(" ")[0] : (d ? toStr(d) : "") }
    }
    const v = value as any, from = toDate(v.from ?? v.date_from), to = toDate(v.to ?? v.date_to)
    const fStr = toStr(from), tStr = toStr(to)
    const lbl = fStr ? (!tStr || fStr === tStr ? fStr : `${fStr} - ${tStr}`) : ""
    return { selected: { from, to }, label: lbl }
  }, [value, mode])
  const textLabel = isField ? (label || placeholder) : label
  return (
    <SmartPopover align={isField ? "start" : "end"}
      trigger={
        <Button type="button" variant={isField ? "ghost" : "default"} disabled={disabled}
          className={cn("cursor-pointer [&_svg]:pointer-events-none transition-colors",
            isField ? inputStyles("h-9 items-center justify-between px-3 py-1 font-normal hover:bg-transparent", label ? "hover:text-foreground" : "text-muted-foreground")
                    : cn("flex h-9 items-center justify-center shrink-0", textLabel ? "gap-2 px-3" : "w-9 p-0 aspect-square"),
            className
          )}
        >
          {isField ? (
            <><span className="truncate">{textLabel}</span><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0 text-muted-foreground ml-2" /></>
          ) : (
            <><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0" />{textLabel && <span>{textLabel}</span>}</>
          )}
        </Button>
      }
    >
      {({ close }) => (
        <Calendar mode={mode as any} selected={selected} onSelect={(val: any) => {
            if (mode === "single") {
              onChange?.(val ? toStr(val) : "")
              close()
            } else {
              const range = val as DateRange | undefined
              onChange?.({ from: toStr(range?.from), to: toStr(range?.to) })
            }
          }}
          disabled={disabled} locale={es} numberOfMonths={mode === "range" ? 2 : 1} pagedNavigation={mode === "range"} fixedWeeks={mode === "single"}
        />
      )}
    </SmartPopover>
  )
})
DatePicker.displayName = "DatePicker"
export default DatePicker