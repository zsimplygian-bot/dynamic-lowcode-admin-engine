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
  id?: string; name?: string; label?: string; type?: string; placeholder?: string
  defaultValue?: any; disabled?: boolean; hidden?: boolean; required?: boolean
  rows?: number; options?: any[]; accept?: string; description?: string
  min?: number | string; max?: number | string
  minLength?: number; maxLength?: number; minlength?: number; maxlength?: number
  render?: (props: { value: any; onChange: (v: any) => void; disabled: boolean; field: FieldConfig }) => React.ReactNode
}
export interface FormGroupProps {
  fields?: FieldConfig[]; values?: Record<string, any>; errors?: Record<string, string>
  disabled?: boolean; isReadonly?: boolean; layout?: "vertical" | "horizontal"
  className?: string; onChange?: (name: string, value: any) => void
}
const renderControl = (f: FieldConfig, val: any, disabled: boolean, onChange?: (name: string, value: any) => void) => {
  const name = f.name ?? f.id ?? ""
  const set = (v: any) => onChange?.(name, v)
  const base = { id: name, name, disabled, required: f.required, placeholder: f.placeholder, className: "text-sm" }
  if (f.render) return f.render({ value: val, onChange: set, disabled, field: f })
  switch (f.type) {
    case "checkbox": return <Checkbox {...base} checked={val === 1} onCheckedChange={(c) => set(c ? 1 : 0)} />
    case "textarea": return <Textarea {...base} value={val ?? ""} rows={f.rows ?? 3} onChange={(e) => set(e.target.value)} />
    case "select": {
      const Comp = f.options?.length ? FormSelectSimple : FormSelectAsync
      return <Comp {...base} value={val} options={f.options} onChange={set} onSelect={set} />
    }
    case "date": return <DatePicker {...base} value={val} onChange={set} />
    case "time": return <Clock {...base} value={val} onChange={set} />
    case "datetime-local": {
      const [d = "", t = ""] = String(val ?? "").split(" ")
      return (
        <div className="grid grid-cols-2 gap-1.5">
          <DatePicker {...base} id={`${name}-date`} value={d} onChange={(v) => set(`${v || d} ${t || "00:00"}`.trim())} />
          <Clock {...base} id={`${name}-time`} value={t} onChange={(v) => set(`${d || "0000-00-00"} ${v || t}`.trim())} />
        </div>
      )
    }
    case "file": return <FormFilePicker {...base} value={val} accept={f.accept} onChange={set} />
    case "color": return <ColorInput {...base} value={val ?? ""} onChange={set} />
    default: return <Input {...base} type={f.type || "text"} value={val ?? ""} min={f.min} max={f.max} onChange={(e) => set(e.target.value)} />
  }
}
export const FormGroup = memo(({ fields = [], values = {}, errors = {}, disabled = false, isReadonly = false, layout = "vertical", className = "space-y-2.5", onChange }: FormGroupProps) => {
  const isHorizontal = layout === "horizontal"
  const isDisabled = disabled || isReadonly
  return (
    <div className={className}>
      {fields.map((f) => {
        const name = f.name ?? f.id ?? ""
        const val = values[name] ?? f.defaultValue
        if (f.type === "hidden" || f.hidden) return <input key={name} type="hidden" id={name} name={name} value={val ?? ""} />
        return (
          <div key={name} className={isHorizontal ? "grid grid-cols-12 items-center gap-2" : "grid gap-1"}>
            {f.label && (
              <Label htmlFor={name} title={f.label} className={cn("flex items-center gap-1 font-medium text-sm select-none", isHorizontal && "col-span-5 text-left justify-start line-clamp-2")}>
                <span>{f.label}</span> {f.required && <span className="text-red-500 font-bold shrink-0">*</span>}
              </Label>
            )}
            <div className={isHorizontal ? "col-span-7 space-y-1" : "space-y-1"}>
              {renderControl(f, val, isDisabled || Boolean(f.disabled), onChange)}
              {f.description && <p className="text-[11px] text-muted-foreground">{f.description}</p>}
              {errors[name] && <InputError message={errors[name]} />}
            </div>
          </div>
        )
      })}
    </div>
  )
})
FormGroup.displayName = "FormGroup"
export default FormGroup