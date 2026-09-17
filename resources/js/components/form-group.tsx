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
  min?: number | string; max?: number | string
  minLength?: number; maxLength?: number
  minlength?: number; maxlength?: number
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

const NATIVE_INPUTS = new Set(["text", "textarea", "file", "email", "password", "number", "tel", "url", "color"])

const RenderControl = memo(({ field, name, value, disabled, onChange }: { field: FieldConfig; name: string; value: any; disabled: boolean; onChange?: (n: string, v: any) => void }) => {
  const isFile = field.type === "file"
  const strVal = value instanceof File ? "" : String(value ?? "")
  const isControlled = Boolean(onChange)
  const handleChange = onChange ? (v: any) => {
    if (typeof v === "boolean") return onChange(name, v ? 1 : 0)
    onChange(name, v?.target ? (v.target.files?.[0] ?? v.target.value) : v)
  } : undefined

  const common = {
    id: name, name, disabled, required: field.required, placeholder: field.placeholder,
    onChange: handleChange, onSelect: handleChange, className: "text-sm",
    minLength: field.minLength ?? field.minlength, maxLength: field.maxLength ?? field.maxlength,
    ...(isFile ? { defaultValue: typeof value === "string" ? value : undefined } : isControlled ? { value: strVal } : { defaultValue: strVal })
  }

  switch (field.type) {
    case "checkbox": return <Checkbox id={name} disabled={disabled} required={field.required} onCheckedChange={handleChange} {...(isControlled ? { checked: Number(value) === 1 } : { defaultChecked: Number(value) === 1 })} />
    case "textarea": return <Textarea {...common} rows={field.rows ?? 3} />
    case "select": {
      const Select = field.options?.length ? FormSelectSimple : FormSelectAsync
      return <Select {...common} options={field.options} />
    }
    case "date": return <DatePicker {...common} />
    case "time": return <Clock {...common} />
    case "datetime-local": {
      const [d = "", t = ""] = strVal.split(" ")
      return (
        <div className="grid grid-cols-2 gap-1.5">
          <DatePicker id={`${name}-date`} className="text-sm h-9" disabled={disabled} required={field.required} value={d} onChange={(v: any) => handleChange?.(`${v || d} ${t || "00:00"}`.trim())} />
          <Clock id={`${name}-time`} className="text-sm h-9" disabled={disabled} required={field.required} value={t} onChange={(v: any) => handleChange?.(`${d || "0000-00-00"} ${v || t}`.trim())} />
        </div>
      )
    }
    case "file": return <FormFilePicker {...common} accept={field.accept} />
    case "color": return <Input {...common} type="color" className="text-sm h-9 p-1 cursor-pointer" />
    default: return <Input {...common} type={field.type || "text"} min={field.min} max={field.max} />
  }
})
RenderControl.displayName = "RenderControl"

export const FormGroup = memo(({ fields = [], errors = {}, disabled = false, isReadonly = false, layout = "vertical", values, onChange, className = "space-y-2.5" }: FormGroupProps) => {
  const isHorizontal = layout === "horizontal"

  return (
    <div className={className}>
      {fields.map((field) => {
        const name = field.name ?? field.id ?? ""
        const val = (values ? values[name] : field.value) ?? field.defaultValue ?? ""
        if (field.type === "hidden") return <input key={name} type="hidden" id={name} name={name} value={String(val)} />

        const fieldType = field.type || "text"
        const isCheckbox = fieldType === "checkbox"
        const isDisabled = Boolean(disabled || isReadonly || field.disabled)
        const error = errors[name]
        const targetId = fieldType === "datetime-local" ? `${name}-date` : name

        const labelNode = (
          <Label id={`label-${name}`} name={name} htmlFor={targetId} title={field.label}
            className={`flex items-center gap-1 font-medium text-sm select-none cursor-pointer ${!isCheckbox && isHorizontal ? "col-span-5 text-left justify-start line-clamp-2" : ""}`}>
            <span>{field.label}</span> {field.required && <span className="text-red-500 font-bold shrink-0">*</span>}
          </Label>
        )

        const controlNode = <RenderControl field={field} name={name} value={val} disabled={isDisabled} onChange={onChange} />
        const metaNode = (field.description || error) ? (
          <div className="space-y-1">
            {field.description && <p className="text-[11px] text-muted-foreground">{field.description}</p>}
            {error && <InputError message={error} />}
          </div>
        ) : null

        return (
          <div key={name} className={isCheckbox ? "space-y-1 py-0.5" : isHorizontal ? "grid grid-cols-12 items-center gap-2" : "grid gap-1"}>
            {!NATIVE_INPUTS.has(fieldType) && <input type="hidden" name={name} value={isCheckbox ? (Number(val) === 1 ? 1 : 0) : String(val ?? "")} />}
            {isCheckbox ? (
              <div className="flex items-center gap-2">
                {labelNode}
                {controlNode}
              </div>
            ) : (
              <>
                {labelNode}
                <div className={isHorizontal ? "col-span-7 space-y-1" : "space-y-1"}>
                  {controlNode}
                  {metaNode}
                </div>
              </>
            )}
            {isCheckbox && metaNode}
          </div>
        )
      })}
    </div>
  )
})
FormGroup.displayName = "FormGroup"
export default FormGroup