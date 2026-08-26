import { memo, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSelectAsync } from "@/components/form-select-async"
import { FormSelectSimple } from "@/components/form-select-simple"
import { DatePicker } from "@/components/ui/datepicker"
import { Clock } from "@/components/ui/clock"
import { FormFilePicker } from "@/components/form-file-picker"
import InputError from "@/components/input-error"

const EMPTY_OBJECT = Object.freeze({})

const FieldRenderer = memo(({ field, error, value, isReadonly, layout = "vertical", onChange }: any) => {
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

  const isHorizontal = layout === "horizontal"

  if (field.type === "checkbox") {
    const isChecked = fieldValue === true || fieldValue === "1" || fieldValue === 1
    return (
      <div {...{ className: isHorizontal ? "grid grid-cols-3 items-center gap-2" : "grid gap-1.5" }}>
        {isHorizontal && <div {...{ className: "col-span-1" }} />}
        <div {...{ className: `flex items-center space-x-2 pt-1 ${isHorizontal ? "col-span-2" : ""}` }}>
          <Input {...{ type: "hidden", name, value: isChecked ? "1" : "0" }} />
          <Checkbox {...{ id: field.id, defaultChecked: isChecked, disabled, onCheckedChange: (v) => onChange?.(name, v ? "1" : "0") }} />
          <Label {...{ htmlFor: field.id, className: "cursor-pointer text-sm font-medium flex items-center gap-1" }}>
            {field.label}
            {field.required && <span {...{ className: "text-red-500 font-bold" }}>*</span>}
          </Label>
        </div>
        {error && <InputError {...{ message: error }} />}
      </div>
    )
  }

  const strVal = String(fieldValue ?? "")
  let inputControl: React.ReactNode

  switch (field.type) {
    case "textarea":
      inputControl = <Textarea {...{ id: field.id, name, value: strVal, placeholder: field.placeholder, disabled, rows: field.rows ?? 3, onChange: handleInputChange }} />
      break
    case "select":
      inputControl = Array.isArray(field.options) && field.options.length > 0 ? (
        <FormSelectSimple {...{ id: field.id, name, value: strVal, disabled, options: field.options, placeholder: field.placeholder, onSelect: (v) => onChange?.(name, v) }} />
      ) : (
        <FormSelectAsync {...{ id: field.id, name, value: strVal, disabled, lista: field.lista, placeholder: field.placeholder, onSelect: (v) => onChange?.(name, v) }} />
      )
      break
    case "date":
      inputControl = (
        <>
          <Input {...{ type: "hidden", name, value: strVal }} />
          <DatePicker {...{ value: strVal, disabled, placeholder: field.placeholder, onChange: (v) => onChange?.(name, v) }} />
        </>
      )
      break
    case "time":
      inputControl = (
        <>
          <Input {...{ type: "hidden", name, value: strVal }} />
          <Clock {...{ value: strVal, disabled, placeholder: field.placeholder ?? "00:00", onChange: (v) => onChange?.(name, v) }} />
        </>
      )
      break
    case "datetime-local": {
      const parts = strVal.split(" ")
      inputControl = (
        <>
          <Input {...{ type: "hidden", name, value: strVal }} />
          <div {...{ className: "grid grid-cols-2 gap-2" }}>
            <DatePicker {...{ value: parts[0] || "", disabled, placeholder: "-", onChange: handleDateChange }} />
            <Clock {...{ value: parts[1] || "", disabled, placeholder: "Hora", onChange: handleTimeChange }} />
          </div>
        </>
      )
      break
    }
    case "file":
    case "image":
      inputControl = <FormFilePicker {...{ id: field.id, name, type: field.type, defaultValue: strVal, accept: field.accept, disabled, onChange: (e) => onChange?.(name, e.target.files?.[0]) }} />
      break
    default:
      inputControl = <Input {...{ id: field.id, name, type: field.type || "text", value: strVal, placeholder: field.placeholder, disabled, onChange: handleInputChange }} />
  }

  return (
    <div {...{ className: isHorizontal ? "grid grid-cols-3 items-center gap-2" : "grid gap-1" }}>
      <Label {...{ htmlFor: field.id, className: `flex items-center gap-1 text-sm font-medium ${isHorizontal ? "col-span-1 text-right justify-end" : ""}` }}>
        {field.label}
        {field.required && <span {...{ className: "text-red-500 font-bold" }}>*</span>}
      </Label>
      <div {...{ className: isHorizontal ? "col-span-2 space-y-1" : "" }}>
        {inputControl}
        {error && <InputError {...{ message: error }} />}
      </div>
    </div>
  )
}, (prevProps, nextProps) => (
  prevProps.field === nextProps.field &&
  prevProps.error === nextProps.error &&
  prevProps.value === nextProps.value &&
  prevProps.isReadonly === nextProps.isReadonly &&
  prevProps.layout === nextProps.layout &&
  prevProps.onChange === nextProps.onChange
))
FieldRenderer.displayName = "FieldRenderer"

export const FormGroup = memo(({ fields, errors = EMPTY_OBJECT, values = EMPTY_OBJECT, isReadonly = false, layout = "vertical", onChange }: any) => (
  <div {...{ className: "space-y-3" }}>
    {fields.map((field: any) => {
      const name = field.name ?? field.id
      return <FieldRenderer {...{ key: name, field, error: errors[name], value: values[name], isReadonly, layout, onChange }} />
    })}
  </div>
))
FormGroup.displayName = "FormGroup"