import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
interface DynamicTableProps {
  tableName: string
  dataEndpoint?: string
  crudEndpoint?: string
  [key: string]: any
}
export default function DynamicTable({ tableName, ...restProps }: DynamicTableProps) {
  return (
    <>
      <Head title={`Listado de ${tableName}`} />
      <DynamicTableContent key={tableName} tableName={tableName} {...restProps} />
    </>
  )
}
DynamicTable.layout = (page: any) => ({ breadcrumbs: [{ title: page?.props?.tableName || "Tabla" }] })