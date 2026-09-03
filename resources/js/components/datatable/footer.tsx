import { useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { Input } from "@/components/ui/input"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
export const DataTableFooter = ({ totalRows, pageIndex, pageSize, totalPages, isFirstPage, isLastPage, goToPage, changePageSize, 
  goToFirstPage, goToPreviousPage, goToNextPage, goToLastPage }: any) => {
  const items = useMemo(() => PAGE_SIZES.map((n) => ({ label: String(n), action: () => changePageSize(n) })), [changePageSize])
  const navButtons = [
    { icon: ChevronsLeft, tip: "Primera página", disabled: isFirstPage, fn: goToFirstPage },
    { icon: ChevronLeft, tip: "Página anterior", disabled: isFirstPage, fn: goToPreviousPage },
    { icon: ChevronRight, tip: "Página siguiente", disabled: isLastPage, fn: goToNextPage },
    { icon: ChevronsRight, tip: "Última página", disabled: isLastPage, fn: goToLastPage },
  ]
  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full">
      <div className="flex items-center justify-center gap-2 pl-1">
        <div className="text-left">
          <div className="font-bold tabular-nums text-xs sm:text-sm">{totalRows}</div>
          <div className="text-muted-foreground">Registros</div>
        </div>
        <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
          <span>Página</span>
          <Input key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1} 
            className="w-16 h-8 text-xs text-center" onKeyDown={(e) => { if (e.key === "Enter") goToPage(+e.currentTarget.value) }} />
          <span>de <strong className="font-semibold">{totalPages}</strong></span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Filas:</span>
          <SmartDropdown buttonLabel={String(pageSize)} items={items} labelExtra={
            <Input type="number" min={1} placeholder="Personalizado..." className="w-36 h-8 text-xs" 
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { changePageSize(+e.currentTarget.value); e.currentTarget.value = "" } }} />
          } />
        </div>
        <div className="flex items-center gap-1">
          {navButtons.map(({ icon, tip, disabled, fn }, i) => (
            <SmartButton key={i} icon={icon} tooltip={tip} disabled={disabled} onClick={fn} />
          ))}
        </div>
      </div>
    </div>
  )
}