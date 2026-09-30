import { useState, useEffect, useId } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SmartButton } from "@/components/smart-button"
import { useTranslation } from "@/hooks/use-translation"

export const SearchInput = ({ items = [], searchKey = "name", value: valueProp, defaultValue = "", onChange, onSearchSubmit, onFilter, filterOnEnter = false, placeholder, className = "", disabled, id, name, children, ...props }: any) => {
  const defaultId = useId()
  const t = useTranslation()
  const [internal, setInternal] = useState(valueProp ?? defaultValue)
  const [submitted, setSubmitted] = useState(valueProp ?? defaultValue)
  const search = valueProp !== undefined ? valueProp : internal
  const trigger = (v: string) => {
    setSubmitted(v)
    ;(onSearchSubmit ?? onChange)?.(v)
  }
  const setVal = (v: string) => {
    if (valueProp === undefined) setInternal(v)
    if (!filterOnEnter) trigger(v)
  }
  const handleKeyDown = (e: any) => {
    if (filterOnEnter && e.key === "Enter") {
      e.preventDefault()
      trigger(search)
    }
    props.onKeyDown?.(e)
  }
  const reset = () => {
    if (valueProp === undefined) setInternal("")
    trigger("")
  }
  const activeQuery = (filterOnEnter ? submitted : search).toLowerCase().trim()
  const filtered = !activeQuery ? items : items.filter((i: any) => String(i?.[searchKey] ?? i?.label ?? i?.name ?? i ?? "").toLowerCase().includes(activeQuery))

  useEffect(() => {
    onFilter?.({ filtered, query: activeQuery })
  }, [items, searchKey, activeQuery])

  const input = (
    <div className="relative flex items-center flex-1 min-w-0">
      <Search className="absolute left-2 size-5 text-muted-foreground pointer-events-none" />
      <Input id={id ?? defaultId} name={name ?? id ?? defaultId} value={search} disabled={disabled} onChange={(e) => setVal(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder ?? t("Search...")} className={`pl-8 pr-8 text-sm ${className}`} {...props} />
      {search && <div className="absolute right-1 top-1/2 -translate-y-1/2"><SmartButton icon='x' variant="ghost" tooltip={t("Clear")} onClick={reset} /></div>}
    </div>
  )

  if (typeof children === "function") {
    return children({ filtered, query: activeQuery, input })
  }

  return input
}

export const SearchEmpty = ({ query }: { query?: string }) => {
  const t = useTranslation()
  return <div className="py-2 text-center text-sm text-muted-foreground">{query ? t("No matches found.") : t("No options.")}</div>
}
export default SearchInput