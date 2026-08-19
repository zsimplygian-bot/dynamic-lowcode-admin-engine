import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Search, RotateCcw, Check } from "lucide-react"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"

interface DataTableSearchDropdownProps {
  fields: FieldConfig[]
  appliedValues: Record<string, any>
  activeCount: number
  onApply: (filters: Record<string, any>) => void
  onClear: () => void
}

const SearchFormContent = memo(function SearchFormContent({ fields, appliedValues, onApply, onClear }: Omit<DataTableSearchDropdownProps, "activeCount">) {
  const [localValues, setLocalValues] = useState<Record<string, any>>(appliedValues || {})

  useEffect(() => {
    setLocalValues(appliedValues || {})
  }, [appliedValues])

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name) setLocalValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleApply = useCallback(() => onApply(localValues), [localValues, onApply])

  const handleClear = useCallback(() => {
    setLocalValues({})
    onClear()
  }, [onClear])

  if (fields.length === 0) {
    return <span { ...{ className: "text-xs text-muted-foreground px-2 py-2" } }>No hay campos disponibles</span>
  }

  return (
    <div { ...{ className: "flex flex-col gap-2 p-1" } }>
      <div { ...{ className: "px-1 py-1 w-full max-h-[400px] overflow-y-auto" } }>
        <FormGroup { ...{ fields, values: localValues, onChange: handleFormChange } } />
      </div>
      <div { ...{ className: "flex items-center gap-2 pt-2 border-t" } }>
        <SmartButton { ...{ variant: "default", size: "xs", icons: Check, iconSize: 12, className: "flex-1 justify-center", onClick: handleApply, label: "Aplicar" } } />
        <SmartButton { ...{ variant: "ghost", size: "xs", icons: RotateCcw, iconSize: 12, className: "flex-1 justify-center text-muted-foreground hover:text-foreground", onClick: handleClear, label: "Limpiar" } } />
      </div>
    </div>
  )
})

export function DataTableSearchDropdown({ fields, appliedValues, activeCount, onApply, onClear }: DataTableSearchDropdownProps) {
  const items: SDItem[] = useMemo(() => [
    { type: "custom" as const, custom: <SearchFormContent { ...{ fields, appliedValues, onApply, onClear } } /> },
  ], [fields, appliedValues, onApply, onClear])

  return (
    <SmartDropdown { ...{ triggerIcon: Search, triggerVariant: "default", triggerBadge: activeCount > 0 ? activeCount : undefined, align: "start", closeOnSelect: false, items, label: "Búsqueda Avanzada", disableHover: true } } />
  )
}