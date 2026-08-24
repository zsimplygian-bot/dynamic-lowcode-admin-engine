import { RotateCcw } from "lucide-react"
import { SmartButton } from "@/components/smart-button"
export function ResetTableButton({ onReset, isFiltered = false }: { onReset: () => void; isFiltered?: boolean }) {
  return <SmartButton {...{ tooltip: "Restablecer", icon: RotateCcw, onClick: onReset, disabled: !isFiltered }} />
}