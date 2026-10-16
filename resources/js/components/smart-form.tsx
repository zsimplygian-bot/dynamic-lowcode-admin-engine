import { useEffect, useMemo } from "react"
import { useForm } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
import { useLocalStorage } from "@/hooks/use-local-storage"
export interface SmartFormProps {
  action?: string
  endpoint?: string
  mode?: ActionMode
  method?: "post" | "put" | "delete"
  tableName?: string
  recordId?: number | string
  fields?: FieldConfig[]
  initialValues?: Record<string, any>
  isLoading?: boolean
  className?: string
  options?: Record<string, any>
  onSuccess?: (page?: any) => void
  onError?: (errors: Record<string, string>) => void
  children?: React.ReactNode | ((props: { processing: boolean; errors: Record<string, string>; data: Record<string, any> }) => React.ReactNode)
}
export const SmartForm = ({ action, endpoint, mode = "s", method, tableName, recordId, fields: passedFields, initialValues, isLoading: externalLoading, options, onSuccess, onError, children }: SmartFormProps) => {
  const config = ACTION_MODES[mode]
  const [cachedFields, setCachedFields] = useLocalStorage<FieldConfig[]>(tableName ? `sf_fields_${tableName}` : "", [])
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(!passedFields && !cachedFields.length && tableName ? `/schema/${tableName}/fields` : null, { select: (r: any) => r?.data ?? r })
  const { data: fetchedValues, isLoading: loadingRecord } = useApi<Record<string, any>>(!initialValues && recordId && tableName && mode !== "s" ? `/crud/${tableName}/${recordId}` : null, { select: (r: any) => r?.data ?? r })
  useEffect(() => { if (fetchedFields?.length && !cachedFields.length) setCachedFields(fetchedFields) }, [fetchedFields, cachedFields.length, setCachedFields])
  const targetUrl = endpoint ?? action ?? `/crud/${tableName}${recordId && mode !== "s" ? `/${recordId}` : ""}`
  const httpMethod = method ?? (mode === "d" ? "delete" : mode === "u" ? "put" : "post")
  const fields = useMemo(() => {
    const raw = passedFields ?? (cachedFields.length ? cachedFields : fetchedFields) ?? []
    return initialValues ? raw.map((f) => (initialValues[f.name]?.disabled ? { ...f, disabled: true } : f)) : raw
  }, [passedFields, cachedFields, fetchedFields, initialValues])
  const formValues = useMemo(() => {
    const defaults = fields.reduce((acc, f) => (f.name && f.defaultValue !== undefined ? { ...acc, [f.name]: f.defaultValue } : acc), {})
    const inits = initialValues ? Object.entries(initialValues).reduce((acc, [k, v]) => ({ ...acc, [k]: v && typeof v === "object" && "value" in v ? v.value : v }), {}) : {}
    return { ...defaults, ...inits, ...fetchedValues }
  }, [fields, initialValues, fetchedValues])
  const form = useForm<Record<string, any>>(formValues)
  const { data, setData, processing, errors } = form
  useEffect(() => { if (Object.keys(formValues).length) setData(formValues) }, [formValues])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "i") return
    form[httpMethod](targetUrl, {
      preserveScroll: true,
      ...options,
      onSuccess: (p: any) => { options?.onSuccess?.(p); onSuccess?.(p) },
      onError: (errs: any) => { options?.onError?.(errs); onError?.(errs) }
    })
  }
  return (
    <AsyncState isLoading={externalLoading || Boolean(loadingSchema || loadingRecord)}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-2">
        {fields.length > 0 && <div className="flex-1 overflow-y-auto space-y-2 pr-1"><FormGroup fields={fields} values={data} errors={errors} isReadonly={mode === "i" || mode === "d"} onChange={setData} /></div>}
        {typeof children === "function" ? children({ processing, errors, data }) : children}
        {mode !== "i" && (
          <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2">
            <SmartButton type="submit" label={config.label} loadingLabel={config.loadingLabel} variant={config.variant} buttonColor={config.buttonColor} icon={config.icon} isLoading={processing} />
          </div>
        )}
      </form>
    </AsyncState>
  )
}
export default SmartForm