import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
export default function DynamicTable(props: any) {
  return (
    <>
      <Head {...{ title: `Listado de ${props.tableName}` }} />
      <DynamicTableContent key={props.tableName} {...props} />
    </>
  )
}
DynamicTable.layout = (page: any) => ({ breadcrumbs: [{ title: page?.props?.tableName || "Tabla" }] })