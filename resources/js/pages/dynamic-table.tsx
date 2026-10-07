import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"

interface DynamicTableProps {
  tableName: string
  dataEndpoint?: string
  crudEndpoint?: string
  maxHeight?: string
}

export default function DynamicTable({ tableName, dataEndpoint, crudEndpoint, maxHeight }: DynamicTableProps) {
  const formattedTitle = tableName ? tableName.charAt(0).toUpperCase() + tableName.slice(1) : ""

  return (
    <>
      <Head title={formattedTitle} />
      <DynamicTableContent key={tableName} tableName={tableName} dataEndpoint={dataEndpoint} crudEndpoint={crudEndpoint} maxHeight={maxHeight} />
    </>
  )
}

DynamicTable.layout = (page: any) => {
  const tableName = page.props?.tableName
  const title = tableName ? tableName.charAt(0).toUpperCase() + tableName.slice(1) : "Tabla"

  return {
    header: title,
    breadcrumbs: [{ title: tableName || "Tabla" }]
  }
}