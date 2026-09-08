import { memo, useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { useTranslation } from "@/hooks/use-translation"
import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react"
import { useDataExport } from "@/hooks/datatable/use-datatable-export"
interface ExportMenuProps { tableName: string; columns: any[]; data: any[] }
export const ExportMenu = memo(function ExportMenu({ tableName, columns, data }: ExportMenuProps) {
  const t = useTranslation()
  const { exportToExcel } = useDataExport(tableName, columns, data)
  const items = useMemo(() => [ { label: t("Excel"), color: "text-green-500", icon: FileSpreadsheetIcon, action: exportToExcel } ], [exportToExcel, t])
  return <SmartDropdown { ...{ label: t("Export"), icon: DownloadIcon, items } } />
})