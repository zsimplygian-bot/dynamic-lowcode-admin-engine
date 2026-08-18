import { RotateCcw } from "lucide-react"
import { SmartButton } from "@/components/smart-button"

export function ResetTableButton({ onReset, isFiltered = false }: { onReset: () => void; isFiltered?: boolean }) {
  return <SmartButton {...{ tooltip: "Restablecer", icons: [RotateCcw], iconPosition: "left", onClick: onReset, disabled: !isFiltered }} />
}