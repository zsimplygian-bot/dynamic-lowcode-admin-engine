import { useEffect, useMemo } from "react"
import { useForm } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { MODES, Mode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
import { useLocalStorage } from "@/hooks/use-local-storage"
const EMPTY_ARR: FieldConfig[] = []
export interface SmartFormProps { action?: string; endpoint?: string; mode?: Mode; method?: "post" | "put" | "delete"; tableName?: string; recordId?: number | string; fields?: FieldConfig[]; initialValues?: Record<string, any>; isLoading?: boolean; className?: string; options?: Record<string, any>; onSuccess?: (page?: any) => void; onError?: (errors: Record<string, string>) => void; children?: React.ReactNode | ((props: { processing: boolean; errors: Record<string, string>; data: Record<string, any> }) => React.ReactNode) }
export const SmartForm = ({ action, endpoint, mode = "s", method, tableName, recordId, fields: passedFields, initialValues, isLoading: externalLoading, options, onSuccess, onError, children }: SmartFormProps) => {
  const config = MODES[mode], isCreate = mode === "s"
  const [cachedFields, setCachedFields] = useLocalStorage<FieldConfig[]>(tableName ? `sf_fields_${tableName}` : "", EMPTY_ARR)
  const needsSchema = !passedFields && !cachedFields.length && Boolean(tableName)
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(needsSchema ? `/schema/${tableName}/fields` : null, { enabled: needsSchema })
  const { data: fetchedRecord, isLoading: loadingRecord } = useApi<any>(!initialValues && recordId && tableName && !isCreate ? `/crud/${tableName}/${recordId}` : null)
  useEffect(() => { if (fetchedFields?.length && !cachedFields.length) setCachedFields(fetchedFields) }, [fetchedFields, cachedFields, setCachedFields])
  const targetUrl = endpoint ?? action ?? `/crud/${tableName}${recordId && !isCreate ? `/${recordId}` : ""}`
  const httpMethod = method ?? (config.method as "post" | "put" | "delete")
  const fields = useMemo(() => {
    const raw = passedFields || (cachedFields.length ? cachedFields : fetchedFields) || EMPTY_ARR
    return raw.map((f) => f.readonly ? (isCreate ? { ...f, hidden: true, required: false } : { ...f, disabled: true }) : f)
  }, [passedFields, cachedFields, fetchedFields, isCreate])
  const formValues = useMemo(() => {
    const rec = fetchedRecord?.data ?? fetchedRecord ?? initialValues
    const vals: Record<string, any> = { ...rec }
    for (const f of fields) if (f.defaultValue !== undefined) vals[f.name!] ??= f.defaultValue
    return vals
  }, [fields, initialValues, fetchedRecord])
  const form = useForm<Record<string, any>>(formValues)
  const { data, setData, processing, errors, transform } = form
  useEffect(() => { if (Object.keys(formValues).length) setData(formValues) }, [formValues])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "i") return
    transform((raw) => Object.fromEntries(fields.map((f) => [f.name, raw[f.name]])))
    form[httpMethod](targetUrl, { preserveScroll: true, forceFormData: fields.some((f) => f.type === "file"), ...options,
      onSuccess: (p) => (options?.onSuccess?.(p), onSuccess?.(p)), onError: (errs) => (options?.onError?.(errs), onError?.(errs))
    })
  }
  return (
    <AsyncState isLoading={externalLoading || Boolean(loadingSchema || loadingRecord)}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-2">
        {fields.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1"><FormGroup fields={fields} values={data} errors={errors} isReadonly={mode === "i" || mode === "d"} onChange={setData}/></div>
        )}
        {typeof children === "function" ? children({ processing, errors, data }) : children}
        {mode !== "i" && ( <div className="pt-4 flex justify-end gap-2"> <SmartButton {...config} type="submit" isLoading={processing} /> </div> )}
      </form>
    </AsyncState>
  )
}
export default SmartForm