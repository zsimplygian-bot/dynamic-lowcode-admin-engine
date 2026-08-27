import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
export default function DynamicTable(props: any) {
  const { tableName, dataEndpoint = `/tables/${props.tableName}/data` } = props
  return (
    <>
      <Head {...{ title: `Listado de ${tableName}` }} />
      <DynamicTableContent key={tableName} {...{ ...props, dataEndpoint }} />
    </>
  )
}
DynamicTable.layout = (page: any) => ({ breadcrumbs: [{ title: page?.props?.tableName || "Tabla" }] })