import { useMemo } from "react"
import { Head, usePage } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
import type { FieldConfig } from "@/components/form-group"

const AUDIT_ACTIONS = [
  { id: "s", label: "🔵 STORE" },
  { id: "u", label: "🟢 UPDATE" },
  { id: "d", label: "🔴 DELETE" },
]

export default function AuditPage() {
  const { tables_meta = {} } = usePage<any>().props

  // Enriquecedor exclusivo para los filtros de auditoría
  const transformFilterFields = useMemo(() => {
    return (fields: FieldConfig[]) =>
      fields.map((f) => {
        const name = f.name ?? f.id

        if (name === "action") {
          return { ...f, type: "select", options: AUDIT_ACTIONS }
        }

        if (name === "table") {
          const options = Object.values(tables_meta)
            .map((t: any) => ({
              id: String(t.id ?? t.name),
              label: t.label ?? t.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))

          return { ...f, type: "select", options }
        }

        return f
      })
  }, [tables_meta])

  return (
    <><Head title="Auditoría" />
      <DynamicTableContent tableName="audit" readOnly={true}
        requireFilter={true}
        transformFilterFields={transformFilterFields}
      />
    </>
  )
}
AuditPage.layout = () => ({ header: "Auditoría del Sistema", breadcrumbs: [{ title: "Auditoría" }], })