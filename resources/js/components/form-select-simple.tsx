import { memo } from "react"
import { Input } from "@/components/ui/input"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { SmartPopover } from "@/components/smart-popover"
import { SearchInput } from "@/components/search-input"

interface Option {
  id?: string | number
  value?: string | number
  label: string
}

interface FormSelectSimpleProps {
  id?: string
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  options?: Option[]
  className?: string
  onSelect?: (value: string) => void
}

export const FormSelectSimple = memo(({ id, name, value: valueProp, defaultValue, placeholder, disabled = false, options = [], className, onSelect }: FormSelectSimpleProps) => {
  const currentValue = String(valueProp ?? defaultValue ?? "")
  const selectedLabel = String(options.find((opt) => String(opt.id ?? opt.value) === currentValue)?.label ?? "")

  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={currentValue} />}
      <SmartPopover
        align="center"
        trigger={
          <div className="relative w-full">
            <Input
              id={id}
              disabled={disabled}
              value={selectedLabel}
              placeholder={placeholder}
              readOnly
              className={`pr-8 w-full cursor-pointer text-left ${className ?? ""}`}
            />
            <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        }
      >
        {({ close }) => (
          <div className="flex flex-col gap-1 w-full text-left p-1" onWheel={(e) => e.stopPropagation()}>
            <SearchInput items={options} searchKey="label" disabled={disabled} className="h-8 text-sm">
              {({ filteredItems, resetSearch, search }) => (
                <div tabIndex={-1} className="max-h-56 overflow-y-auto space-y-0.5 pointer-events-auto touch-pan-y outline-none">
                  {filteredItems.length === 0 ? (
                    <div className="py-2 text-center text-xs text-muted-foreground">{search ? "No hay coincidencias." : "No hay opciones."}</div>
                  ) : (
                    filteredItems.map((opt) => {
                      const optId = String(opt.id ?? opt.value)
                      const isSelected = currentValue === optId
                      return (
                        <button key={optId} type="button" onClick={() => { onSelect?.(optId); resetSearch(); close?.() }} className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent select-none ${isSelected ? "bg-accent/60 " : ""}`}>
                          <span className="truncate">{opt.label}</span>
                          {isSelected && <CheckIcon className="size-4 ml-2 shrink-0 text-primary" />}
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
})

FormSelectSimple.displayName = "FormSelectSimple"
export default FormSelectSimple