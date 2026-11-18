import { useEffect, useMemo } from "react"
import { useForm } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { Async } from "@/components/async-state"
import { MODES, Mode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
import { useLocalStorage } from "@/hooks/use-local-storage"
const EMPTY_ARR: FieldConfig[] = []
export interface SmartFormProps { action?: string; endpoint?: string; mode?: Mode; tableName?: string; recordId?: number | string; fields?: FieldConfig[]; initialValues?: Record<string, any>; isLoading?: boolean; className?: string; options?: Record<string, any>; onSuccess?: (page?: any) => void; onError?: (errors: Record<string, string>) => void; children?: React.ReactNode | ((props: { processing: boolean; errors: Record<string, string>; data: Record<string, any> }) => React.ReactNode) }
export const SmartForm = ({ action, endpoint, mode = "s", tableName, recordId, fields: passedFields, initialValues, isLoading: externalLoading, options, onSuccess, onError, children }: SmartFormProps) => {
  const config = MODES[mode], isCreate = mode === "s", isReadonly = mode === "i" || mode === "d", isDetail = mode === "i"
  const [cachedFields, setCachedFields] = useLocalStorage<FieldConfig[]>(tableName ? `fields_${tableName}` : "", EMPTY_ARR)
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(!passedFields && !cachedFields.length && tableName ? `/schema/${tableName}/fields` : null)
  const { data: fetchedRecord, isLoading: loadingRecord } = useApi<Record<string, any>>(!initialValues && recordId && tableName && !isCreate ? `/crud/${tableName}/${recordId}` : null)
  useEffect(() => { if (fetchedFields?.length) setCachedFields(fetchedFields) }, [fetchedFields])
  const targetUrl = endpoint ?? action ?? `/crud/${tableName}${recordId ? `/${recordId}` : ""}`
  const fields = useMemo(() => (passedFields || (cachedFields.length ? cachedFields : fetchedFields) || EMPTY_ARR).map((f) => {
    const iv = initialValues?.[f.name!], cfg = iv && typeof iv === "object" && "value" in iv ? { ...f, ...iv } : f
    return !cfg.readonly ? cfg : isCreate ? { ...cfg, hidden: true, required: false } : { ...cfg, disabled: true }
  }), [passedFields, cachedFields, fetchedFields, isCreate, initialValues])
  const formValues = useMemo(() => fields.reduce<Record<string, any>>((acc, f) => {
    const iv = initialValues?.[f.name!]
    acc[f.name!] = fetchedRecord?.[f.name!] ?? (iv && typeof iv === "object" && "value" in iv ? iv.value : iv) ?? f.defaultValue
    return acc
  }, {}), [fields, initialValues, fetchedRecord])
  const form = useForm<Record<string, any>>(formValues), { data, setData, processing, errors, transform } = form
  useEffect(() => { setData(formValues) }, [formValues])
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(), e.stopPropagation()
    if (isDetail) return
    transform((raw) => Object.fromEntries(fields.map((f) => [f.name!, raw[f.name!]])))
    form[config.method](targetUrl, { preserveScroll: true, forceFormData: fields.some((f) => f.type === "file"), onSuccess, onError, ...options })
  }
  return (
    <Async isLoading={externalLoading || Boolean(loadingSchema || loadingRecord)}>
      <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0 space-y-2">
        {fields.length > 0 && (<div className="flex-1 overflow-y-auto space-y-2 pr-1"><FormGroup fields={fields} values={data} errors={errors} isReadonly={isReadonly} onChange={setData}/></div>)}
        {typeof children === "function" ? children({ processing, errors, data }) : children}
        {!isDetail && (<div className="pt-4 flex justify-end gap-2"><SmartButton {...config} type="submit" isLoading={processing} /></div>)}
      </form>
    </Async>
  )
}
export default SmartForm