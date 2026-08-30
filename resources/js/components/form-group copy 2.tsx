import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock } from "@/components/ui/clock"
import { DatePicker } from "@/components/date-picker"
import { FormSelectAsync } from "@/components/form-select-async"
import { FormFilePicker } from "@/components/form-file-picker"
import { Checkbox } from "@/components/ui/checkbox"
import InputError from "@/components/input-error"
const renderControl = (field: any, name: string, isDisabled: boolean) => {
  const commonProps = {
    id: name,
    name,
    placeholder: field.placeholder,
    defaultValue: field.defaultValue,
    disabled: isDisabled,
    required: field.required,
  }
  switch (field.type) {
    case "textarea":
      return <Textarea {...commonProps} rows={field.rows ?? 3} />
    case "time":
      return <Clock {...commonProps} />
    case "date":
      return <DatePicker name={name} value={field.defaultValue} placeholder={field.placeholder} disabled={isDisabled} />
    case "datetime-local":
      return (
        <div className="grid grid-cols-2 gap-2">
          <DatePicker name={name} value={field.defaultValue?.split(" ")[0]} placeholder={field.placeholder} disabled={isDisabled} />
          <Clock id={`${name}_time`} name={`${name}_time`} placeholder="00:00" defaultValue={field.defaultValue?.split(" ")[1]} disabled={isDisabled} required={field.required} />
        </div>
      )
    case "select":
      return <FormSelectAsync {...commonProps} lista={field.lista} />
    case "file":
    case "image":
      return <FormFilePicker {...commonProps} type={field.type} accept={field.accept} />
    default:
      return <Input {...commonProps} type={field.type || "text"} />
  }
}
export const FormGroup = ({ fields = [], errors = {}, disabled = false }: any) => {
  return (
    <div className="space-y-3">
      {fields.map((field: any) => {
        const name = field.name ?? field.id
        const isDisabled = disabled || field.disabled
        if (field.type === "hidden") {
          return <Input key={name} id={name} name={name} type="hidden" defaultValue={field.defaultValue} />
        }
        if (field.type === "checkbox") {
          return (
            <div key={name} className="grid gap-1">
              <div className="flex items-center space-x-2 py-1">
                <Label htmlFor={name} className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Checkbox id={name} name={name} defaultChecked={Boolean(field.defaultValue ?? field.defaultChecked)} disabled={isDisabled} required={field.required} />
              </div>
              {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
              {errors[name] && <InputError message={errors[name]} />}
            </div>
          )
        }
        return (
          <div key={name} className="grid gap-1">
            <Label htmlFor={name} className="text-sm font-medium">{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</Label>
            {renderControl(field, name, isDisabled)}
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            {errors[name] && <InputError message={errors[name]} />}
          </div>
        )
      })}
    </div>
  )
}