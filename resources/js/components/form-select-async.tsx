import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { SelectBaseLayout, SelectBaseProps, SelectOptionsList } from "@/components/form-select-base"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
const cache = new Map<string, any[]>()
export interface FormSelectAsyncProps extends SelectBaseProps { endpoint?: string }
export const FormSelectAsync = ({ name = "", value, defaultValue, endpoint, ...props }: FormSelectAsyncProps) => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<any[]>(() => cache.get(name) ?? [])
  const currentValue = String(value ?? defaultValue ?? "")
  const fieldName = name.replace(/_id$/, "")
  const url = endpoint || `/api/lookups/${fieldName}`
  const { data, isLoading, refetch } = useApi(open && !cache.has(name) ? url : null)
  useEffect(() => {
    if (!data) return
    const list = Array.isArray(data) ? data : data.options ?? []
    cache.set(name, list)
    setOptions(list)
  }, [data, name])
  const handleRefresh = () => { cache.delete(name); setOptions([]); refetch() }
  const matchedOpt = options.find((o) => String(o.id) === currentValue || String(o.label) === currentValue)
  const targetId = matchedOpt ? String(matchedOpt.id) : currentValue
  return (
    <SelectBaseLayout {...props} name={name} value={value} defaultValue={defaultValue} options={options} open={open} onOpenChange={setOpen}
      infoAction={targetId ? <InfoButton row_id={targetId} tableName={fieldName} variant="ghost" onSuccess={handleRefresh} /> : null}
      headerActions={<><ResetButton onReset={handleRefresh} isLoading={isLoading} size="xs" /><NewRecordButton tableName={fieldName} size="xs" onSuccess={handleRefresh} /></>}
    >
      {(_, listProps) => ( <AsyncState isLoading={isLoading}> <SelectOptionsList {...listProps} /> </AsyncState> )}
    </SelectBaseLayout>
  )
}
export default FormSelectAsync