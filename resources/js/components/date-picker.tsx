import { useMemo, memo } from "react"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { inputStyles } from "@/lib/input-styles"
export interface DateRange { from?: Date; to?: Date }
interface DatePickerProps {
  id?: string
  name?: string
  mode?: "single" | "range"
  variant?: "field" | "button"
  value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string }
  onChange?: (val: any) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  iconSize?: number
}
const parseDate = (v?: any) => {
  if (!v) return undefined
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
  const d = new Date(`${String(v).split(" ")[0].replace(/\//g, "-")}T00:00:00`)
  return isNaN(d.getTime()) ? undefined : d
}
const fmt = (d?: Date, sep = "-") => 
  d ? `${d.getFullYear()}${sep}${String(d.getMonth() + 1).padStart(2, "0")}${sep}${String(d.getDate()).padStart(2, "0")}` : ""
export const DatePicker = memo(({ id, name, mode = "single", variant = "field", value, onChange, placeholder, disabled = false, className, iconSize = 21 }: DatePickerProps) => {
  const isField = variant === "field"
  const { selected, label } = useMemo(() => {
    if (mode === "single") {
      const d = parseDate(value)
      return { selected: d, label: fmt(d, "/") }
    }
    const v = value as any
    const from = parseDate(v?.from ?? v?.date_from)
    const to = parseDate(v?.to ?? v?.date_to)
    const f = fmt(from, "/"), t = fmt(to, "/")
    return { selected: { from, to }, label: f ? (!t || f === t ? f : `${f} - ${t}`) : "" }
  }, [value, mode])
  const textLabel = isField ? (label || placeholder) : label
  return (
    <SmartPopover align="center" trigger={
      <Button id={id} name={name} variant={isField ? "ghost" : "default"} disabled={disabled} className={cn("cursor-pointer [&_svg]:pointer-events-none transition-colors", 
      isField ? inputStyles("h-9 items-center justify-between px-3 py-1 font-normal hover:bg-transparent", 
      label ? "hover:text-foreground" : "text-muted-foreground") : cn("flex h-9 items-center justify-center shrink-0", textLabel ? "gap-2 px-3" : "w-9 p-0 aspect-square"), className)}>
        {isField ? ( <><span className="truncate">{textLabel}</span><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0 text-muted-foreground ml-2" /></>
        ) : ( <><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0" />{textLabel && <span>{textLabel}</span>}</>
        )}
      </Button>
    }>
      {({ close }) => (
        <Calendar mode={mode as any} selected={selected} onSelect={(val: any) => {
          if (mode === "single") {
            onChange?.(fmt(val, "-"))
            close()
          } else {
            const r = val as DateRange | undefined
            onChange?.({ from: fmt(r?.from, "-"), to: fmt(r?.to, "-") })
          }
        }} disabled={disabled} locale={es} numberOfMonths={mode === "range" ? 2 : 1} pagedNavigation={mode === "range"} fixedWeeks={mode === "single"} />
      )}
    </SmartPopover>
  )
})
DatePicker.displayName = "DatePicker"
export default DatePicker