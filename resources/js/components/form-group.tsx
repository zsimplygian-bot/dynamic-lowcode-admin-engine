import { memo, useEffect } from "react"
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

export interface FieldConfig {
  id?: string; name?: string; label?: string; type?: string; placeholder?: string
  defaultValue?: any; value?: any; disabled?: boolean; hidden?: boolean; required?: boolean
  rows?: number; options?: any[]; accept?: string; description?: string
  min?: number | string; max?: number | string
  minLength?: number; maxLength?: number; minlength?: number; maxlength?: number
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

export const FormGroup = memo(({ fields = [], errors = {}, disabled = false, isReadonly = false, layout = "vertical", values, onChange, className = "space-y-2.5" }: FormGroupProps) => {
  const isHorizontal = layout === "horizontal"
  const isControlled = Boolean(onChange)

  useEffect(() => {
    if (!onChange || !values) return
    fields.forEach((f) => {
      const name = f.name ?? f.id ?? ""
      if (name && f.defaultValue !== undefined && values[name] === undefined) {
        onChange(name, f.defaultValue)
      }
    })
  }, [values, fields, onChange])

  return (
    <div className={className}>
      {fields.map((field) => {
        const name = field.name ?? field.id ?? ""
        const rawOverride = values ? values[name] : undefined
        const isObjOverride = rawOverride && typeof rawOverride === "object" && !(rawOverride instanceof File)

        const f = isObjOverride ? { ...field, ...rawOverride } : field
        const val = (isObjOverride ? rawOverride.value : rawOverride) ?? field.defaultValue ?? ""

        if (f.type === "hidden" || f.hidden) return <input key={name} type="hidden" id={name} name={name} value={String(val)} />

        const isFile = f.type === "file"
        const strVal = val instanceof File ? "" : String(val ?? "")
        const isDisabled = Boolean(disabled || isReadonly || f.disabled)

        const handleChange = onChange ? (v: any) => {
          const nextVal = typeof v === "boolean" ? (v ? 1 : 0) : (v?.target ? (v.target.files?.[0] ?? v.target.value) : v)
          onChange(name, isObjOverride ? { ...rawOverride, value: nextVal } : nextVal)
        } : undefined

        const common = { id: name, name, disabled: isDisabled, required: f.required, placeholder: f.placeholder, onChange: handleChange, onSelect: handleChange, className: "text-sm",
          minLength: f.minLength ?? f.minlength, maxLength: f.maxLength ?? f.maxlength,
          ...(isFile ? { defaultValue: typeof val === "string" ? val : undefined } : isControlled ? { value: strVal } : { defaultValue: strVal })
        }

        return (
          <div key={name} className={isHorizontal ? "grid grid-cols-12 items-center gap-2" : "grid gap-1"}>
            <Label id={`label-${name}`} title={f.label} className={`flex items-center gap-1 font-medium text-sm select-none pointer-events-none ${isHorizontal ? "col-span-5 text-left justify-start line-clamp-2" : ""}`}>
              <span>{f.label}</span> {f.required && <span className="text-red-500 font-bold shrink-0">*</span>}
            </Label>
            <div className={isHorizontal ? "col-span-7 space-y-1" : "space-y-1"}>
              {(() => {
                switch (f.type) {
                  case "checkbox": return <Checkbox id={name} disabled={isDisabled} required={f.required} onCheckedChange={handleChange} {...(isControlled ? { checked: Number(val) === 1 } : { defaultChecked: Number(val) === 1 })} />
                  case "textarea": return <Textarea {...common} rows={f.rows ?? 3} />
                  case "select": return f.options?.length ? <FormSelectSimple {...common} options={f.options} /> : <FormSelectAsync {...common} options={f.options} />
                  case "date": return <DatePicker {...common} />
                  case "time": return <Clock {...common} />
                  case "datetime-local": {
                    const [d = "", t = ""] = strVal.split(" ")
                    return (
                      <div className="grid grid-cols-2 gap-1.5">
                        <DatePicker id={`${name}-date`} className="text-sm" disabled={isDisabled} required={f.required} value={d} onChange={(v: any) => handleChange?.(`${v || d} ${t || "00:00"}`.trim())} />
                        <Clock id={`${name}-time`} className="text-sm" disabled={isDisabled} required={f.required} value={t} onChange={(v: any) => handleChange?.(`${d || "0000-00-00"} ${v || t}`.trim())} />
                      </div>
                    )
                  }
                  case "file": return <FormFilePicker {...common} accept={f.accept} />
                  case "color": return <ColorInput {...common} value={strVal} />
                  default: return <Input {...common} type={f.type || "text"} min={f.min} max={f.max} />
                }
              })()}
              {(f.description || errors[name]) && (
                <div className="space-y-1">
                  {f.description && <p className="text-[11px] text-muted-foreground">{f.description}</p>}
                  {errors[name] && <InputError message={errors[name]} />}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})
FormGroup.displayName = "FormGroup"
export default FormGroup