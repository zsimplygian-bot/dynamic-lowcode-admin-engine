import { memo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandInput } from "@/components/ui/command"
import { CheckIcon, RotateCcw, Loader2 } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { SmartButton } from "@/components/smart-button"
import { InfoButton } from "@/components/info-button"
import { SmartPopover } from "@/components/smart-popover"
import { useFormSelectAsync } from "@/hooks/use-form-select-async"

interface FormSelectAsyncProps {
  id?: string; value?: string | number; defaultValue?: string | number; placeholder?: string; disabled?: boolean
  open?: boolean; setOpen?: (open: boolean) => void; onSelect?: (value: string) => void; lista?: string; name?: string; className?: string
}

const OptionItem = memo(({ id, label, isSelected, onSelect }: { id: any; label: string; isSelected: boolean; onSelect: (id: any) => void }) => {
  const handleClick = useCallback((e: React.MouseEvent) => { e.preventDefault(); onSelect(id) }, [id, onSelect])
  return (
    <button
      type="button" onClick={handleClick}
      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm text-left transition-colors hover:bg-accent select-none uppercase truncate ${isSelected ? "bg-accent/50 font-medium" : ""}`}
    >
      <span className="truncate">{label}</span>
      {isSelected && <CheckIcon className="h-4 w-4 ml-2 shrink-0 text-primary" />}
    </button>
  )
})
OptionItem.displayName = "OptionItem"

export const FormSelectAsync = memo(({
  id, value: valueProp, defaultValue, placeholder = "-", disabled = false,
  open: openProp, setOpen: setOpenProp, onSelect, lista, name, className
}: FormSelectAsyncProps) => {
  const {
    value, open, setOpen, search, setSearch, loadingLista, selectedLabel,
    filteredOptions, tableName, crudEndpoint, handleRefresh, handleSelectOption
  } = useFormSelectAsync({ id, valueProp, defaultValue, openProp, setOpenProp, onSelect, lista, name })

  const triggerButton = (
    <div className="relative w-full">
      <Input id={id} disabled={disabled} value={selectedLabel} placeholder={placeholder} readOnly className={className ?? "w-full cursor-pointer pr-8"} />
      {value && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
          <InfoButton row_id={value} tableName={tableName} endpoint={crudEndpoint} onSuccess={handleRefresh} />
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full">
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <SmartPopover
        open={open} onOpenChange={setOpen} trigger={triggerButton} align="center"
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[22px] max-w-[300px] z-50"
      >
        <Command shouldFilter={false} className="w-full">
          <div className="relative w-full p-1 border-b">
            <CommandInput disabled={disabled} value={search} onValueChange={setSearch} placeholder="Buscar..." className="w-full pr-16 text-xs h-8" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
              <SmartButton icon={RotateCcw} onClick={handleRefresh} tooltip="Refrescar" size="xs" isLoading={loadingLista} />
              <NewRecordButton tableName={tableName} endpoint={crudEndpoint} size="xs" onSuccess={handleRefresh} />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1 overscroll-contain">
            {loadingLista && (
              <div className="py-6 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
            {!loadingLista && filteredOptions.length === 0 && (
              <div className="py-3 text-center text-xs text-muted-foreground">
                {search ? "No hay coincidencias." : "Sin opciones."}
              </div>
            )}
            {!loadingLista && filteredOptions.map((opt) => (
              <OptionItem key={String(opt.id)} id={opt.id} label={String(opt.label ?? "")} isSelected={String(value) === String(opt.id)} onSelect={handleSelectOption} />
            ))}
          </div>
        </Command>
      </SmartPopover>
    </div>
  )
})

FormSelectAsync.displayName = "FormSelectAsync"
export default FormSelectAsync