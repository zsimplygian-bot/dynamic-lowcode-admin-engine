import { Head } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
export default function AuditLog() {
  return (
    <><Head title="Auditoría" />
      <DynamicTableContent tableName="audit" readOnly customIdKey="at" />
    </>
  )
}
AuditLog.layout = { header: "Auditoría", breadcrumbs: [{ title: "Auditoría" }] }