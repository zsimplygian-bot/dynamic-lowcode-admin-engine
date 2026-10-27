import { SmartButton } from "@/components/smart-button"
import { SmartDropdown } from "@/components/smart-dropdown"
import { Input } from "@/components/ui/input"
export interface TablePaginationProps { pageIndex: number; pageSize: number; totalRows: number; totalPages: number; onPageChange: (p: number) => void; 
  onPageSizeChange: (s: number) => void; baseId?: string; selectedCount?: number; }
export function TablePagination({ pageIndex, pageSize, totalRows, totalPages, onPageChange, onPageSizeChange, baseId, selectedCount = 0 }: TablePaginationProps) {
  const canPrev = pageIndex > 0, canNext = pageIndex < totalPages - 1
  const nav = [ { icon: "chevrons-left", tip: t("First page"), dis: !canPrev, fn: () => onPageChange(1) },
                { icon: "chevron-left", tip: t("Previous page"), dis: !canPrev, fn: () => onPageChange(pageIndex) },
                { icon: "chevron-right", tip: t("Next page"), dis: !canNext, fn: () => onPageChange(pageIndex + 2) },
                { icon: "chevrons-right", tip: t("Last page"), dis: !canNext, fn: () => onPageChange(totalPages) }, ]
  return (
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 mt-2 text-sm w-full flex-none">
      <div className="flex items-center justify-center gap-2 pl-1">
        <div className="text-left min-w-[50px] pr-2">
          <strong>{selectedCount} <span className="font-normal text-muted-foreground">{t("of")}</span> {totalRows}</strong> <div className="text-muted-foreground">{t("Selected")}</div>
        </div>
        <div className="text-left border-l pl-2"><strong>{totalRows}</strong><div className="text-muted-foreground">{t("Records")}</div></div>
        <div className="flex items-center gap-1.5 leading-tight border-l pl-2">
          <div>{t("Page")}</div>
          <Input id={`${baseId}-page`} name={`${baseId}-page`} key={pageIndex} type="number" min={1} max={totalPages} defaultValue={pageIndex + 1} className="w-16 text-sm text-left" 
          onKeyDown={(e) => e.key === "Enter" && +e.currentTarget.value > 0 && onPageChange(+e.currentTarget.value)} />
          <span>{t("of")} <strong>{totalPages}</strong></span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span>{t("Rows:")}</span>
          <SmartDropdown buttonLabel={String(pageSize)} variant="outline" items={[
            { type: "custom", content: <Input id={`${baseId}-pagesize`} name={`${baseId}-pagesize`} type="number" min={1} placeholder={t("Custom...")} className="w-26 text-sm" 
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && +e.currentTarget.value > 0) { onPageSizeChange(+e.currentTarget.value); e.currentTarget.value = "" } }} /> },
            "-", ...[10, 15, 20, 50, 100, 250, 500].map((n) => ({ label: String(n), action: () => onPageSizeChange(n) })) ]} />
        </div>
        <div className="flex items-center gap-1"> {nav.map((b, i) => <SmartButton key={i} icon={b.icon} variant="outline" tooltip={b.tip} disabled={b.dis} onClick={b.fn} />)} </div>
      </div>
    </div>
  )
}