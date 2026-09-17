import { useState, useId } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SmartButton } from "@/components/smart-button"
import { useTranslation } from "@/hooks/use-translation"
export const SearchInput = ({ items = [], searchKey, value: valueProp, defaultValue = "", onChange, onSearchSubmit, filterOnEnter = false, placeholder, className = "", listClassName = "max-h-70 overflow-y-auto space-y-0.5", listStyle, actions, disabled, children, id, name, ...props }: any) => {
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
  const activeQuery = filterOnEnter ? submitted : search
  const regex = activeQuery ? new RegExp(activeQuery, "i") : null
  const filtered = regex ? items.filter((i: any) => regex.test(String(typeof searchKey === "function" ? searchKey(i) : (i?.[searchKey] ?? i?.label ?? i?.name ?? i)))) : items
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex items-center flex-1 min-w-0">
          <Search className="absolute left-2 size-5 text-muted-foreground pointer-events-none" />
          <Input id={id ?? defaultId} name={name ?? id ?? defaultId} value={search} disabled={disabled} onChange={(e) => setVal(e.target.value)} 
          onKeyDown={handleKeyDown} placeholder={placeholder ?? t("Search...")} className={`pl-8 pr-8 text-sm ${className}`} {...props} />
          {search && ( <div className="absolute right-1 top-1/2 -translate-y-1/2"> <SmartButton icon={X} variant="ghost" tooltip={t("Clear")} onClick={reset}/> </div> )}
        </div>
        {typeof actions === "function" ? actions({ filtered, total: items.length, reset }) : actions}
      </div>
      {children && (
        <div className={listClassName} style={listStyle}>
          {filtered.length === 0 ? ( <div className="py-2 text-center text-sm text-muted-foreground">{activeQuery ? t("No matches found.") : t("No options.")}</div>
          ) : ( filtered.map((item: any, i: number) => children(item, reset, i)) )}
        </div>
      )}
    </div>
  )
}
export default SearchInput