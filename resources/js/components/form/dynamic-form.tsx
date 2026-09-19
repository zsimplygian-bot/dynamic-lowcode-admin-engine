import { useState, useMemo, useEffect } from "react"
import { Form } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
import { useTranslation } from "@/hooks/use-translation"
import { useLocalStorage } from "@/hooks/use-local-storage"
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
  const t = useTranslation()
  const config = ACTION_MODES[mode] ?? ACTION_MODES.store
  const isReadonly = mode === "info" || mode === "delete"
  const storageKey = tableName ? `schema_fields_${tableName}` : ""
  const [persistedFields, setPersistedFields] = useLocalStorage<FieldConfig[] | null>(storageKey, null)
  const schemaUrl = !passedFields && !persistedFields && tableName ? `/schema/${tableName}/fields` : null
  const recordUrl = recordId && tableName && mode !== "store" ? `/crud/${tableName}/${recordId}` : null
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(schemaUrl, { select: (r: any) => r?.data ?? r })
  useEffect(() => {
    if (fetchedFields && fetchedFields.length > 0 && !persistedFields) {
      setPersistedFields(fetchedFields)
    }
  }, [fetchedFields, persistedFields, setPersistedFields])
  const { data: fetchedValues, isLoading: loadingRecord } = useApi<Record<string, any>>(recordUrl, { select: (r: any) => r?.data ?? r })
  const activeFields = passedFields ?? persistedFields ?? fetchedFields ?? []
  const isLoading = Boolean((schemaUrl && (loadingSchema || !activeFields.length)) || (recordUrl && (loadingRecord || !fetchedValues)))
  const [formState, setFormState] = useState<Record<string, any>>({})
  useEffect(() => { setFormState({ ...initialValues, ...fetchedValues }) }, [initialValues, fetchedValues])
  const action = endpoint ?? `/crud/${tableName}${recordId && mode !== "store" ? `/${recordId}` : ""}`
  const formOptions = useMemo(() => ({ preserveScroll: true, onSuccess: (p: any) => onSuccess?.(p?.props) }), [onSuccess])
  return (
    <AsyncState isLoading={isLoading}>
      <Form key={recordId ? `record-${recordId}-${Boolean(fetchedValues)}` : "new"} action={action} method={config.method ?? "post"}
        transform={() => formState} options={formOptions} onSubmit={(e) => { if (mode === "info") e.preventDefault() }} className="flex flex-col h-full min-h-0">
        {({ processing, errors }) => (
          <><div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <FormGroup fields={activeFields} errors={errors} values={formState} isReadonly={isReadonly}
                onChange={(name, val) => setFormState((prev) => (prev[name] === val ? prev : { ...prev, [name]: val }))} />
            </div>
            {mode !== "info" && (
              <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2 mt-2">
                <SmartButton type="submit" label={t(config.label)} loadingLabel={t(config.loadingLabel)} variant={config.variant} buttonColor={config.buttonColor} icon={config.icon} isLoading={processing}/>
              </div>
            )}
          </>
        )}
      </Form>
    </AsyncState>
  )
}