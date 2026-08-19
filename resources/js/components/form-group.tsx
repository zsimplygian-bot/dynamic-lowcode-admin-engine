import React, { memo, useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FormSelectAsync } from "@/components/form-select-async"
import { FormImagePicker } from "@/components/form-image-picker"
import InputError from "@/components/input-error"
import { DatePicker } from "@/components/ui/datepicker"
import { Clock } from "lucide-react"

export interface FieldConfig {
  id: string
  name?: string
  label: string
  type?: "text" | "number" | "email" | "password" | "select" | "textarea" | "checkbox" | "date" | "time" | "file" | "image" | "hidden" | string
  defaultValue?: string | number | boolean
  placeholder?: string
  required?: boolean
  lista?: string
  rows?: number
  disabled?: boolean
  accept?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

interface FormGroupProps {
  fields: FieldConfig[]
  errors?: Record<string, string | undefined>
  values?: Record<string, any>
  onChange?: (e: any) => void
}

const DateFieldControl = memo(({ id, name, strVal, placeholder, disabled, onChange }: { id: string; name: string; strVal: string; placeholder?: string; disabled?: boolean; onChange?: (e: any) => void }) => {
  const [currentVal, setCurrentVal] = useState<string>(strVal)

  const handleDateChange = useCallback((val: string) => {
    const newVal = val || ""
    setCurrentVal(newVal)
    if (onChange) onChange({ target: { name, value: newVal } })
  }, [name, onChange])

  return (
    <React.Fragment key={`date-group-${id}`}>
      <Input { ...{ type: "hidden", name, value: currentVal } } />
      <DatePicker { ...{ id, value: currentVal, onChange: handleDateChange, placeholder, disabled } } />
    </React.Fragment>
  )
})
DateFieldControl.displayName = "DateFieldControl"

const renderControl = (field: FieldConfig, value: any, globalOnChange?: (e: any) => void) => {
  const { id, name = id, type = "text", rows = 3, placeholder, disabled, lista, accept, onChange: fieldOnChange, defaultValue, label, required } = field
  const currentVal = value ?? defaultValue ?? ""

  const handleChange = (e: any) => {
    if (fieldOnChange) fieldOnChange(e)
    if (globalOnChange) globalOnChange(e)
  }

  switch (type) {
    case "textarea": return <Textarea { ...{ id, name, value: String(currentVal), onChange: handleChange, placeholder, rows, disabled } } />
    case "select": return <FormSelectAsync { ...{ id, name, value: String(currentVal), onSelect: (val) => handleChange({ target: { name, value: val } }), lista, placeholder, disabled } } />
    case "file":
    case "image": return <FormImagePicker { ...{ id, name, defaultValue: String(currentVal), accept, disabled, onChange: handleChange } } />
    case "date": return <DateFieldControl { ...{ id, name, strVal: String(currentVal), placeholder, disabled, onChange: handleChange } } />
    case "time": return (
      <div { ...{ className: "relative flex items-center" } }>
        <Input { ...{ id, name, type: "time", value: String(currentVal), onChange: handleChange, placeholder, disabled, className: "pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0" } } />
        <Clock { ...{ className: "absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none" } } />
      </div>
    )
    case "checkbox": return (
      <div { ...{ className: "flex items-center space-x-2 pt-1" } }>
        <Input { ...{ type: "hidden", name, value: currentVal ? "1" : "0" } } />
        <Checkbox { ...{ id, checked: Boolean(currentVal), onCheckedChange: (checked) => handleChange({ target: { name, value: checked ? "1" : "0" } }), disabled } } />
        <Label { ...{ htmlFor: id, className: "cursor-pointer text-sm font-medium flex items-center gap-1" } }>
          {label}
          {required && <span { ...{ className: "text-red-500 font-bold" } }>*</span>}
        </Label>
      </div>
    )
    default: return <Input { ...{ id, name, type, value: String(currentVal), onChange: handleChange, placeholder, disabled } } />
  }
}

const FormFieldItem = memo(({ field, error, value, onChange }: { field: FieldConfig; error?: string; value?: any; onChange?: (e: any) => void }) => {
  const { id, label, type = "text", required, defaultValue, name = id } = field
  const currentVal = value ?? defaultValue ?? ""

  if (type === "hidden") return <Input { ...{ type: "hidden", id, name, value: String(currentVal) } } />

  return (
    <div { ...{ className: "grid gap-1.5" } }>
      {type !== "checkbox" && (
        <Label { ...{ htmlFor: id, className: "flex items-center gap-1 text-sm font-medium" } }>
          {label}
          {required && <span { ...{ className: "text-red-500 font-bold" } }>*</span>}
        </Label>
      )}
      {renderControl(field, currentVal, onChange)}
      {error && <InputError { ...{ className: "mt-1", message: error } } />}
    </div>
  )
})
FormFieldItem.displayName = "FormFieldItem"

export const FormGroup: React.FC<FormGroupProps> = ({ fields, errors = {}, values = {}, onChange }) => (
  <div { ...{ className: "space-y-4" } }>
    {fields.map((field) => {
      const fieldKey = field.name ?? field.id
      return <FormFieldItem key={field.id} { ...{ field, error: errors[fieldKey], value: values[fieldKey], onChange } } />
    })}
  </div>
)