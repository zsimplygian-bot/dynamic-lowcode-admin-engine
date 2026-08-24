import { memo, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandInput } from "@/components/ui/command"
import { CheckIcon, RotateCcw } from "lucide-react"
import { NewRecordButton } from "@/components/new-record-button"
import { SmartButton } from "@/components/smart-button"
import { InfoButton } from "@/components/info-button"
import { SmartPopover } from "@/components/smart-popover"
import { useFormSelectAsync } from "@/hooks/use-form-select-async"

interface FormSelectAsyncProps {
  id?: string; value?: string | number; defaultValue?: string | number; placeholder?: string; disabled?: boolean
  open?: boolean; setOpen?: (open: boolean) => void; onSelect?: (value: string) => void; lista?: string; name?: string; className?: string
}

interface OptionItemProps { id: any; label: string; isSelected: boolean; onSelect: (id: any) => void }

const OptionItem = memo(({ id, label, isSelected, onSelect }: OptionItemProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => { e.preventDefault(); onSelect(id) }, [id, onSelect])
  return (
    <button {...{ type: "button", onClick: handleClick, className: `w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm text-left transition-colors hover:bg-accent select-none uppercase ${isSelected ? "bg-accent/50 font-medium" : ""}` }}>
      <span>{label}</span>
      {isSelected && <CheckIcon {...{ className: "h-4 w-4 ml-2 shrink-0 text-primary" }} />}
    </button>
  )
})
OptionItem.displayName = "OptionItem"

const OptionList = memo(({ options, currentValue, onSelect }: { options: any[]; currentValue: any; onSelect: (id: any) => void }) => (
  <div {...{ className: "space-y-0.5" }}>
    {options.map((opt) => (
      <OptionItem {...{ key: String(opt.id), id: opt.id, label: String(opt.label ?? ""), isSelected: String(currentValue) === String(opt.id), onSelect }} />
    ))}
  </div>
))
OptionList.displayName = "OptionList"

const preventEvent = (e: React.SyntheticEvent) => { e.stopPropagation(); e.preventDefault() }

const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
  e.stopPropagation()
  e.currentTarget.scrollTop += e.deltaY
}

export const FormSelectAsync = memo(({ id, value: valueProp, defaultValue, placeholder = "-", disabled = false, open: openProp, setOpen: setOpenProp, onSelect, lista, name, className }: FormSelectAsyncProps) => {
  const { value, open, setOpen, search, setSearch, cacheState, loadingLista, selectedLabel, filteredOptions, tableName, crudEndpoint, handleRefresh, handleSelectOption } = useFormSelectAsync({ id, valueProp, defaultValue, openProp, setOpenProp, onSelect, lista, name })

  const triggerButton = useMemo(() => (
    <div {...{ className: "relative w-full" }}>
      <Input {...{ id, disabled, value: selectedLabel, placeholder, readOnly: true, className: className ?? "w-full cursor-pointer pr-8" }} />
      {value && (
        <div {...{ className: "absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-muted z-20 pointer-events-auto", onClick: preventEvent, onMouseDown: preventEvent }}>
          <InfoButton {...{ row_id: value, tableName, endpoint: crudEndpoint, onSuccess: handleRefresh }} />
        </div>
      )}
    </div>
  ), [id, disabled, selectedLabel, placeholder, className, value, tableName, crudEndpoint, handleRefresh])

  return (
    <div {...{ className: "w-full" }}>
      {name && <input {...{ type: "hidden", name, value: value ?? "" }} />}
      <SmartPopover {...{ open, onOpenChange: setOpen, trigger: triggerButton, align: "start", className: "p-0 w-[280px] min-w-[var(--radix-popover-trigger-width)] z-50" }}>
        <Command {...{ shouldFilter: false, className: "w-full" }}>
          <div {...{ className: "relative w-full p-1" }}>
            <CommandInput {...{ disabled, value: search, onValueChange: setSearch, placeholder: "Buscar...", className: "w-full pr-16" }} />
            <div {...{ className: "absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10" }}>
              <SmartButton {...{ icon: RotateCcw, onClick: handleRefresh, tooltip: "Refrescar", size: "xs" }} />
              <NewRecordButton {...{ tableName, endpoint: crudEndpoint, size: "xs", onSuccess: handleRefresh }} />
            </div>
          </div>
          <div {...{ onWheel: handleWheelScroll, className: "max-h-60 overflow-y-auto p-1 overscroll-contain touch-pan-y" }}>
            {loadingLista && cacheState.options.length === 0 && (
              <div {...{ className: "py-2 text-center text-sm text-muted-foreground" }}>Cargando...</div>
            )}
            {!loadingLista && filteredOptions.length === 0 && (
              <div {...{ className: "py-2 text-center text-sm text-muted-foreground" }}>
                {search ? "No hay coincidencias." : "No hay opciones disponibles."}
              </div>
            )}
            {filteredOptions.length > 0 && (
              <OptionList {...{ options: filteredOptions, currentValue: value, onSelect: handleSelectOption }} />
            )}
          </div>
        </Command>
      </SmartPopover>
    </div>
  )
})

FormSelectAsync.displayName = "FormSelectAsync"
export default FormSelectAsync