import { useState, useEffect, memo } from "react"
import { CalendarIcon } from "lucide-react"
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subWeeks, subYears, setMonth, setYear } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { FormSelectSimple } from "@/components/form-select-simple"
import { cn } from "@/lib/utils"
import { inputStyles } from "@/lib/input-styles"
export interface DateRange { from?: Date; to?: Date }
export interface DatePickerProps { id?: string; name?: string; mode?: "single" | "range"; variant?: "field" | "button"; value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string }; onChange?: (val: any) => void; placeholder?: string; disabled?: boolean; className?: string; iconSize?: number }
const parseDate = (v?: any) => v ? (v instanceof Date ? v : new Date(`${String(v).split(" ")[0].replace(/\//g, "-")}T00:00:00`)) : undefined
const fmt = (d?: Date, sep = "-") => d ? `${d.getFullYear()}${sep}${String(d.getMonth() + 1).padStart(2, "0")}${sep}${String(d.getDate()).padStart(2, "0")}` : ""
const MONTH_OPTIONS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((label, id) => ({ id: String(id), label }))
const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ id: String(2010 + i), label: String(2010 + i) }))
const getPresets = () => {
  const n = new Date()
  return [
    { label: "Today", range: () => ({ from: n, to: n }) },
    { label: "Yesterday", range: () => ({ from: subDays(n, 1), to: subDays(n, 1) }) },
    { label: "This Week", range: () => ({ from: startOfWeek(n, { weekStartsOn: 1 }), to: endOfWeek(n, { weekStartsOn: 1 }) }) },
    { label: "Last Week", range: () => { const w = subWeeks(n, 1); return { from: startOfWeek(w, { weekStartsOn: 1 }), to: endOfWeek(w, { weekStartsOn: 1 }) } } },
    { label: "Last 7 Days", range: () => ({ from: subDays(n, 6), to: n }) },
    { label: "This Month", range: () => ({ from: startOfMonth(n), to: endOfMonth(n) }) },
    { label: "Last Month", range: () => { const m = subMonths(n, 1); return { from: startOfMonth(m), to: endOfMonth(m) } } },
    { label: "This Year", range: () => ({ from: startOfYear(n), to: endOfYear(n) }) },
    { label: "Last Year", range: () => { const y = subYears(n, 1); return { from: startOfYear(y), to: endOfYear(y) } } },
  ]
}
const SelectPair = ({ targetDate, onSelect }: { targetDate?: Date; onSelect: (newDate: Date) => void }) => (
  <div className="flex items-center gap-1.5 w-[200px] justify-center">
    <FormSelectSimple className="h-8 text-xs min-w-[100px] flex-1" options={MONTH_OPTIONS} value={targetDate ? String(targetDate.getMonth()) : ""} placeholder="Month" onSelect={(m) => onSelect(setMonth(targetDate ?? new Date(), Number(m)))} />
    <FormSelectSimple className="h-8 text-xs min-w-[100px] flex-1" options={YEAR_OPTIONS} value={targetDate ? String(targetDate.getFullYear()) : ""} placeholder="Year" onSelect={(y) => onSelect(setYear(targetDate ?? new Date(), Number(y)))} />
  </div>
)
export const DatePicker = memo(({ id, name, mode = "single", variant = "field", value, onChange, placeholder, disabled = false, className, iconSize = 21 }: DatePickerProps) => {
  const isSingle = mode === "single"
  const isField = variant === "field"
  const v = value as any
  const from = isSingle ? parseDate(value) : parseDate(v?.from ?? v?.date_from)
  const to = isSingle ? undefined : parseDate(v?.to ?? v?.date_to)
  const f = fmt(from, "/"), tStr = fmt(to, "/")
  const label = f ? (!tStr || f === tStr ? f : `${f} - ${tStr}`) : ""
  const textLabel = isField ? (label || placeholder) : label
  const selected = isSingle ? from : { from, to }
  const [monthDate, setMonthDate] = useState<Date>(() => from ?? new Date())
  useEffect(() => { if (from) setMonthDate(from) }, [from])
  const emit = (val: any, close?: () => void) => {
    if (isSingle) { onChange?.(fmt(val, "-")); close?.() }
    else { onChange?.({ from: fmt(val?.from, "-"), to: fmt(val?.to, "-") }) }
  }
  const handleSelectPairChange = (newDate: Date, isSecond = false) => {
    if (isSingle) { setMonthDate(newDate); return emit(newDate) }
    if (!isSecond) {
      const nextFrom = startOfMonth(newDate)
      setMonthDate(nextFrom)
      return emit({ from: nextFrom, to: to && to >= nextFrom ? to : endOfMonth(newDate) })
    }
    const nextTo = endOfMonth(newDate)
    emit({ from: from && from <= nextTo ? from : startOfMonth(newDate), to: nextTo })
  }
  return (
    <SmartPopover align="center" trigger={
      <Button id={id} name={name} variant={isField ? "ghost" : "outline"} disabled={disabled} className={cn("cursor-pointer [&_svg]:pointer-events-none transition-colors", 
      isField ? inputStyles("h-9 items-center justify-between px-3 py-1 font-normal hover:bg-transparent", label ? "hover:text-foreground" : "text-muted-foreground") : cn("flex h-9 items-center justify-center shrink-0", textLabel ? "gap-2 px-3" : "w-9 p-0 aspect-square"), className)}>
        {isField ? ( <><span className="truncate">{textLabel}</span><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0 text-muted-foreground ml-2" /></>
        ) : ( <><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0" />{textLabel && <span>{textLabel}</span>}</> )}
      </Button>
    }>
      {({ close }) => (
        <div className="flex flex-col sm:flex-row p-1 gap-2">
          {!isSingle && (
            <div className="flex flex-col gap-1 border-r pr-2 min-w-[130px]">
              {getPresets().map((p) => {
                const r = p.range()
                const isSelected = selected && (selected as DateRange).from && (selected as DateRange).to && fmt((selected as DateRange).from) === fmt(r.from) && fmt((selected as DateRange).to) === fmt(r.to)
                return (
                  <Button key={p.label} variant={isSelected ? "secondary" : "ghost"} size="sm" className="justify-start" onClick={() => { if (r.from) setMonthDate(r.from); emit(r, close) }}>
                    {p.label}
                  </Button>
                )
              })}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-around gap-4 px-3 pt-1">
              <SelectPair targetDate={from} onSelect={(d) => handleSelectPairChange(d, false)} />
              {!isSingle && <SelectPair targetDate={to} onSelect={(d) => handleSelectPairChange(d, true)} />}
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