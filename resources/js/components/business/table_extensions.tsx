import React from "react"
import { HistoriaForm } from "@/components/form/historia-form"
export interface TableExt {
  size?: string; autoEdit?: boolean; actions?: (id: string | number) => any[]
  render?: (form: React.ReactNode, ctx: { mode: string; targetId?: string | number; onSuccess?: (id?: any) => void }) => React.ReactNode
}
export const TABLE_EXTENSIONS: Record<string, TableExt> = {
  historia: {
    size: "4xl",
    autoEdit: true,
    actions: (id) => [{ label: "Print", icon: "printer", color: "text-sky-500", action: () => window.open(`/historia/${id}/pdf`, "_blank") }],
    render: (form, { mode, targetId, onSuccess }) => (
      <div className="flex flex-col lg:flex-row gap-6 w-full text-left">
        <div className="w-full lg:w-[380px] lg:shrink-0">{form}</div>
        <div className="w-full lg:flex-1 min-w-0 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 border-border">
          <HistoriaForm mode={mode as any} recordId={targetId} onSuccess={onSuccess} />
        </div>
      </div>
    )
  }
}
export const getTableExtension = (tableName?: string) => tableName ? TABLE_EXTENSIONS[tableName.toLowerCase()] : undefined