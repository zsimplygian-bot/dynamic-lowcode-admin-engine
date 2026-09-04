import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Filter, Check } from "lucide-react"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { ResetButton } from "@/components/reset-button"
import { FormGroup, FieldConfig } from "@/components/form-group"

interface DataTableSearchDropdownProps {
  fields?: FieldConfig[]
  appliedValues: Record<string, any>
  activeCount: number
  onApply: (filters: Record<string, any>) => void
  onClear: () => void
}

const SearchFormContent = memo(function SearchFormContent({
  fields = [],
  appliedValues = {},
  onApply,
  onClear
}: Omit<DataTableSearchDropdownProps, "activeCount">) {
  const [localValues, setLocalValues] = useState<Record<string, any>>(() => appliedValues)

  useEffect(() => {
    setLocalValues(appliedValues || {})
  }, [appliedValues])

  const handleFormChange = useCallback((name: string, value: any) => {
    setLocalValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const hasValues = useMemo(() => {
    return Object.values(localValues).some((v) => v !== "" && v !== null && v !== undefined)
  }, [localValues])

  const handleApply = useCallback(() => {
    if (hasValues) onApply(localValues)
  }, [hasValues, localValues, onApply])

  const handleClear = useCallback(() => {
    setLocalValues({})
    onClear()
  }, [onClear])

  if (!fields.length) {
    return <span className="text-xs text-muted-foreground px-2 py-2">No hay campos disponibles</span>
  }

  return (
    <div className="flex flex-col gap-2 p-1" onClick={(e) => e.stopPropagation()}>
      <div className="w-100 pl-2 max-h-[400px] overflow-y-auto">
        <FormGroup fields={fields} values={localValues} layout="horizontal" onChange={handleFormChange} />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t">
        <SmartButton variant="default" size="sm" icon={Check} disabled={!hasValues} className="flex-1 justify-center" onClick={handleApply} label="Aplicar" />
        <ResetButton onReset={handleClear} canReset={hasValues} size="sm" variant="ghost" className="flex-1 justify-center" label="Limpiar" tooltip="" />
      </div>
    </div>
  )
})

export function DataTableSearchDropdown({ activeCount, appliedValues, fields, onApply, onClear }: DataTableSearchDropdownProps) {
  const items: SDItem[] = useMemo(() => [
    { type: "custom" as const, custom: <SearchFormContent fields={fields} appliedValues={appliedValues} onApply={onApply} onClear={onClear} /> }
  ], [fields, appliedValues, onApply, onClear])

  return (
    <SmartDropdown icon={Filter} variant="default" badge={activeCount > 0 ? activeCount : undefined} align="start" items={items} label="Filtro avanzado" disableHover />
  )
}