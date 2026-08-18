import { useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { Input } from "@/components/ui/input"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
const PAGE_SIZES = [10, 15, 20, 50, 100, 250, 500]
export const DataTableFooter = ({
  totalRows, pageIndex, pageSize, totalPages, isFirstPage, isLastPage, goToPage,
  changePageSize, goToFirstPage, goToPreviousPage, goToNextPage, goToLastPage,
  }: any) => {
  const items = useMemo(() => PAGE_SIZES.map((n) => ({ label: String(n), action: () => changePageSize(n) })), [changePageSize])
  return (
    <div {...{ className: "flex flex-wrap sm:flex-nowrap items-center justify-end gap-4 mt-2 text-sm" }}>
      <div {...{ className: "flex items-center gap-2" }}> Filas:
        <SmartDropdown {...{ triggerLabel: String(pageSize), items,
            labelExtra: (
              <Input {...{ type: "number", min: 1, placeholder: "Personalizado...", className: "w-36 h-8 text-xs",
                  onKeyDown: (e) => { e.stopPropagation()
                    if (e.key === "Enter") { changePageSize(e.currentTarget.value), e.currentTarget.value = "" }
                    },
                  }}
              />
            ),
          }}
        />
      </div>
      <div {...{ className: "flex items-center gap-1" }}>
        <SmartButton {...{ icons: ChevronsLeft, tooltip: "Primera página", disabled: isFirstPage, onClick: goToFirstPage }} />
        <SmartButton {...{ icons: ChevronLeft, tooltip: "Página anterior", disabled: isFirstPage, onClick: goToPreviousPage }} />
        <SmartButton {...{ icons: ChevronRight, tooltip: "Página siguiente", disabled: isLastPage, onClick: goToNextPage }} />
        <SmartButton {...{ icons: ChevronsRight, tooltip: "Última página", disabled: isLastPage, onClick: goToLastPage }} />
      </div>
      <div {...{ className: "flex items-center gap-2 text-right" }}> Página
        <Input key={pageIndex} {...{ type: "number", min: 1, max: totalPages, defaultValue: pageIndex + 1, className: "w-16 h-8 text-xs",
            onKeyDown: (e) => { if (e.key === "Enter") goToPage(e.currentTarget.value) },
          }}
        /> de <span {...{ className: "font-medium" }}>{totalPages}</span>
        <div {...{ className: "text-right leading-tight border-l pl-3 ml-1" }}>
          <div {...{ className: "font-bold tabular-nums" }}>{totalRows}</div>
          <div {...{ className: "text-[10px] text-muted-foreground uppercase tracking-wider" }}>Registros</div>
        </div>
      </div>
    </div>
  )
}