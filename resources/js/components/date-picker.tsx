import { useMemo, useState, useEffect, memo } from "react"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subWeeks, subYears, setMonth, setYear } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { SmartPopover } from "@/components/smart-popover"
import { Button } from "@/components/ui/button"
import { FormSelectSimple } from "@/components/form-select-simple"
import { cn } from "@/lib/utils"
import { inputStyles } from "@/lib/input-styles"

export interface DateRange { from?: Date; to?: Date }
export interface DatePickerProps {
  id?: string; name?: string; mode?: "single" | "range"; variant?: "field" | "button";
  value?: string | DateRange | { from?: string; to?: string; date_from?: string; date_to?: string };
  onChange?: (val: any) => void; placeholder?: string; disabled?: boolean; className?: string; iconSize?: number;
}

const parseDate = (v?: any) => {
  if (!v) return undefined
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v
  const d = new Date(`${String(v).split(" ")[0].replace(/\//g, "-")}T00:00:00`)
  return isNaN(d.getTime()) ? undefined : d
}

const fmt = (d?: Date, sep = "-") => d ? `${d.getFullYear()}${sep}${String(d.getMonth() + 1).padStart(2, "0")}${sep}${String(d.getDate()).padStart(2, "0")}` : ""

const MONTH_OPTIONS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((label, id) => ({ id: String(id), label: t(label) }))
const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => ({ id: String(2010 + i), label: String(2010 + i) }))

const getPresets = () => {
  const n = new Date()
  return [
    { label: t("Today"), range: () => ({ from: n, to: n }) },
    { label: t("Yesterday"), range: () => ({ from: subDays(n, 1), to: subDays(n, 1) }) },
    { label: t("This Week"), range: () => ({ from: startOfWeek(n, { weekStartsOn: 1 }), to: endOfWeek(n, { weekStartsOn: 1 }) }) },
    { label: t("Last Week"), range: () => { const w = subWeeks(n, 1); return { from: startOfWeek(w, { weekStartsOn: 1 }), to: endOfWeek(w, { weekStartsOn: 1 }) } } },
    { label: t("Last 7 Days"), range: () => ({ from: subDays(n, 6), to: n }) },
    { label: t("This Month"), range: () => ({ from: startOfMonth(n), to: endOfMonth(n) }) },
    { label: t("Last Month"), range: () => { const m = subMonths(n, 1); return { from: startOfMonth(m), to: endOfMonth(m) } } },
    { label: t("This Year"), range: () => ({ from: startOfYear(n), to: endOfYear(n) }) },
    { label: t("Last Year"), range: () => { const y = subYears(n, 1); return { from: startOfYear(y), to: endOfYear(y) } } },
  ]
}

const SelectPair = ({ targetDate, onSelect }: { targetDate?: Date; onSelect: (newDate: Date) => void }) => {
  const base = targetDate ?? new Date()
  return (
    <div className="flex items-center gap-1.5 w-[200px] justify-center">
      <FormSelectSimple className="h-8 text-xs min-w-[100px] flex-1" options={MONTH_OPTIONS} value={targetDate ? String(targetDate.getMonth()) : ""} placeholder={t("Mes")} onSelect={(m) => onSelect(setMonth(base, Number(m)))} />
      <FormSelectSimple className="h-8 text-xs min-w-[100px] flex-1" options={YEAR_OPTIONS} value={targetDate ? String(targetDate.getFullYear()) : ""} placeholder={t("Año")} onSelect={(y) => onSelect(setYear(base, Number(y)))} />
    </div>
  )
}

export const DatePicker = memo(({ id, name, mode = "single", variant = "field", value, onChange, placeholder, disabled = false, className, iconSize = 21 }: DatePickerProps) => {
  const isField = variant === "field"
  const presets = useMemo(() => getPresets(), [])

  const { selected, label, parsedFrom, parsedTo } = useMemo(() => {
    if (mode === "single") {
      const d = parseDate(value)
      return { selected: d, label: fmt(d, "/"), parsedFrom: d, parsedTo: undefined }
    }
    const v = value as any
    const from = parseDate(v?.from ?? v?.date_from), to = parseDate(v?.to ?? v?.date_to)
    const f = fmt(from, "/"), t = fmt(to, "/")
    return { selected: { from, to }, label: f ? (!t || f === t ? f : `${f} - ${t}`) : "", parsedFrom: from, parsedTo: to }
  }, [value, mode])

  const [monthDate, setMonthDate] = useState<Date>(() => parsedFrom ?? new Date())

  useEffect(() => { if (parsedFrom) setMonthDate(parsedFrom) }, [parsedFrom])

  const textLabel = isField ? (label || placeholder) : label

  const emit = (val: any, close?: () => void) => {
    if (mode === "single") { onChange?.(fmt(val, "-")); close?.() }
    else { const r = val as DateRange | undefined; onChange?.({ from: fmt(r?.from, "-"), to: fmt(r?.to, "-") }) }
  }

  const handleSelectPairChange = (newDate: Date, isSecond = false) => {
    if (mode === "single") {
      setMonthDate(newDate)
      return emit(newDate)
    }
    if (!isSecond) {
      const nextFrom = startOfMonth(newDate)
      setMonthDate(nextFrom)
      return emit({ from: nextFrom, to: parsedTo && parsedTo >= nextFrom ? parsedTo : endOfMonth(newDate) })
    }
    const nextTo = endOfMonth(newDate)
    emit({ from: parsedFrom && parsedFrom <= nextTo ? parsedFrom : startOfMonth(newDate), to: nextTo })
  }

  return (
    <SmartPopover align="center" trigger={
      <Button id={id} name={name} variant={isField ? "ghost" : "outline"} disabled={disabled} className={cn("cursor-pointer [&_svg]:pointer-events-none transition-colors", 
      isField ? inputStyles("h-9 items-center justify-between px-3 py-1 font-normal hover:bg-transparent", 
      label ? "hover:text-foreground" : "text-muted-foreground") : cn("flex h-9 items-center justify-center shrink-0", textLabel ? "gap-2 px-3" : "w-9 p-0 aspect-square"), className)}>
        {isField ? (<><span className="truncate">{textLabel}</span><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0 text-muted-foreground ml-2" /></>) 
        : (<><CalendarIcon style={{ width: iconSize, height: iconSize }} className="shrink-0" />{textLabel && <span>{textLabel}</span>}</>)}
      </Button>
    }>
      {({ close }) => (
        <div className="flex flex-col sm:flex-row p-1 gap-2">
          {mode === "range" && (
            <div className="flex flex-col gap-1 border-r pr-2 min-w-[130px]">
              {presets.map((p) => {
                const range = p.range()
                const isSelected = selected && (selected as DateRange).from && (selected as DateRange).to && 
                  fmt((selected as DateRange).from) === fmt(range.from) && fmt((selected as DateRange).to) === fmt(range.to)
                return (
                  <Button key={p.label} variant={isSelected ? "secondary" : "ghost"} size="sm" className="justify-start" onClick={() => { if (range.from) setMonthDate(range.from); emit(range, close) }}>
                    {p.label}
                  </Button>
                )
              })}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-around gap-4 px-3 pt-1">
              <SelectPair targetDate={parsedFrom} onSelect={(d) => handleSelectPairChange(d, false)} />
              {mode === "range" && <SelectPair targetDate={parsedTo} onSelect={(d) => handleSelectPairChange(d, true)} />}
            </div>
            <Calendar mode={mode as any} month={monthDate} onMonthChange={setMonthDate} selected={selected} onSelect={(val) => emit(val, close)} disabled={disabled} locale={es} numberOfMonths={mode === "range" ? 2 : 1} pagedNavigation={mode === "range"} fixedWeeks={mode === "single"} />
          </div>
        </div>
      )}
    </SmartPopover>
  )
})

DatePicker.displayName = "DatePicker"
export default DatePicker