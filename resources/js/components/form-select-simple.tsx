import { Input } from "@/components/ui/input"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { SmartPopover } from "@/components/smart-popover"
import { SearchInput } from "@/components/search-input"
export const FormSelectSimple = ({ name, value = "", defaultValue = "", placeholder, disabled, options = [], onSelect }: any) => {
  const currentVal = String(value || defaultValue)
  const selectedLabel = options.find((o: any) => String(o.id) === currentVal)?.label ?? ""
  return (
    <div>
      {name && <input type="hidden" name={name} value={currentVal} />}
      <SmartPopover trigger={
        <div className="relative">
          <Input disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly />
          <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        </div> }>
        {({ close }) => (
          <div className="p-1" onWheel={(e) => e.stopPropagation()}>
            <SearchInput items={options} searchKey="label" disabled={disabled}>
              {(opt: any, reset: () => void) => {
                const isSelected = currentVal === String(opt.id)
                return (
                  <button key={opt.id} onClick={() => { onSelect?.(String(opt.id)); reset(); close?.() }}
                    className={`w-full flex items-center rounded-sm justify-between px-2 py-1.5 text-sm hover:bg-accent ${isSelected ? "bg-accent/60" : ""}`}>
                    <span>{opt.label}</span> {isSelected && <CheckIcon className="size-5" />}
                  </button>
                )
              }}
            </SearchInput>
          </div>
        )}
      </SmartPopover>
    </div>
  )
}
export default FormSelectSimple