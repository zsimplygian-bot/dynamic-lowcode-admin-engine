import { useState, useEffect, memo } from "react"
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subWeeks, subYears, setMonth, setYear } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
import { DynamicIcon } from "@/components/dynamic-icon"
import { cn } from "@/lib/utils"
import { inputStyles } from "@/lib/input-styles"
export interface DateRange { from?: Date; to?: Date }
export interface DatePickerProps { id?: string; name?: string; mode?: "single" | "range"; variant?: "field" | "button"; value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string }; onChange?: (val: any) => void; placeholder?: string; disabled?: boolean; className?: string }
const parseDate = (v?: any) => v instanceof Date ? v : v ? new Date(`${String(v).split(" ")[0].replace(/\//g, "-")}T00:00:00`) : undefined
const fmt = (d?: Date, sep = "-") => d ? d.toLocaleDateString("en-CA").replace(/-/g, sep) : ""
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((label, id) => ({ id: `${id}`, label }))
const YEARS = Array.from({ length: 31 }, (_, i) => ({ id: `${2010 + i}`, label: `${2010 + i}` }))
const PRESETS = (n = new Date(), w = { weekStartsOn: 1 as const }) => [
  { label: "Today", from: n, to: n },
  { label: "Yesterday", from: subDays(n, 1), to: subDays(n, 1) },
  { label: "This Week", from: startOfWeek(n, w), to: endOfWeek(n, w) },
  { label: "Last Week", from: startOfWeek(subWeeks(n, 1), w), to: endOfWeek(subWeeks(n, 1), w) },
  { label: "Last 7 Days", from: subDays(n, 6), to: n },
  { label: "This Month", from: startOfMonth(n), to: endOfMonth(n) },
  { label: "Last Month", from: startOfMonth(subMonths(n, 1)), to: endOfMonth(subMonths(n, 1)) },
  { label: "This Year", from: startOfYear(n), to: endOfYear(n) },
  { label: "Last Year", from: startOfYear(subYears(n, 1)), to: endOfYear(subYears(n, 1)) },
]
const SelectPair = ({ targetDate: d, onSelect }: { targetDate?: Date; onSelect: (d: Date) => void }) => (
  <div className="flex items-center gap-1 w-[220px]">
    <FormSelect options={MONTHS} value={d ? `${d.getMonth()}` : ""} placeholder="Month" onSelect={(m) => onSelect(setMonth(d ?? new Date(), +m))} />
    <FormSelect options={YEARS} value={d ? `${d.getFullYear()}` : ""} placeholder="Year" onSelect={(y) => onSelect(setYear(d ?? new Date(), +y))} />
  </div>
)
export const DatePicker = memo(({ id, name, mode = "single", variant = "field", value, onChange, placeholder, disabled = false, className }: DatePickerProps) => {
  const isSingle = mode === "single", isField = variant === "field", v = value as any
  const from = parseDate(isSingle ? value : v?.from ?? v?.date_from), to = isSingle ? undefined : parseDate(v?.to ?? v?.date_to)
  const f = fmt(from, "/"), t = fmt(to, "/"), label = f ? (t && f !== t ? `${f} ${t}` : f) : "", text = label || (isField ? placeholder : "")
  const selected = isSingle ? from : { from, to }
  const [monthDate, setMonthDate] = useState<Date>(() => from ?? new Date())
  useEffect(() => { if (from) setMonthDate(from) }, [from])
  const emit = (val: any, close?: () => void) => (onChange?.(isSingle ? fmt(val, "-") : { from: fmt(val?.from, "-"), to: fmt(val?.to, "-") }), isSingle && close?.())
  const handleSelectPairChange = (d: Date, isSecond = false) => {
    if (isSingle) return (setMonthDate(d), emit(d))
    if (!isSecond) { const n = startOfMonth(d); setMonthDate(n); return emit({ from: n, to: to && to >= n ? to : endOfMonth(d) }) }
    const n = endOfMonth(d); return emit({ from: from && from <= n ? from : startOfMonth(d), to: n })
  }
  return (
    <SmartPopover align="center" trigger={
      <Button id={id} name={name} variant={isField ? "ghost" : "outline"} disabled={disabled} className={cn("cursor-pointer [&_svg]:pointer-events-none transition-colors h-9 items-center", 
        isField ? inputStyles("justify-between px-3 py-1 font-normal hover:bg-transparent", label ? "hover:text-foreground" : "text-muted-foreground") : ["flex shrink-0", text ? "justify-between gap-2 px-3" : "w-9 p-0 aspect-square justify-center"], className)}>
        {text && <span className={cn(isField && "truncate")}>{text}</span>} <DynamicIcon name="calendar" className={cn("size-5", isField && "text-muted-foreground ml-auto")} /> </Button> }>
      {({ close }) => (
        <div className="flex flex-col sm:flex-row p-1 gap-2">
          {!isSingle && (
            <div className="flex flex-col gap-1 border-r pr-2">
              {PRESETS().map((p) => (
                <Button key={p.label} variant={fmt(from) === fmt(p.from) && fmt(to) === fmt(p.to) ? "secondary" : "ghost"} size="sm" className="justify-start" 
                  onClick={() => (setMonthDate(p.from), emit(p, close))}> {p.label}
                </Button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-around px-2 pt-1">
              <SelectPair targetDate={from} onSelect={(d) => handleSelectPairChange(d, false)}/>{!isSingle && <SelectPair targetDate={to} onSelect={(d) => handleSelectPairChange(d, true)} />}
            </div>
            <Calendar mode={mode as any} month={monthDate} onMonthChange={setMonthDate} selected={selected} onSelect={(val) => emit(val, close)} disabled={disabled} numberOfMonths={isSingle ? 1 : 2} pagedNavigation={!isSingle} fixedWeeks={isSingle} />
          </div>
        </div>
      )}
    </SmartPopover>
  )
})
DatePicker.displayName = "DatePicker"
export default DatePicker