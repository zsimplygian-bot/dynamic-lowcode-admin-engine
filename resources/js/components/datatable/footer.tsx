import { useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/use-translation"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
export const DataTableFooter = ({ totalRows, pageIndex, pageSize, totalPages, isFirstPage, isLastPage, goToPage, changePageSize, 
  goToFirstPage, goToPreviousPage, goToNextPage, goToLastPage }: any) => {
  const t = useTranslation()
  const items = useMemo(() => PAGE_SIZES.map((n) => ({ label: String(n), action: () => changePageSize(n) })), [changePageSize])
  const navButtons = useMemo(() => [
    { icon: ChevronsLeft, tip: t("First page"), disabled: isFirstPage, fn: goToFirstPage },
    { icon: ChevronLeft, tip: t("Previous page"), disabled: isFirstPage, fn: goToPreviousPage },
    { icon: ChevronRight, tip: t("Next page"), disabled: isLastPage, fn: goToNextPage },
    { icon: ChevronsRight, tip: t("Last page"), disabled: isLastPage, fn: goToLastPage },
  ], [t, isFirstPage, isLastPage, goToFirstPage, goToPreviousPage, goToNextPage, goToLastPage])
  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full">
      <div className="flex items-center justify-center gap-2 pl-1">
        <div className="text-left">
          <div className="font-bold tabular-nums text-xs sm:text-sm">{totalRows}</div>
          <div className="text-muted-foreground">{t("Records")}</div>
        </div>
        <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
          <span>{t("Page")}</span>
          <Input key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1} 
            className="w-16 h-8 text-xs text-center" onKeyDown={(e) => { if (e.key === "Enter") goToPage(+e.currentTarget.value) }} />
          <span>{t("of")} <strong className="font-semibold">{totalPages}</strong></span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{t("Rows:")}</span>
          <SmartDropdown buttonLabel={String(pageSize)} items={items} labelExtra={
            <Input type="number" min={1} placeholder={t("Custom...")} className="w-36 h-8 text-xs" 
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