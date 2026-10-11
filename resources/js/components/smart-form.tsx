import { useEffect, useMemo, useRef } from "react"
import { useForm } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useApi } from "@/hooks/use-api"
export interface SmartFormProps {
  action?: string
  endpoint?: string
  mode?: ActionMode
  method?: "post" | "delete"
  tableName?: string
  recordId?: number | string
  fields?: FieldConfig[]
  initialValues?: Record<string, any>
  isLoading?: boolean
  className?: string
  options?: Record<string, any>
  onSuccess?: (response?: any) => void
  onError?: (errors: Record<string, string>) => void
  children?: React.ReactNode | ((props: { processing: boolean; errors: Record<string, string>; data: Record<string, any> }) => React.ReactNode)
}
export const SmartForm = ({ action, endpoint, mode = "s", method, tableName, recordId, fields: passedFields, initialValues, isLoading: externalLoading, options, onSuccess, onError, children }: SmartFormProps) => {
  const config = ACTION_MODES[mode]
  const schemaUrl = !passedFields && tableName ? `/schema/${tableName}/fields` : null
  const recordUrl = !initialValues && recordId && tableName && mode !== "s" ? `/crud/${tableName}/${recordId}` : null
  const { data: fetchedFields, isLoading: loadingSchema } = useApi<FieldConfig[]>(schemaUrl, { select: (r: any) => r?.data ?? r })
  const { data: fetchedValues, isLoading: loadingRecord } = useApi<Record<string, any>>(recordUrl, { select: (r: any) => r?.data ?? r })
  const fields = passedFields ?? fetchedFields ?? []
  const isLoading = externalLoading || Boolean(loadingSchema || loadingRecord)
  const targetUrl = endpoint ?? action ?? `/crud/${tableName}${recordId && mode !== "s" ? `/${recordId}` : ""}`
  const isDelete = method === "delete" || mode === "d"
  const defaultValues = useMemo(() => {
    return fields.reduce((acc, f) => {
      if (f.name && f.defaultValue !== undefined) acc[f.name] = f.defaultValue
      return acc
    }, {} as Record<string, any>)
  }, [fields])
  const formValues = useMemo(() => ({ ...defaultValues, ...initialValues, ...fetchedValues }), [defaultValues, initialValues, fetchedValues])
  const { data, setData, post, delete: destroy, processing, errors } = useForm<Record<string, any>>(formValues)
  const prevFetchedRef = useRef(fetchedValues)
  useEffect(() => {
    if (fetchedValues && fetchedValues !== prevFetchedRef.current) {
      prevFetchedRef.current = fetchedValues
      setData((prev) => ({ ...prev, ...fetchedValues }))
    }
  }, [fetchedValues, setData])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "i") return
    const opts = {
      preserveScroll: true,
      ...options,
      onSuccess: (p: any) => { options?.onSuccess?.(p); onSuccess?.(p?.props ?? p) },
      onError: (errs: any) => { options?.onError?.(errs); onError?.(errs) }
    }
    isDelete ? destroy(targetUrl, opts) : post(targetUrl, opts)
  }
  return (
    <AsyncState isLoading={isLoading}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-2">
        {fields.length > 0 && (<div className="flex-1 overflow-y-auto space-y-2 pr-1"><FormGroup fields={fields} values={data} errors={errors} isReadonly={mode === "i" || mode === "d"} onChange={setData}/></div>)}
        {typeof children === "function" ? children({ processing, errors, data }) : children}
        {mode !== "i" && (
          <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2 mt-2">
            <SmartButton type="submit" label={config.label} loadingLabel={config.loadingLabel} variant={config.variant} buttonColor={config.buttonColor} icon={config.icon} isLoading={processing} />
          </div>
        )}
      </form>
    </AsyncState>
  )
}
export default SmartForm