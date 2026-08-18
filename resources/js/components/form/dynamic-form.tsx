import React, { useMemo } from 'react'
import { Form } from '@inertiajs/react'
import { DialogFooter } from '@/components/ui/dialog'
import { SmartButton } from '@/components/smart-button'
import { FormGroup, FieldConfig } from '@/components/form-group'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

export interface DynamicFormField {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
}

interface DynamicFormProps {
  mode?: 'store' | 'update' | 'info' | 'delete'
  tableName: string
  endpoint?: string
  recordId?: number | string
  initialValues?: Record<string, any>
  formAction?: { action: string; method: 'post' | 'put' | 'delete' | 'get' }
  onSuccess?: (id?: number) => void
}

const MODE_CONFIG = {
  store: { label: 'Crear', loadingLabel: 'Creando...', buttonColor: 'blue', method: 'post' as const, icon: Plus, variant: 'default' as const },
  update: { label: 'Actualizar', loadingLabel: 'Actualizando...', buttonColor: 'green', method: 'put' as const, icon: Pencil, variant: 'default' as const },
  delete: { label: 'Eliminar', loadingLabel: 'Eliminando...', buttonColor: 'red', method: 'delete' as const, icon: Trash2, variant: 'destructive' as const },
  info: { label: '', loadingLabel: '', buttonColor: undefined, method: 'get' as const, icon: undefined, variant: 'outline' as const },
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ mode = 'store', tableName, recordId, initialValues = {}, formAction, onSuccess }) => {
  const config = MODE_CONFIG[mode]
  const resolvedId = recordId ?? initialValues.id ?? initialValues[`id_${tableName?.toLowerCase()}`]
  const isReadonlyMode = mode === 'info' || mode === 'delete'

  const { data: schemaData, isLoading: loadingSchema } = useApi(tableName ? `/schema/${tableName}/fields` : null)
  const { data: formData, isLoading: loadingRecord } = useApi(
    mode !== 'store' && resolvedId ? `/crud/${tableName}/${resolvedId}` : null,
    { initialData: initialValues }
  )

  const isLoading = loadingSchema || loadingRecord
  const fields: DynamicFormField[] = useMemo(() => schemaData?.fields ?? [], [schemaData])
  const formGroupFields: FieldConfig[] = useMemo(
    () => fields.map(({ name, label, type, required, ...rest }) => ({
      id: name, name, label, type,
      required: isReadonlyMode ? false : required,
      defaultValue: formData?.[name] ?? initialValues[name] ?? '',
      disabled: isReadonlyMode,
      ...rest
    })),
    [fields, formData, initialValues, isReadonlyMode]
  )

  const action = formAction ?? {
    action: mode === 'store' || !resolvedId ? `/crud/${tableName}` : `/crud/${tableName}/${resolvedId}`,
    method: config.method
  }

  const formKey = `${tableName}-${resolvedId ?? 'new'}-${mode}-${isLoading ? 'loading' : 'ready'}`

  return (
    <Form key={formKey} {...{ ...action, options: { preserveScroll: true, onSuccess: (page: any) => onSuccess?.(page?.props?.flash?.created_id) }, className: 'flex flex-col h-full min-h-0' }}>
      {({ processing, errors }) => (
        <>
          {isLoading ? (
            <div {...{ className: 'flex-1 flex items-center justify-center p-6' }}>
              <Loader2 {...{ className: 'w-6 h-6 animate-spin text-muted-foreground' }} />
            </div>
          ) : (
            <div {...{ className: 'flex-1 overflow-y-auto space-y-2 pr-1' }}>
              <FormGroup {...{ fields: formGroupFields, errors }} />
            </div>
          )}
          {mode !== 'info' && (
            <DialogFooter {...{ className: 'pt-4 flex items-center justify-end shrink-0 w-full' }}>
              <SmartButton {...{ type: 'submit', label: config.label, loadingLabel: config.loadingLabel, variant: config.variant, buttonColor: config.buttonColor, icons: config.icon, isLoading: processing || isLoading, disabled: processing || isLoading }} />
            </DialogFooter>
          )}
        </>
      )}
    </Form>
  )
}