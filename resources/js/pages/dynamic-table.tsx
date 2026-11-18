import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
const capitalize = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "")
interface DynamicTableProps {
  tableName: string
  dataEndpoint?: string
  crudEndpoint?: string
  maxHeight?: string
}
export default function DynamicTable({ tableName, dataEndpoint, crudEndpoint, maxHeight }: DynamicTableProps) {
  const title = capitalize(tableName)
  return (
    <><Head title={title} />
      <DynamicTableContent
        key={tableName}
        tableName={tableName}
        dataEndpoint={dataEndpoint}
        crudEndpoint={crudEndpoint}
        maxHeight={maxHeight}
      />
    </>
  )
}
DynamicTable.layout = (page: any) => {
  const title = capitalize(page.props?.tableName) || "Table"
  return { header: title, breadcrumbs: [{ title }] }
}