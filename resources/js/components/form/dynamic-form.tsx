import { useState, useCallback, useMemo } from 'react'
import { Form } from '@inertiajs/react'
import { SmartButton } from '@/components/smart-button'
import { FormGroup } from '@/components/form-group'
import { Loader2 } from 'lucide-react'
import { ACTION_MODES, ActionMode } from '@/lib/action-modes'
import { useApi } from '@/hooks/use-api'

const EMPTY_OBJECT = Object.freeze({})

interface DynamicFormProps {
  mode?: ActionMode
  tableName?: string
  endpoint?: string
  recordId?: number | string
  fields?: any[]
  initialValues?: Record<string, any>
  onSuccess?: (pageProps?: any) => void
}

export const DynamicForm = ({
  mode = 'store',
  tableName,
  endpoint,
  recordId,
  fields: passedFields,
  initialValues = EMPTY_OBJECT,
  onSuccess,
}: DynamicFormProps) => {
  const config = ACTION_MODES[mode]
  const isReadonly = mode === 'info' || mode === 'delete'

  const [customValues, setCustomValues] = useState<Record<string, any>>(EMPTY_OBJECT)

  // 1. Obtener schema/fields si no fueron provistos
  const shouldFetchSchema = Boolean(!passedFields && tableName)
  const { data: fetchedFields = [], isLoading: loadingSchema } = useApi<any[]>(
    shouldFetchSchema ? `/schema/${tableName}/fields` : null,
    {
      enabled: shouldFetchSchema,
      initialData: [],
      select: (res) => res?.fields ?? res?.data?.fields ?? res?.data ?? res ?? [],
    }
  )

  // 2. Obtener registro existente si no es 'store'
  const shouldFetchRecord = Boolean(recordId && tableName && mode !== 'store')
  const { data: fetchedValues = EMPTY_OBJECT, isLoading: loadingRecord } = useApi<Record<string, any>>(
    shouldFetchRecord ? `/crud/${tableName}/${recordId}` : null,
    {
      enabled: shouldFetchRecord,
      initialData: EMPTY_OBJECT,
      select: (res) => res?.data ?? res,
    }
  )

  const activeFields = passedFields ?? fetchedFields
  const isLoading = (shouldFetchSchema && loadingSchema) || (shouldFetchRecord && loadingRecord)

  const handleCustomChange = useCallback((name: string, value: any) => {
    setCustomValues((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }))
  }, [])

  const handleSuccess = useCallback((p: any) => onSuccess?.(p?.props), [onSuccess])
  const action = endpoint ?? (mode === 'store' || !recordId ? `/crud/${tableName}` : `/crud/${tableName}/${recordId}`)

  const formValues = useMemo(() => {
    return mode === 'store'
      ? { ...initialValues, ...customValues }
      : { ...initialValues, ...fetchedValues, ...customValues }
  }, [mode, initialValues, fetchedValues, customValues])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[150px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form
      action={action}
      method={config.method}
      options={{ preserveScroll: true, onSuccess: handleSuccess }}
      onSubmit={(e) => { if (mode === 'info') e.preventDefault() }}
      className="flex flex-col h-full min-h-0"
    >
      {({ processing, errors }) => (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <FormGroup fields={activeFields} errors={errors} values={formValues} isReadonly={isReadonly} onChange={handleCustomChange} />
          </div>
          {mode !== 'info' && (
            <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2 mt-2">
              <SmartButton
                type="submit"
                label={config.label}
                loadingLabel={config.loadingLabel}
                variant={config.variant}
                buttonColor={config.buttonColor}
                icon={config.icon}
                isLoading={processing}
                disabled={processing}
              />
            </div>
          )}
        </>
      )}
    </Form>
  )
}