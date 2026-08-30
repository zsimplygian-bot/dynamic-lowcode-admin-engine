import { memo, useState, useEffect, useCallback } from "react"
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

const EMPTY_OBJECT = Object.freeze({})

const FieldRenderer = ({ field, error, value, isReadonly, layout = "vertical", onChange }: any) => {
  const name = field.name ?? field.id
  const fieldId = field.id ?? name
  const disabled = field.disabled || isReadonly

  // Garantizar valor usable
  const fieldValue = value ?? ""

  if (field.type === "hidden") {
    return <Input type="hidden" id={fieldId} name={name} value={String(fieldValue)} />
  }

  const isHorizontal = layout === "horizontal"

  if (field.type === "checkbox") {
    const isChecked = Boolean(fieldValue === true || Number(fieldValue) === 1)
    return (
      <div className={isHorizontal ? "grid grid-cols-12 items-center gap-2" : "grid gap-1.5"}>
        {isHorizontal && <div className="col-span-4" />}
        <div className={`flex items-center space-x-2 pt-1 ${isHorizontal ? "col-span-8" : ""}`}>
          <Input type="hidden" name={name} value={isChecked ? 1 : 0} />
          <Checkbox
            id={fieldId}
            checked={isChecked}
            disabled={disabled}
            onCheckedChange={(v) => onChange(name, v ? 1 : 0)}
          />
          <Label htmlFor={fieldId} className="cursor-pointer text-sm font-medium flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-red-500 font-bold">*</span>}
          </Label>
        </div>
        {error && <InputError message={error} />}
      </div>
    )
  }

  const strVal = fieldValue instanceof File ? "" : String(fieldValue)
  let inputControl: React.ReactNode

  switch (field.type) {
    case "textarea":
      inputControl = (
        <Textarea
          id={fieldId}
          name={name}
          value={strVal}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={field.rows ?? 3}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )
      break
    case "select":
      inputControl =
        Array.isArray(field.options) && field.options.length > 0 ? (
          <FormSelectSimple
            id={fieldId}
            name={name}
            value={strVal}
            disabled={disabled}
            options={field.options}
            placeholder={field.placeholder}
            onSelect={(v) => onChange(name, v)}
          />
        ) : (
          <FormSelectAsync
            id={fieldId}
            name={name}
            value={strVal}
            disabled={disabled}
            lista={field.lista}
            placeholder={field.placeholder}
            onSelect={(v) => onChange(name, v)}
          />
        )
      break
    case "date":
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <DatePicker
            value={strVal}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(v) => onChange(name, v)}
          />
        </>
      )
      break
    case "time":
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <Clock
            value={strVal}
            disabled={disabled}
            placeholder={field.placeholder ?? "00:00"}
            onChange={(v) => onChange(name, v)}
          />
        </>
      )
      break
    case "datetime-local": {
      const [datePart = "", timePart = ""] = strVal.split(" ")
      inputControl = (
        <>
          <Input type="hidden" name={name} value={strVal} />
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              value={datePart}
              disabled={disabled}
              placeholder="-"
              onChange={(d) => onChange(name, d ? `${d} ${timePart || "00:00"}` : "")}
            />
            <Clock
              value={timePart}
              disabled={disabled}
              placeholder="Hora"
              onChange={(t) => onChange(name, datePart ? `${datePart} ${t}` : t)}
            />
          </div>
        </>
      )
      break
    }
    case "file":
    case "image":
      inputControl = (
        <FormFilePicker
          id={fieldId}
          name={name}
          type={field.type}
          defaultValue={strVal}
          accept={field.accept}
          disabled={disabled}
          onChange={(e: any) => {
            const file = e?.target?.files?.[0] ?? e
            onChange(name, file)
          }}
        />
      )
      break
    default:
      inputControl = (
        <Input
          id={fieldId}
          name={name}
          type={field.type || "text"}
          value={strVal}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )
  }

  return (
    <div className={isHorizontal ? "grid grid-cols-12 items-start gap-2 pt-1" : "grid gap-1"}>
      <Label
        htmlFor={fieldId}
        className={`flex items-start gap-1 text-sm font-medium leading-tight select-none ${
          isHorizontal ? "col-span-4 text-left justify-start pt-2" : ""
        }`}
        title={field.label}
      >
        <span className="line-clamp-2">{field.label}</span>
        {field.required && <span className="text-red-500 font-bold shrink-0">*</span>}
      </Label>
      <div className={isHorizontal ? "col-span-8 space-y-1" : ""}>
        {inputControl}
        {error && <InputError message={error} />}
      </div>
    </div>
  )
}

export const FormGroup = memo(({ fields, errors = EMPTY_OBJECT, values: externalValues = EMPTY_OBJECT, isReadonly = false, layout = "vertical", onChange }: any) => {
  // Inicialización de estado interno local autónomo
  const [internalValues, setInternalValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    fields?.forEach((f: any) => {
      const name = f.name ?? f.id
      initial[name] = externalValues[name] ?? f.defaultValue ?? f.value ?? ""
    })
    return initial
  })

  // Sincronizar si el padre cambia los valores externamente
  useEffect(() => {
    setInternalValues((prev) => {
      const next = { ...prev }
      let hasChanges = false
      fields?.forEach((f: any) => {
        const name = f.name ?? f.id
        if (externalValues[name] !== undefined && externalValues[name] !== prev[name]) {
          next[name] = externalValues[name]
          hasChanges = true
        }
      })
      return hasChanges ? next : prev
    })
  }, [externalValues, fields])

  // Manejador centralizado de cambios
  const handleChange = useCallback((name: string, val: any) => {
    setInternalValues((prev) => ({ ...prev, [name]: val }))
    if (typeof onChange === "function") {
      onChange(name, val)
    }
  }, [onChange])

  return (
    <div className="space-y-3">
      {fields.map((field: any) => {
        const name = field.name ?? field.id
        return (
          <FieldRenderer
            key={name}
            field={field}
            error={errors[name]}
            value={internalValues[name] ?? ""}
            isReadonly={isReadonly}
            layout={layout}
            onChange={handleChange}
          />
        )
      })}
    </div>
  )
})
FormGroup.displayName = "FormGroup"