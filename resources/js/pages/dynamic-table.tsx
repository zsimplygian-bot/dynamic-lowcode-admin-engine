import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
interface DynamicTableProps {
  tableName: string
  dataEndpoint?: string
  crudEndpoint?: string
  maxHeight?: string
}
export default function DynamicTable({ tableName, dataEndpoint, crudEndpoint, maxHeight }: DynamicTableProps) {
  return (
    <><Head title={`Listado de ${tableName}`} />
      <DynamicTableContent key={tableName} tableName={tableName} dataEndpoint={dataEndpoint} crudEndpoint={crudEndpoint} maxHeight={maxHeight}
      />
    </>
  )
}
DynamicTable.layout = (page: any) => ({ breadcrumbs: [{ title: page?.props?.tableName || "Tabla" }] })