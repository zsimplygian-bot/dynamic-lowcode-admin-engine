import { memo, useState, useCallback, useMemo } from "react"
import { CopyIcon, EyeIcon, EditIcon, TrashIcon, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { SmartDropdown } from "@/components/smart-dropdown"
import { SmartModal } from "@/components/smart-modal"
import { SmartButton } from "@/components/smart-button"
import { DynamicForm } from "@/components/form/dynamic-form"

interface ActionButtonsProps {
  row_id?: string | number
  tableName?: string
  title?: string
  endpoint?: string
  updateEndpoint?: string
  deleteEndpoint?: string
  icon?: any
  fields?: any[]
  initialValues?: Record<string, any>
  onSuccess?: (id?: any) => void
  eye?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  [key: string]: any
}

type ActionMode = "info" | "update" | "delete"

const DeleteWarning = () => (
  <div {...{ className: "p-2 text-sm rounded-lg bg-destructive/10 text-destructive font-medium border border-destructive/20 text-left" }}>
    ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
  </div>
)

export const ActionButtons = memo(({ row_id, tableName, title, endpoint, updateEndpoint, deleteEndpoint, icon, fields = [], initialValues = {}, onSuccess, eye, size, ...props }: ActionButtonsProps) => {
  const [action, setAction] = useState<ActionMode | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const rawTableName = tableName || title || "registro"
  const resolvedId = row_id ?? initialValues?.id ?? initialValues?.[`id_${rawTableName.toLowerCase().trim()}`]
  const upperTableName = rawTableName.toUpperCase()

  const copyId = useCallback(() => {
    if (!resolvedId) return
    navigator.clipboard.writeText(String(resolvedId))
    toast.success("ID copiado")
  }, [resolvedId])

  const handleOpenAction = useCallback((mode: ActionMode) => {
    setAction(mode)
    setIsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Retardamos la limpieza del estado 'action' para permitir que complete la animación de salida de Radix
      setTimeout(() => setAction(null), 200)
    }
  }, [])

  const actionsMap = useMemo(() => {
    const baseEndpoint = endpoint ?? ""
    return {
      info: { key: "info", label: "Detalle", icon: EyeIcon, color: "text-blue-500", mode: "info" as const, title: `DETALLE ${upperTableName}`, description: "Consulta los datos del registro.", endpoint: baseEndpoint },
      update: { key: "update", label: "Editar", icon: EditIcon, color: "text-green-500", mode: "update" as const, title: `EDITAR ${upperTableName}`, description: "Actualiza los datos del registro.", endpoint: updateEndpoint ?? baseEndpoint },
      delete: { key: "delete", label: "Eliminar", icon: TrashIcon, color: "text-red-500", mode: "delete" as const, title: `ELIMINAR ${upperTableName}`, description: <DeleteWarning />, endpoint: deleteEndpoint ?? baseEndpoint }
    }
  }, [upperTableName, endpoint, updateEndpoint, deleteEndpoint])

  const dropdownItems = useMemo(() => [
    { label: "Copiar ID", icon: CopyIcon, action: copyId },
    ...Object.values(actionsMap).map(cfg => ({ key: cfg.key, label: cfg.label, icon: cfg.icon, color: cfg.color, action: () => handleOpenAction(cfg.key as ActionMode) }))
  ], [copyId, actionsMap, handleOpenAction])

  if (eye) {
    const eyeCfg = actionsMap.info
    return (
      <SmartModal {...{ title: eyeCfg.title, description: eyeCfg.description, trigger: <SmartButton {...{ icons: EyeIcon, variant: "ghost", tooltip: "Ver detalle", size: "sm", ...props }} /> }}>
        {({ close }) => (
          <DynamicForm {...{ mode: eyeCfg.mode, endpoint: eyeCfg.endpoint, recordId: resolvedId, tableName: rawTableName, fields, initialValues, onSuccess: (id: any) => { onSuccess?.(id); close() } }} />
        )}
      </SmartModal>
    )
  }

  const activeConfig = action ? actionsMap[action] : null

  return (
    <div {...{ className: "flex items-center gap-1" }}>
      <SmartDropdown {...{ label: "Acciones", triggerIcon: MoreVertical, triggerVariant: "ghost", items: dropdownItems, size: size ?? "md", ...props }} />
      {activeConfig && (
        <SmartModal {...{ open: isOpen, onOpenChange: handleOpenChange, title: activeConfig.title, description: activeConfig.description }}>
          {({ close }) => (
            <DynamicForm {...{ mode: activeConfig.mode, endpoint: activeConfig.endpoint, recordId: resolvedId, tableName: rawTableName, fields, initialValues, onSuccess: (id: any) => { onSuccess?.(id); close() } }} />
          )}
        </SmartModal>
      )}
    </div>
  )
})

ActionButtons.displayName = "ActionButtons"