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
import InputError from "@/components/input-error"

export interface FieldConfig {
  id?: string; name?: string; label?: string; type?: string; placeholder?: string
  defaultValue?: any; value?: any; disabled?: boolean; required?: boolean
  rows?: number; options?: any[]; accept?: string; description?: string
}

interface FormGroupProps {
  fields?: FieldConfig[]
  errors?: Record<string, string>
  disabled?: boolean
  isReadonly?: boolean
  layout?: "vertical" | "horizontal"
  values?: Record<string, any>
  onChange?: (name: string, value: any) => void
  className?: string
}

const RenderControl = memo(({ field, name, value, disabled, onChange }: { field: FieldConfig; name: string; value: any; disabled: boolean; onChange?: (n: string, v: any) => void }) => {
  const strVal = value instanceof File ? "" : String(value ?? "")
  const isControlled = Boolean(onChange)
  const common = { id: name, name, disabled, required: field.required, placeholder: field.placeholder, ...(isControlled ? { value: strVal } : { defaultValue: strVal }) }

  switch (field.type) {
    case "textarea": return <Textarea {...common} rows={field.rows ?? 3} onChange={onChange ? (e) => onChange(name, e.target.value) : undefined} />
    case "select":
      return Array.isArray(field.options)
        ? <FormSelectSimple {...common} value={strVal} options={field.options} onSelect={(v) => onChange?.(name, v)} />
        : <FormSelectAsync {...common} value={strVal} onSelect={(v) => onChange?.(name, v)} />
    case "date":
      return (
        <><input type="hidden" name={name} value={strVal} />
          <DatePicker value={strVal} disabled={disabled} required={field.required} placeholder={field.placeholder} onChange={(v) => onChange?.(name, v)} />
        </>
      )
    case "time":
      return (
        <><input type="hidden" name={name} value={strVal} />
          <Clock value={strVal} disabled={disabled} required={field.required} placeholder={field.placeholder} onChange={(v) => onChange?.(name, v)} />
        </>
      )
    case "datetime-local": {
      const [dPart = "", tPart = ""] = strVal.split(" ")
      return (
        <><input type="hidden" name={name} value={strVal} />
          <div className="grid grid-cols-2 gap-1.5">
            <DatePicker value={dPart} disabled={disabled} required={field.required} onChange={(d) => onChange?.(name, d ? `${d} ${tPart || "00:00"}` : "")} />
            <Clock value={tPart} disabled={disabled} required={field.required} onChange={(t) => onChange?.(name, dPart ? `${dPart} ${t}` : t)} />
          </div>
        </>
      )
    }
    case "file":
    case "image": return <FormFilePicker id={name} name={name} defaultValue={strVal} accept={field.accept} required={field.required} disabled={disabled} onChange={(e: any) => onChange?.(name, e?.target?.files?.[0] ?? e)} />
    case "color": return <Input {...common} type="color" onChange={onChange ? (e) => onChange(name, e.target.value) : undefined} />
    default: return <Input {...common} type={field.type || "text"} onChange={onChange ? (e) => onChange(name, e.target.value) : undefined} />
  }
})
RenderControl.displayName = "RenderControl"

export const FormGroup = memo(({ fields = [], errors = {}, disabled = false, isReadonly = false, layout = "vertical", values, onChange, className = "space-y-2.5" }: FormGroupProps) => {
  const isHorizontal = layout === "horizontal"
  return (
    <div className={className}>
      {fields.map((field) => {
        const name = field.name ?? field.id ?? ""
        const isDisabled = disabled || isReadonly || field.disabled
        const val = values ? (values[name] ?? field.defaultValue ?? "") : (field.value ?? field.defaultValue ?? "")
        const error = errors[name]

        if (field.type === "hidden") return <input key={name} type="hidden" id={name} name={name} value={String(val)} />

        const isCheckbox = field.type === "checkbox"
        const isChecked = isCheckbox && Boolean(val === 1 || val === "1" || val === true || val === "true")

        return (
          <div key={name} className={isHorizontal ? "grid grid-cols-12 items-center gap-2" : "grid gap-1"}>
            <Label className={`flex items-center gap-1 text-sm font-medium leading-tight select-none cursor-default ${isHorizontal ? "col-span-5 text-left justify-start" : ""}`} title={field.label}>
              <span className="line-clamp-2">{field.label}</span>
              {field.required && <span className="text-red-500 font-bold shrink-0">*</span>}
            </Label>
            <div className={isHorizontal ? "col-span-7 space-y-1" : "space-y-1"}>
              {isCheckbox ? (
                <div className="flex items-center space-x-2">
                  <input type="hidden" name={name} value={isChecked ? 1 : 0} />
                  <Checkbox id={name} required={field.required} {...(onChange ? { checked: isChecked } : { defaultChecked: isChecked })} disabled={isDisabled} onCheckedChange={(v) => onChange?.(name, v ? 1 : 0)} />
                </div>
              ) : (
                <RenderControl field={field} name={name} value={val} disabled={Boolean(isDisabled)} onChange={onChange} />
              )}
              {field.description && <p className="text-[11px] text-muted-foreground">{field.description}</p>}
              {error && <InputError message={error} />}
            </div>
          </div>
        )
      })}
    </div>
  )
})
FormGroup.displayName = "FormGroup"