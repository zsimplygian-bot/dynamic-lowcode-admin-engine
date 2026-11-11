import { memo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSelectAsync } from "@/components/form-select-async"
import { FormSelectSimple } from "@/components/form-select-simple"
import { DatePicker } from "@/components/date-picker"
import { Clock } from "@/components/ui/clock"
import { FormFilePicker } from "@/components/form-file-picker"
import { ColorInput } from "@/components/ui/color-input"
import InputError from "@/components/input-error"
import { cn } from "@/lib/utils"
export interface FieldConfig {
  id?: string; name?: string; label?: string; type?: string; placeholder?: string; defaultValue?: any; disabled?: boolean; hidden?: boolean; readonly?: boolean; required?: boolean; rows?: number; options?: any[]; accept?: string; description?: string; min?: number | string; max?: number | string; minLength?: number; maxLength?: number; render?: (props: { value: any; onChange: (v: any) => void; disabled: boolean; field: FieldConfig }) => React.ReactNode
}
export interface FormGroupProps {
  fields?: FieldConfig[]; values?: Record<string, any>; errors?: Record<string, string>; disabled?: boolean; isReadonly?: boolean; layout?: "vertical" | "horizontal"; className?: string; onChange?: (name: string, value: any) => void
}
const renderControl = (f: FieldConfig, val: any, disabled: boolean, onChange?: (name: string, value: any) => void) => {
  const name = f.name || f.id || "", set = (v: any) => onChange?.(name, v), isFieldDisabled = disabled || Boolean(f.disabled || f.readonly)
  const base = { id: name, name, disabled: isFieldDisabled, tabIndex: isFieldDisabled ? -1 : undefined, required: f.required, placeholder: f.placeholder, className: "text-sm" }
  if (f.render) return f.render({ value: val, onChange: set, disabled: base.disabled, field: f })
  switch (f.type) {
    case "checkbox": return <Checkbox {...base} checked={Boolean(val)} onCheckedChange={(c) => set(c ? 1 : 0)} />
    case "textarea": return <Textarea {...base} value={val ?? ""} rows={f.rows ?? 3} onChange={(e) => set(e.target.value)} />
    case "select": { const Comp = f.options?.length ? FormSelectSimple : FormSelectAsync; return <Comp {...base} value={val} options={f.options} onChange={set} onSelect={set} /> }
    case "date": return <DatePicker {...base} value={val} onChange={set} />
    case "time": return <Clock {...base} value={val} onChange={set} />
    case "datetime-local": {
      const [d = "", t = ""] = String(val ?? "").split(" ")
      return (
        <div className="grid grid-cols-2 gap-1.5">
          <DatePicker {...base} id={`${name}-date`} value={d} onChange={(v) => set(`${v || d} ${t || "00:00"}`.trim())} />
          <Clock {...base} id={`${name}-time`} value={t} onChange={(v) => set(`${d || "0000-00-00"} ${v}`.trim())} />
        </div>
      )
    }
    case "file": return <FormFilePicker {...base} value={val} accept={f.accept} onChange={set} />
    case "color": return <ColorInput {...base} value={val ?? ""} onChange={set} />
    default: return <Input {...base} type={f.type || "text"} value={val ?? ""} min={f.min} max={f.max} minLength={f.minLength} maxLength={f.maxLength} onChange={(e) => set(e.target.value)} />
  }
}
export const FormGroup = memo(({ fields = [], values = {}, errors = {}, disabled = false, isReadonly = false, layout = "vertical", className, onChange }: FormGroupProps) => {
  const isDisabled = disabled || isReadonly, isHorizontal = layout === "horizontal"
  return (
    <div className={cn("space-y-2", className)}>
      {fields.map((f) => {
        const name = f.name || f.id || "", val = values[name] ?? f.defaultValue ?? ""
        if (f.type === "hidden" || f.hidden) return <input key={name} type="hidden" id={name} name={name} value={val} />
        return (
          <div key={name} className={cn("grid gap-1", isHorizontal && "grid-cols-12 items-center gap-2")}>
            {f.label && (
              <Label htmlFor={name} title={f.label} className={cn("text-sm font-medium select-none", isHorizontal && "col-span-5 line-clamp-2")}>
                {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>
            )}
            <div className={cn("space-y-1", isHorizontal && "col-span-7")}>
              {renderControl(f, val, isDisabled, onChange)}
              {f.description && <p className="text-[10px] text-muted-foreground">{f.description}</p>}
              {errors[name] && <InputError message={errors[name]} />}
            </div>
          </div>
        )
      })}
    </div>
  )
})
export default FormGroup