import { memo, useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { useTranslation } from "@/hooks/use-translation"
import { EyeIcon } from "lucide-react"
interface Column { header: string; accessor: string; hidden?: boolean }
interface ToggleColumnsProps {
  columns: Column[]
  columnVisibility: Record<string, boolean>
  onToggle: (accessor: string) => void
}
export const ToggleColumns = memo(function ToggleColumns({ columns, columnVisibility, onToggle }: ToggleColumnsProps) {
  const t = useTranslation()
  const items = useMemo(() => columns.map(({ header: label, accessor: key, hidden }) => ({
    type: "checkbox" as const,
    label: label,
    checked: columnVisibility[key] ?? !hidden,
    onChange: () => onToggle(key)
  })), [columns, columnVisibility, onToggle, t])
  return <SmartDropdown { ...{ label: t("Visible columns:"), items, icon: EyeIcon } } />
})