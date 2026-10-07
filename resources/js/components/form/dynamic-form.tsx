import { FieldConfig } from "@/components/form-group"
import { SmartForm } from "@/components/smart-form"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"

interface DynamicFormProps {
  mode?: ActionMode
  tableName?: string
  endpoint?: string
  recordId?: number | string
  fields?: FieldConfig[]
  initialValues?: Record<string, any>
  onSuccess?: (pageProps?: any) => void
}

export const DynamicForm = ({ mode = "store", tableName, endpoint, recordId, fields: passedFields, initialValues, onSuccess }: DynamicFormProps) => {
  const schemaUrl = !passedFields && tableName ? `/schema/${tableName}/fields` : null
  const recordUrl = recordId && tableName && mode !== "store" ? `/crud/${tableName}/${recordId}` : null

  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(schemaUrl, { select: (r: any) => r?.data ?? r })
  const { data: fetchedValues, isLoading: loadingRecord } = useApi<Record<string, any>>(recordUrl, { select: (r: any) => r?.data ?? r })

  const fields = passedFields ?? fetchedFields ?? []
  const isLoading = Boolean((schemaUrl && loadingSchema) || (recordUrl && loadingRecord))

  const action = endpoint ?? `/crud/${tableName}${recordId && mode !== "store" ? `/${recordId}` : ""}`
  const defaults = fields.reduce((acc, f) => (f.defaultValue !== undefined && (f.name ?? f.id) ? { ...acc, [f.name ?? f.id!]: f.defaultValue } : acc), {})
  const formInitialValues = { ...defaults, ...initialValues, ...fetchedValues }

  return (
    <SmartForm
      action={action}
      mode={mode}
      fields={fields}
      initialValues={formInitialValues}
      isLoading={isLoading}
      onSuccess={onSuccess}
      className="flex flex-col h-full min-h-0 space-y-2"
    />
  )
}