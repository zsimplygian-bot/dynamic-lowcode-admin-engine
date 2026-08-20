import { memo, useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { EyeIcon } from "lucide-react"

interface Column { header: string; accessor: string; hidden?: boolean }
interface ToggleColumnsProps {
  columns: Column[]
  columnVisibility: Record<string, boolean>
  onToggle: (accessor: string) => void
}

export const ToggleColumns = memo(function ToggleColumns({ columns, columnVisibility, onToggle }: ToggleColumnsProps) {
  const items = useMemo(() => columns.map(({ header: label, accessor: key, hidden }) => ({
    type: "checkbox" as const,
    label,
    checked: columnVisibility[key] ?? !hidden,
    onChange: () => onToggle(key)
  })), [columns, columnVisibility, onToggle])

  return <SmartDropdown { ...{ label: "Columnas visibles:", items, closeOnSelect: false, triggerIcon: EyeIcon } } />
})