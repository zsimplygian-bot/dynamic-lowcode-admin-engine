import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { SelectBaseLayout, SelectBaseProps, SelectOptionsList } from "@/components/form-select-base"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
const cache = new Map<string, any[]>()
export interface FormSelectAsyncProps extends SelectBaseProps { endpoint?: string }
export const FormSelectAsync = ({ name = "", value, defaultValue, endpoint, disabled, placeholder, ...props }: FormSelectAsyncProps) => {
  const [open, setOpen] = useState(false), [options, setOptions] = useState<any[]>(() => cache.get(name) ?? [])
  const val = String(value ?? defaultValue ?? ""), fieldName = name.replace(/_id$/, ""), url = endpoint || `/api/lookups/${name}`
  const matched = options.find((o) => String(o.id) === val || String(o.label) === val)
  const initialUrl = val && !matched ? `${url}?id=${encodeURIComponent(val)}` : null
  const { data: initialData, isLoading: loadingInitial } = useApi<any>(initialUrl)
  const { data, isLoading, refetch } = useApi(open && !cache.has(name) ? url : null)
  const isInitialLoading = Boolean(initialUrl && loadingInitial), loading = isLoading || loadingInitial, targetId = matched ? String(matched.id) : val
  useEffect(() => {
    if (!initialData) return
    const opts = Array.isArray(initialData) ? initialData : [initialData]
    setOptions((prev) => [...prev, ...opts.filter((o) => !prev.some((p) => String(p.id) === String(o.id)))])
  }, [initialData])
  useEffect(() => {
    if (!data) return
    const opts = Array.isArray(data) ? data : data.options ?? []
    cache.set(name, opts)
    setOptions(opts)
  }, [data, name])
  const handleRefresh = () => { cache.delete(name); setOptions([]); refetch() }
  return (
    <SelectBaseLayout {...props} name={name} value={isInitialLoading ? "" : value} defaultValue={defaultValue} options={options} open={open} onOpenChange={setOpen} 
    disabled={disabled || isInitialLoading} placeholder={isInitialLoading ? "..." : placeholder} infoAction={targetId ? <InfoButton row_id={targetId} tableName={fieldName} variant="ghost" 
    onSuccess={handleRefresh} /> : null} headerActions={<><ResetButton onReset={handleRefresh} isLoading={loading} size="xs" /><NewRecordButton tableName={fieldName} size="xs" onSuccess={handleRefresh} /></>}>
      {(_, listProps) => <AsyncState isLoading={loading}><SelectOptionsList {...listProps} /></AsyncState>}
    </SelectBaseLayout>
  )
}
export default FormSelectAsync