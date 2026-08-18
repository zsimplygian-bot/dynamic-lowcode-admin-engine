import React, { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSelectAsync } from '@/components/form-select-async'
import { FormImagePicker } from '@/components/form-image-picker'
import InputError from '@/components/input-error'
import { DatePicker } from '@/components/ui/datepicker'
import { Clock } from 'lucide-react'
export interface FieldConfig {
  id: string
  name?: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'date' | 'time' | 'file' | 'image' | 'hidden' | string
  defaultValue?: string | number | boolean
  placeholder?: string
  required?: boolean
  lista?: string
  rows?: number
  disabled?: boolean
  accept?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
interface FormGroupProps {
  fields: FieldConfig[]
  errors: Record<string, string | undefined>
}
const renderControl = (field: FieldConfig, strVal: string) => {
  const { id, name = id, type = 'text', rows = 3, placeholder, disabled, lista, accept, onChange, defaultValue, label, required } = field
  switch (type) {
    case 'textarea': return <Textarea {...{ id, name, defaultValue: String(strVal), placeholder, rows, disabled }} />
    case 'select': return <FormSelectAsync {...{ id, name, defaultValue: String(strVal), lista, placeholder, disabled }} />
    case 'file':
    case 'image': return <FormImagePicker {...{ id, name, defaultValue: String(strVal), accept, disabled, onChange }} />
    case 'date': return (
      <React.Fragment key={`date-group-${id}`}>
        <Input {...{ type: 'hidden', name, defaultValue: String(strVal) }} />
        <DatePicker {...{ id, value: String(strVal), placeholder, disabled }} />
      </React.Fragment>
    )
    case 'time': return (
      <div {...{ className: 'relative flex items-center' }}>
        <Input {...{ id, name, type: 'time', defaultValue: String(strVal), placeholder, disabled, className: 'pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0' }} />
        <Clock {...{ className: 'absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none' }} />
      </div>
    )
    case 'checkbox': return (
      <div {...{ className: 'flex items-center space-x-2 pt-1' }}>
        <Input {...{ type: 'hidden', name, value: defaultValue ? '1' : '0' }} />
        <Checkbox {...{ id, defaultChecked: Boolean(defaultValue), disabled }} />
        <Label {...{ htmlFor: id, className: 'cursor-pointer text-sm font-medium flex items-center gap-1' }}>
          {label}
          {required && <span {...{ className: 'text-red-500 font-bold' }}>*</span>}
        </Label>
      </div>
    )
    default: return <Input {...{ id, name, type, defaultValue: String(strVal), placeholder, disabled }} />
  }
}
const FormFieldItem = memo(({ field, error }: { field: FieldConfig; error?: string }) => {
  const { id, label, type = 'text', required, defaultValue } = field
  const strVal = defaultValue ?? ''
  if (type === 'hidden') return <Input {...{ type: 'hidden', id, name: field.name ?? id, defaultValue: String(strVal) }} />
  return (
    <div {...{ className: 'grid gap-1.5' }}>
      {type !== 'checkbox' && (
        <Label {...{ htmlFor: id, className: 'flex items-center gap-1 text-sm font-medium' }}>
          {label}
          {required && <span {...{ className: 'text-red-500 font-bold' }}>*</span>}
        </Label>
      )}
      {renderControl(field, String(strVal))}
      {error && <InputError {...{ className: 'mt-1', message: error }} />}
    </div>
  )
})
FormFieldItem.displayName = 'FormFieldItem'
export const FormGroup: React.FC<FormGroupProps> = ({ fields, errors }) => (
  <div {...{ className: 'space-y-4' }}>
    {fields.map((field) => <FormFieldItem key={field.id} {...{ field, error: errors[field.name ?? field.id] }} />)}
  </div>
)