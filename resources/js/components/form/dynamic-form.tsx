import { useState, useCallback, useMemo, useEffect } from "react"
import { Form } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
interface DynamicFormProps {
  mode?: ActionMode
  tableName?: string
  endpoint?: string
  recordId?: number | string
  fields?: any[]
  initialValues?: Record<string, any>
  onSuccess?: (pageProps?: any) => void
}
export const DynamicForm = ({ mode = "store", tableName, endpoint, recordId, fields: passedFields, initialValues, onSuccess }: DynamicFormProps) => {
  const config = ACTION_MODES[mode] ?? ACTION_MODES.store
  const isReadonly = mode === "info" || mode === "delete"
  const [customValues, setCustomValues] = useState<Record<string, any>>({})
  useEffect(() => { setCustomValues({}) }, [initialValues, recordId])
  const schemaUrl = !passedFields && tableName ? `/schema/${tableName}/fields` : null
  const recordUrl = recordId && tableName && mode !== "store" ? `/crud/${tableName}/${recordId}` : null
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<any[]>(schemaUrl, { select: (res: any) => res?.data ?? res })
  const { data: fetchedValues, isLoading: loadingRecord } = useApi<Record<string, any>>(recordUrl, { select: (res: any) => res?.data ?? res })
  const activeFields = passedFields ?? fetchedFields ?? []
  const isLoading = (Boolean(schemaUrl) && (loadingSchema || !fetchedFields)) || (Boolean(recordUrl) && (loadingRecord || !fetchedValues))
  const handleCustomChange = useCallback((name: string, value: any) => {
    setCustomValues((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }))
  }, [])
  const action = endpoint ?? (mode === "store" || !recordId ? `/crud/${tableName}` : `/crud/${tableName}/${recordId}`)
  const formValues = useMemo(() => ({ ...initialValues, ...fetchedValues, ...customValues }), [initialValues, fetchedValues, customValues])
  const formOptions = useMemo(() => ({ preserveScroll: true, onSuccess: (p: any) => onSuccess?.(p?.props) }), [onSuccess])
  return (
    <AsyncState isLoading={isLoading}>
      <Form key={recordId ? `record-${recordId}-${Boolean(fetchedValues)}` : "new"} action={action} method={config.method ?? "post"} 
        options={formOptions} onSubmit={(e) => { if (mode === "info") e.preventDefault() }} className="flex flex-col h-full min-h-0">
        {({ processing, errors }) => (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <FormGroup fields={activeFields} errors={errors} values={formValues} isReadonly={isReadonly} onChange={handleCustomChange} />
            </div>
            {mode !== "info" && (
              <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2 mt-2">
                <SmartButton type="submit" label={config.label} loadingLabel={config.loadingLabel} variant={config.variant} buttonColor={config.buttonColor} 
                icon={config.icon} isLoading={processing} />
              </div>
            )}
          </>
        )}
      </Form>
    </AsyncState>
  )
}