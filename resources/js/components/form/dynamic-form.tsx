import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { Form } from '@inertiajs/react'
import { SmartButton } from '@/components/smart-button'
import { FormGroup } from '@/components/form-group'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'

const MODE_CONFIG = {
  store: { label: 'Crear', loadingLabel: 'Creando...', buttonColor: 'blue', method: 'post' as const, icon: Plus, variant: 'default' as const },
  update: { label: 'Actualizar', loadingLabel: 'Actualizando...', buttonColor: 'green', method: 'put' as const, icon: Pencil, variant: 'default' as const },
  delete: { label: 'Eliminar', loadingLabel: 'Eliminando...', buttonColor: 'red', method: 'delete' as const, icon: Trash2, variant: 'destructive' as const },
  info: { label: '', loadingLabel: '', buttonColor: undefined, method: 'get' as const, icon: undefined, variant: 'outline' as const },
}

const EMPTY_OBJECT = Object.freeze({})

interface DynamicFormProps {
  mode?: 'store' | 'update' | 'info' | 'delete'
  tableName?: string
  endpoint?: string
  recordId?: number | string
  fields?: any[]
  initialValues?: Record<string, any>
  onSuccess?: (pageProps?: any) => void
}

export const DynamicForm = ({ mode = 'store', tableName, endpoint, recordId, fields: passedFields, initialValues = EMPTY_OBJECT, onSuccess }: DynamicFormProps) => {
  const config = MODE_CONFIG[mode]
  const isReadonly = mode === 'info' || mode === 'delete'
  const [fields, setFields] = useState<any[]>(passedFields ?? [])
  const [fetchedValues, setFetchedValues] = useState<Record<string, any>>(EMPTY_OBJECT)
  const [customValues, setCustomValues] = useState<Record<string, any>>(EMPTY_OBJECT)
  const [isLoading, setIsLoading] = useState(!passedFields)

  useEffect(() => {
    let isMounted = true
    const shouldFetchSchema = !passedFields && Boolean(tableName)
    const shouldFetchRecord = Boolean(recordId && tableName && mode !== 'store' && Object.keys(initialValues).length === 0)
    
    if (!shouldFetchSchema && !shouldFetchRecord) {
      if (passedFields) setFields(passedFields)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const reqSchema = shouldFetchSchema ? axios.get(`/schema/${tableName}/fields`) : Promise.resolve({ data: null })
    const reqData = shouldFetchRecord ? axios.get(`/crud/${tableName}/${recordId}`) : Promise.resolve({ data: null })

    Promise.all([reqSchema, reqData])
      .then(([resFields, resRecord]) => {
        if (!isMounted) return
        if (resFields.data) setFields(resFields.data?.fields ?? resFields.data ?? [])
        if (resRecord.data?.data) setFetchedValues(resRecord.data.data)
      })
      .catch((err) => console.error('Error al cargar datos:', err))
      .finally(() => { if (isMounted) setIsLoading(false) })

    return () => { isMounted = false }
  }, [tableName, recordId, mode, passedFields, initialValues])

  const handleCustomChange = useCallback((name: string, value: any) => {
    setCustomValues((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }))
  }, [])

  const handleSuccess = useCallback((p: any) => {
    onSuccess?.(p?.props)
  }, [onSuccess])

  const action = endpoint ?? (mode === 'store' || !recordId ? `/crud/${tableName}` : `/crud/${tableName}/${recordId}`)
  const formValues = useMemo(() => ({ ...initialValues, ...fetchedValues, ...customValues }), [initialValues, fetchedValues, customValues])

  if (isLoading) {
    return (
      <div {...{ className: 'flex-1 flex items-center justify-center p-6 min-h-[150px]' }}>
        <Loader2 {...{ className: 'w-6 h-6 animate-spin text-muted-foreground' }} />
      </div>
    )
  }

  return (
    <Form {...{ action, method: config.method, options: { preserveScroll: true, onSuccess: handleSuccess }, className: 'flex flex-col h-full min-h-0' }}>
      {({ processing, errors }) => (
        <>
          <div {...{ className: 'flex-1 overflow-y-auto space-y-2 pr-1' }}>
            <FormGroup {...{ fields, errors, values: formValues, isReadonly, onChange: handleCustomChange }} />
          </div>
          {mode !== 'info' && (
            <div {...{ className: 'pt-4 flex items-center justify-end shrink-0 w-full gap-2' }}>
              <SmartButton {...{ type: 'submit', label: config.label, loadingLabel: config.loadingLabel, variant: config.variant, buttonColor: config.buttonColor, icon: config.icon, isLoading: processing, disabled: processing }} />
            </div>
          )}
        </>
      )}
    </Form>
  )
}