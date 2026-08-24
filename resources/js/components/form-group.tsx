import { memo, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSelectAsync } from "@/components/form-select-async"
import { FormSelectSimple } from "@/components/form-select-simple"
import { DatePicker } from "@/components/ui/datepicker"
import { Clock } from "@/components/ui/clock"
import { FormImagePicker } from "@/components/form-image-picker"
import InputError from "@/components/input-error"

const FieldRenderer = memo(({ field, error, value, isReadonly, onChange }: any) => {
  const name = field.name ?? field.id
  const disabled = field.disabled || isReadonly

  const fieldValue = value !== undefined && value !== null && value !== "" ? value : (field.defaultValue ?? field.value ?? "")

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(name, e.target.value)
  }, [name, onChange])

  const handleDateChange = useCallback((dateStr: string) => {
    const timePart = typeof fieldValue === "string" && fieldValue.includes(" ") ? fieldValue.split(" ")[1] : "00:00"
    onChange?.(name, dateStr ? `${dateStr} ${timePart}` : "")
  }, [name, fieldValue, onChange])

  const handleTimeChange = useCallback((timeStr: string) => {
    const datePart = typeof fieldValue === "string" && fieldValue.includes(" ") ? fieldValue.split(" ")[0] : fieldValue || ""
    onChange?.(name, datePart ? `${datePart} ${timeStr}` : timeStr)
  }, [name, fieldValue, onChange])

  if (field.type === "hidden") {
    return <Input {...{ type: "hidden", id: field.id, name, value: String(fieldValue) }} />
  }

  if (field.type === "checkbox") {
    const isChecked = fieldValue === true || fieldValue === "1" || fieldValue === 1
    return (
      <div {...{ className: "grid gap-1.5" }}>
        <div {...{ className: "flex items-center space-x-2 pt-1" }}>
          <Input {...{ type: "hidden", name, value: isChecked ? "1" : "0" }} />
          <Checkbox {...{ id: field.id, defaultChecked: isChecked, disabled, onCheckedChange: (checked) => onChange?.(name, checked ? "1" : "0") }} />
          <Label {...{ htmlFor: field.id, className: "cursor-pointer text-sm font-medium flex items-center gap-1" }}>
            {field.label}
            {field.required && <span {...{ className: "text-red-500 font-bold" }}>*</span>}
          </Label>
        </div>
        {error && <InputError {...{ message: error }} />}
      </div>
    )
  }

  const [dateVal = "", timeVal = ""] = typeof fieldValue === "string" && fieldValue.includes(" ") ? fieldValue.split(" ") : [String(fieldValue ?? ""), ""]

  const hasStaticOptions = Array.isArray(field.options) && field.options.length > 0

  return (
    <div {...{ className: "grid gap-1.5" }}>
      <Label {...{ htmlFor: field.id, className: "flex items-center gap-1 text-sm font-medium" }}>
        {field.label}
        {field.required && <span {...{ className: "text-red-500 font-bold" }}>*</span>}
      </Label>

      {field.type === "textarea" ? (
        <Textarea {...{ id: field.id, name, value: String(fieldValue), placeholder: field.placeholder, disabled, rows: field.rows ?? 3, onChange: handleInputChange }} />
      ) : field.type === "select" ? (
        hasStaticOptions ? (
          <FormSelectSimple {...{ id: field.id, name, value: String(fieldValue), disabled, options: field.options, placeholder: field.placeholder, onSelect: (val) => onChange?.(name, val) }} />
        ) : (
          <FormSelectAsync {...{ id: field.id, name, value: String(fieldValue), disabled, lista: field.lista, placeholder: field.placeholder, onSelect: (val) => onChange?.(name, val) }} />
        )
      ) : field.type === "date" ? (
        <>
          <Input {...{ type: "hidden", name, value: String(fieldValue) }} />
          <DatePicker {...{ value: String(fieldValue), disabled, placeholder: field.placeholder, onChange: (val) => onChange?.(name, val) }} />
        </>
      ) : field.type === "time" ? (
        <>
          <Input {...{ type: "hidden", name, value: String(fieldValue) }} />
          <Clock {...{ value: String(fieldValue), disabled, placeholder: field.placeholder ?? "00:00", onChange: (val) => onChange?.(name, val) }} />
        </>
      ) : field.type === "datetime-local" ? (
        <>
          <Input {...{ type: "hidden", name, value: String(fieldValue) }} />
          <div {...{ className: "grid grid-cols-2 gap-2" }}>
            <DatePicker {...{ value: dateVal, disabled, placeholder: "-", onChange: handleDateChange }} />
            <Clock {...{ value: timeVal, disabled, placeholder: "Hora", onChange: handleTimeChange }} />
          </div>
        </>
      ) : field.type === "file" || field.type === "image" ? (
        <FormImagePicker {...{ id: field.id, name, defaultValue: String(fieldValue), accept: field.accept, disabled, onChange: (e) => onChange?.(name, e.target.files?.[0]) }} />
      ) : (
        <Input {...{ id: field.id, name, type: field.type || "text", value: String(fieldValue), placeholder: field.placeholder, disabled, onChange: handleInputChange }} />
      )}

      {error && <InputError {...{ message: error }} />}
    </div>
  )
})
FieldRenderer.displayName = "FieldRenderer"

export const FormGroup = memo(({ fields, errors = {}, values = {}, isReadonly = false, onChange }: any) => (
  <div {...{ className: "space-y-4" }}>
    {fields.map((field: any) => {
      const name = field.name ?? field.id
      const val = values[name] ?? field.defaultValue ?? field.value ?? ""
      return <FieldRenderer {...{ key: name, field, error: errors[name], value: val, isReadonly, onChange }} />
    })}
  </div>
))
FormGroup.displayName = "FormGroup"