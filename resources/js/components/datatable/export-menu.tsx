import { memo, useMemo } from "react"
import { SmartDropdown } from "@/components/smart-dropdown"
import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react"
import { useDataExport } from "@/hooks/datatable/use-datatable-export"
interface ExportMenuProps { tableName: string; columns: any[]; data: any[] }
export const ExportMenu = memo(function ExportMenu({ tableName, columns, data }: ExportMenuProps) {
  const { exportToExcel } = useDataExport(tableName, columns, data)
  const items = useMemo(() => [{ label: "Excel", icon: FileSpreadsheetIcon, action: exportToExcel }], [exportToExcel])
  return <SmartDropdown { ...{ label: "Exportar", icon: DownloadIcon, items } } />
})