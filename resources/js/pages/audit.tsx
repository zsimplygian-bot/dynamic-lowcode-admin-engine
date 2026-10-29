import { Head, usePage } from "@inertiajs/react"
import { DynamicTableContent } from "@/components/dynamic-table"
import type { FieldConfig } from "@/components/form-group"

export default function AuditPage() {
  const { tables_meta = {} } = usePage<any>().props

  // Personalización aislada exclusivamente para auditoría
  const auditFilterTransform = (fields: FieldConfig[]) =>
    fields.map((f) => {
      const name = f.name ?? f.id
      if (name === "action") {
        return {
          ...f,
          type: "select",
          placeholder: "Todas las acciones",
          options: [
            { id: "s", label: "🟢 STORE (Creación)" },
            { id: "u", label: "🔵 UPDATE (Modificación)" },
            { id: "d", label: "🔴 DELETE (Eliminación)" },
          ],
        }
      }
      if (name === "table") {
        return {
          ...f,
          type: "select",
          placeholder: "Todas las tablas",
          options: Object.values(tables_meta)
            .map((t: any) => ({
              id: String(t.id ?? t.name),
              label: t.label ?? t.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        }
      }
      return f
    })

  return (
    <>
      <Head title="Auditoría" />
      <DynamicTableContent
        tableName="audit"
        readOnly // En auditoría no se crean registros manualmente
        requireFilter // Exige filtro antes de consultar
        transformFilterFields={auditFilterTransform} // Pasa los campos enriquecidos
      />
    </>
  )
}

AuditPage.layout = { header: "Auditoría", breadcrumbs: [{ title: "Auditoría" }] }