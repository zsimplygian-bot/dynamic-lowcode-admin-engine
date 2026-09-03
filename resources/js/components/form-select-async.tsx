import { memo, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandInput } from "@/components/ui/command"
import { CheckIcon } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { InfoButton } from "@/components/info-button"
import { SmartPopover } from "@/components/smart-popover"
import { ResetButton } from "@/components/reset-button"
import { AsyncState } from "@/components/async-state"
import { useFormSelectAsync } from "@/hooks/use-form-select-async"
interface FormSelectAsyncProps {
  id?: string; name: string; value?: string | number; defaultValue?: string | number; placeholder?: string
  disabled?: boolean; className?: string; onSelect?: (value: string) => void
}
const OptionItem = memo(({ id, label, isSelected, onSelect }: { id: any; label: string; isSelected: boolean; onSelect: (id: any) => void }) => {
  const handleClick = useCallback((e: React.MouseEvent) => { e.preventDefault(); onSelect(id) }, [id, onSelect])
  return (
    <button onClick={handleClick} className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm text-left transition-colors hover:bg-accent select-none uppercase truncate ${isSelected ? "bg-accent/50 font-medium" : ""}`}>
      <span className="truncate">{label}</span> {isSelected && <CheckIcon className="h-4 w-4 ml-2 shrink-0 text-primary" />}
    </button>
  )
})
OptionItem.displayName = "OptionItem"
export const FormSelectAsync = memo(({ id, name, value: valueProp, defaultValue, placeholder = "-", disabled = false, className, onSelect }: FormSelectAsyncProps) => {
  const {
    value, open, setOpen, search, setSearch, loadingLista, selectedLabel,
    filteredOptions, tableName, crudEndpoint, handleRefresh, handleSelectOption
  } = useFormSelectAsync({ name, valueProp, defaultValue, onSelect })
  const currentValStr = useMemo(() => value != null ? String(value) : "", [value])
  const triggerButton = useMemo(() => (
    <div className="relative w-full">
      <Input id={id} disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly className={className ?? "w-full cursor-pointer pr-8"} />
      {value && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
          <InfoButton row_id={value} tableName={tableName} endpoint={crudEndpoint} onSuccess={handleRefresh} />
        </div>
      )}
    </div>
  ), [id, disabled, selectedLabel, placeholder, className, value, tableName, crudEndpoint, handleRefresh])
  return (
    <div className="w-full">
      <input type="hidden" name={name} value={value ?? ""} />
      <SmartPopover open={open} onOpenChange={setOpen} trigger={triggerButton} align="center">
        {({ close }) => (
          <Command shouldFilter={false} className="w-full">
            <div className="relative w-full p-1">
              <CommandInput disabled={disabled} value={search} onValueChange={setSearch} placeholder="Buscar..."/>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                <ResetButton onReset={handleRefresh} isLoading={loadingLista} size="xs" />
                <NewRecordButton tableName={tableName} endpoint={crudEndpoint} size="xs" onSuccess={handleRefresh} />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1 overscroll-contain">
              <AsyncState isLoading={loadingLista}>
                {filteredOptions.length === 0 ? ( <div className="py-3 text-center text-xs text-muted-foreground"> {search ? "No hay coincidencias." : "Sin opciones."} </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <OptionItem key={String(opt.id)} id={opt.id} label={String(opt.label ?? "")} isSelected={currentValStr === String(opt.id)}
                      onSelect={(selectedId) => { handleSelectOption(selectedId); close() }}
                    />
                  ))
                )}
              </AsyncState>
            </div>
          </Command>
        )}
      </SmartPopover>
    </div>
  )
})
FormSelectAsync.displayName = "FormSelectAsync"
export default FormSelectAsync