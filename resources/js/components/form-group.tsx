import { memo } from "react"
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
  const fieldId = field.id ?? name
  const disabled = field.disabled || isReadonly
  const fieldValue = value !== undefined && value !== null && value !== "" ? value : (field.defaultValue ?? field.value ?? "")

  if (field.type === "hidden") {
    return <Input type="hidden" id={fieldId} name={name} value={String(fieldValue)} />
  }

  const isHorizontal = layout === "horizontal"

  // Checkbox puramente numérico (0 / 1)
  if (field.type === "checkbox") {
    const isChecked = Number(fieldValue) === 1
    return (
      <div className={isHorizontal ? "grid grid-cols-3 items-center gap-2" : "grid gap-1.5"}>
        {isHorizontal && <div className="col-span-1" />}
        <div className={`flex items-center space-x-2 pt-1 ${isHorizontal ? "col-span-2" : ""}`}>
          <Input type="hidden" name={name} value={isChecked ? 1 : 0} />
          <Checkbox id={fieldId} checked={isChecked} disabled={disabled} onCheckedChange={(v) => onChange?.(name, v ? 1 : 0)} />
          <Label htmlFor={fieldId} className="cursor-pointer text-sm font-medium flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500 font-bold">*</span>}
          </Label>
        </div>
        {error && <InputError message={error} />}
      </div>
    )
  }

  const strVal = String(fieldValue ?? "")
  let inputControl: React.ReactNode

  switch (field.type) {
    case "textarea":
      inputControl = <Textarea id={fieldId} name={name} value={strVal} placeholder={field.placeholder} disabled={disabled} rows={field.rows ?? 3} onChange={(e) => onChange?.(name, e.target.value)} />
      break
    case "select":
      inputControl = Array.isArray(field.options) && field.options.length > 0 ? (
        <FormSelectSimple id={fieldId} name={name} value={strVal} disabled={disabled} options={field.options} placeholder={field.placeholder} onSelect={(v) => onChange?.(name, v)} />
      ) : (
        <FormSelectAsync id={fieldId} name={name} value={strVal} disabled={disabled} lista={field.lista} placeholder={field.placeholder} onSelect={(v) => onChange?.(name, v)} />
      )
      break
    case "date":
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <DatePicker value={strVal} disabled={disabled} placeholder={field.placeholder} onChange={(v) => onChange?.(name, v)} />
        </>
      )
      break
    case "time":
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <Clock value={strVal} disabled={disabled} placeholder={field.placeholder ?? "00:00"} onChange={(v) => onChange?.(name, v)} />
        </>
      )
      break
    case "datetime-local": {
      const [datePart = "", timePart = ""] = strVal.split(" ")
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <div className="grid grid-cols-2 gap-2">
            <DatePicker value={datePart} disabled={disabled} placeholder="-" onChange={(d) => onChange?.(name, d ? `${d} ${timePart || "00:00"}` : "")} />
            <Clock value={timePart} disabled={disabled} placeholder="Hora" onChange={(t) => onChange?.(name, datePart ? `${datePart} ${t}` : t)} />
          </div>
        </>
      )
      break
    }
    case "file":
    case "image":
      inputControl = (
        <FormFilePicker
          key={`${fieldId}-${strVal}`}
          id={fieldId}
          name={name}
          type={field.type}
          defaultValue={strVal}
          accept={field.accept}
          disabled={disabled}
          onChange={(e: any) => onChange?.(name, e?.target?.files?.[0] ?? e)}
        />
      )
      break
    default:
      inputControl = <Input id={fieldId} name={name} type={field.type || "text"} value={strVal} placeholder={field.placeholder} disabled={disabled} onChange={(e) => onChange?.(name, e.target.value)} />
  }

  return (
    <div className={isHorizontal ? "grid grid-cols-3 items-center gap-2" : "grid gap-1"}>
      <Label htmlFor={fieldId} className={`flex items-center gap-1 text-sm font-medium ${isHorizontal ? "col-span-1 text-right justify-end" : ""}`}>
        {field.label}
        {field.required && <span className="text-red-500 font-bold">*</span>}
      </Label>
      <div className={isHorizontal ? "col-span-2 space-y-1" : ""}>
        {inputControl}
        {error && <InputError message={error} />}
      </div>
    </div>
  )
}, (prev, next) => (
  prev.field === next.field &&
  prev.error === next.error &&
  prev.value === next.value &&
  prev.isReadonly === next.isReadonly &&
  prev.layout === next.layout &&
  prev.onChange === next.onChange
))
FieldRenderer.displayName = "FieldRenderer"

export const FormGroup = memo(({ fields, errors = EMPTY_OBJECT, values = EMPTY_OBJECT, isReadonly = false, layout = "vertical", onChange }: any) => (
  <div className="space-y-3">
    {fields.map((field: any) => {
      const name = field.name ?? field.id
      return <FieldRenderer key={name} field={field} error={errors[name]} value={values[name]} isReadonly={isReadonly} layout={layout} onChange={onChange} />
    })}
  </div>
))
FormGroup.displayName = "FormGroup"