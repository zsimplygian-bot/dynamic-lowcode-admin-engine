import { memo, useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandInput } from "@/components/ui/command"
import { CheckIcon } from "lucide-react"
import { SmartPopover } from "@/components/smart-popover"

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

interface OptionItemProps {
  id: any
  label: string
  isSelected: boolean
  onSelect: (id: any) => void
}

const OptionItem = memo(({ id, label, isSelected, onSelect }: OptionItemProps) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onSelect(id)
  }, [id, onSelect])

  return (
    <button {...{ type: "button", onClick: handleClick, className: `w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm text-left transition-colors hover:bg-accent select-none uppercase ${isSelected ? "bg-accent/50 font-medium" : ""}` }}>
      <span>{label}</span>
      {isSelected && <CheckIcon {...{ className: "h-4 w-4 ml-2 shrink-0 text-primary" }} />}
    </button>
  )
})
OptionItem.displayName = "OptionItem"

const OptionList = memo(({ options, currentValue, onSelect }: { options: Option[]; currentValue: any; onSelect: (id: any) => void }) => (
  <div {...{ className: "space-y-0.5" }}>
    {options.map((opt) => {
      const optId = opt.id ?? opt.value
      return (
        <OptionItem {...{ key: String(optId), id: optId, label: String(opt.label ?? ""), isSelected: String(currentValue) === String(optId), onSelect }} />
      )
    })}
  </div>
))
OptionList.displayName = "OptionList"

const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
  e.stopPropagation()
  e.currentTarget.scrollTop += e.deltaY
}

export const FormSelectSimple = memo(({ id, name, value: valueProp, defaultValue, placeholder = "-", disabled = false, options = [], className, onSelect }: FormSelectSimpleProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const currentValue = valueProp ?? defaultValue ?? ""

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => {
      const optId = opt.id ?? opt.value
      return String(optId) === String(currentValue)
    })
    return found ? String(found.label) : ""
  }, [options, currentValue])

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase().trim()
    return options.filter((opt) => String(opt.label).toLowerCase().includes(q))
  }, [options, search])

  const handleSelect = useCallback((val: any) => {
    onSelect?.(String(val))
    setOpen(false)
    setSearch("")
  }, [onSelect])

  const triggerButton = useMemo(() => (
    <div {...{ className: "relative w-full" }}>
      <Input {...{ id, disabled, value: selectedLabel, placeholder, readOnly: true, className: className ?? "w-full cursor-pointer" }} />
    </div>
  ), [id, disabled, selectedLabel, placeholder, className])

  return (
    <div {...{ className: "w-full" }}>
      {name && <input {...{ type: "hidden", name, value: String(currentValue) }} />}
      <SmartPopover {...{ open, onOpenChange: setOpen, trigger: triggerButton, align: "start", className: "p-0 w-[280px] min-w-[var(--radix-popover-trigger-width)] z-50" }}>
        <Command {...{ shouldFilter: false, className: "w-full" }}>
          <div {...{ className: "relative w-full p-1" }}>
            <CommandInput {...{ disabled, value: search, onValueChange: setSearch, placeholder: "Buscar...", className: "w-full" }} />
          </div>
          <div {...{ onWheel: handleWheelScroll, className: "max-h-60 overflow-y-auto p-1 overscroll-contain touch-pan-y" }}>
            {filteredOptions.length === 0 && (
              <div {...{ className: "py-2 text-center text-sm text-muted-foreground" }}>
                {search ? "No hay coincidencias." : "No hay opciones disponibles."}
              </div>
            )}
            {filteredOptions.length > 0 && (
              <OptionList {...{ options: filteredOptions, currentValue, onSelect: handleSelect }} />
            )}
          </div>
        </Command>
      </SmartPopover>
    </div>
  )
})

FormSelectSimple.displayName = "FormSelectSimple"
export default FormSelectSimple