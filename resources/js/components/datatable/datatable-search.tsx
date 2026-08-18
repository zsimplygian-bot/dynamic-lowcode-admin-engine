import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, RotateCcw, Check } from "lucide-react"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"

interface DataTableSearchDropdownProps {
  columns: any[]
  appliedSearchValues: Record<string, any>
  setFilters: (filters: Record<string, any>) => void
}

export function DataTableSearchDropdown({ columns, appliedSearchValues, setFilters }: DataTableSearchDropdownProps) {
  const [localValues, setLocalValues] = useState<Record<string, any>>(appliedSearchValues || {})

  useEffect(() => {
    setLocalValues(appliedSearchValues || {})
  }, [appliedSearchValues])

  const searchFields: FieldConfig[] = useMemo(() => {
    return (columns || [])
      .filter((col: any) => col.accessor && !col.hidden && col.searchable !== false)
      .map((col: any) => {
        const fieldLabel = col.header || col.label || col.accessor
        return {
          id: col.accessor,
          name: col.accessor,
          label: fieldLabel,
          type: col.type || "text",
          placeholder: `${fieldLabel}...`,
          defaultValue: localValues[col.accessor] ?? "",
        }
      })
  }, [columns, localValues])

  const activeFiltersCount = useMemo(() => {
    return Object.values(appliedSearchValues || {}).filter(v => v !== undefined && v !== null && v !== "").length
  }, [appliedSearchValues])

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name) {
      setLocalValues((prev) => ({ ...prev, [name]: value }))
    }
  }, [])

  const handleApply = useCallback(() => {
    setFilters(localValues)
  }, [localValues, setFilters])

  const handleClearAll = useCallback(() => {
    const cleared = Object.keys(localValues || {}).reduce((acc, key) => {
      acc[key] = ""
      return acc
    }, {} as Record<string, string>)
    setLocalValues(cleared)
    setFilters(cleared)
  }, [localValues, setFilters])

  const items: SDItem[] = useMemo(() => {
    if (searchFields.length === 0) {
      return [{ type: "custom", custom: <span {...{ className: "text-xs text-muted-foreground px-2 py-2" }}>No hay campos disponibles</span> }]
    }

    return [
      {
        type: "custom" as const,
        custom: (
          <div {...{ className: "px-2 py-1 w-full max-h-[500px] overflow-y-auto" }} onChange={handleFormChange}>
            <FormGroup {...{ fields: searchFields, errors: {} }} />
          </div>
        ),
      },
      "-",
      {
        type: "custom" as const,
        custom: (
          <div {...{ className: "flex items-center gap-2 px-2 py-1.5 w-full" }}>
            <SmartButton {...{
              variant: "default",
              size: "xs",
              icons: Check,
              iconSize: 12,
              className: "flex-1 justify-center",
              onClick: handleApply,
              label: "Aplicar"
            }} />
            <SmartButton {...{
              variant: "ghost",
              size: "xs",
              icons: RotateCcw,
              iconSize: 12,
              className: "flex-1 justify-center text-muted-foreground hover:text-foreground",
              onClick: handleClearAll,
              label: "Limpiar"
            }} />
          </div>
        ),
      },
    ]
  }, [searchFields, handleFormChange, handleApply, handleClearAll])

  return (
    <SmartDropdown {...{
      triggerIcon: Search,
      triggerVariant: "default",
      triggerBadge: activeFiltersCount > 0 ? activeFiltersCount : undefined,
      align: "start",
      closeOnSelect: false,
      items,
      label: "Búsqueda Avanzada",
      disableHover: true
    }} />
  )
}