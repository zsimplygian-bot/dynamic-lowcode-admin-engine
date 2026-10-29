import { useMemo } from "react"
import { Head, usePage } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
import type { FieldConfig } from "@/components/form-group"
const AUDIT_ACTIONS = [ { id: "s", label: "🔵 STORE" }, { id: "u", label: "🟢 UPDATE" }, { id: "d", label: "🔴 DELETE" }, ]
const capitalize = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "")
interface DynamicTableProps { tableName: string; dataEndpoint?: string; crudEndpoint?: string; maxHeight?: string }
export default function DynamicTable({ tableName, dataEndpoint, crudEndpoint, maxHeight }: DynamicTableProps) {
  const { tables_meta = {} } = usePage<any>().props
  const isAudit = tableName === "audit"
  const title = capitalize(tableName)
  // Enriquecedor de campos solo activo si es auditoría (memoizado para no recrear funciones)
  const transformFilterFields = useMemo(() => {
    if (!isAudit) return undefined
    return (fields: FieldConfig[]) => fields.map((f) => {
      const name = f.name ?? f.id
      if (name === "action") return { ...f, type: "select",  options: AUDIT_ACTIONS }
      if (name === "table") {
        const options = Object.values(tables_meta)
          .map((t: any) => ({ id: String(t.id ?? t.name), label: t.label ?? t.name }))
          .sort((a, b) => a.label.localeCompare(b.label))
        return { ...f, type: "select", options }
      }
      return f
    })
  }, [isAudit, tables_meta])
  return (
    <>
      <Head title={title} />
      <DynamicTableContent key={tableName} tableName={tableName} dataEndpoint={dataEndpoint} crudEndpoint={crudEndpoint} maxHeight={maxHeight}
        readOnly={isAudit} requireFilter={isAudit} transformFilterFields={transformFilterFields}
      />
    </>
  )
}

DynamicTable.layout = (page: any) => {
  const title = capitalize(page.props?.tableName) || "Table"
  return { header: title, breadcrumbs: [{ title }] }
}