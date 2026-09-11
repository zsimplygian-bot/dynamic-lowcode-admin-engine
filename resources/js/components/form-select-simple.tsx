import { Input } from "@/components/ui/input"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { SmartPopover } from "@/components/smart-popover"
import { SearchInput } from "@/components/search-input"
interface Option {
  id?: string | number
  label: string
}
interface FormSelectSimpleProps {
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  options?: Option[]
  onSelect?: (value: string) => void
}
export const FormSelectSimple = ({ name, value: valueProp, defaultValue, placeholder, disabled = false, options = [], onSelect }: FormSelectSimpleProps) => {
  const currentValue = String(valueProp ?? defaultValue ?? "")
  const selectedLabel = options.find((opt) => String(opt.id) === currentValue)?.label ?? ""
  return (
    <div>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <SmartPopover trigger={
          <div className="relative">
            <Input disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly />
            <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          </div> }  >
        {({ close }) => (
          <div className="p-1" onWheel={(e) => e.stopPropagation()}>
            <SearchInput items={options} searchKey="label" disabled={disabled}>
              {({ filteredItems, resetSearch, search }) => (
                <div className="max-h-70 overflow-y-auto space-y-0.5">
                  {filteredItems.length === 0 ? ( <div className="py-2 text-center text-sm text-muted-foreground">{search ? "No hay coincidencias." : "No hay opciones."}</div>
                  ) : (
                    filteredItems.map((opt) => {
                      const optId = String(opt.id)
                      const isSelected = currentValue === optId
                      return (
                        <button key={optId} onClick={() => { onSelect?.(optId); resetSearch(); close?.() }} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 
                        text-sm hover:bg-accent ${isSelected ? "bg-accent/60 " : ""}`}>
                          <span className="truncate">{opt.label}</span> {isSelected && <CheckIcon className="size-5" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </SearchInput>
          </div>
        )}
      </SmartPopover>
    </div>
  )
}
export default FormSelectSimple