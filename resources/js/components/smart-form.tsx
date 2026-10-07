import { useEffect } from "react"
import { useForm } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { AsyncState } from "@/components/async-state"
import { ACTION_MODES, ActionMode } from "@/lib/action-modes"
import { useTranslation } from "@/hooks/use-translation"

export interface SmartFormProps {
  action: string
  mode?: ActionMode
  method?: "post" | "put" | "patch"
  fields?: FieldConfig[]
  initialValues?: Record<string, any>
  isLoading?: boolean
  submitLabel?: string
  submitIcon?: string
  showSubmitButton?: boolean
  className?: string
  onSuccess?: (pageProps?: any) => void
  children?: React.ReactNode | ((props: { processing: boolean; errors: Record<string, string>; data: Record<string, any> }) => React.ReactNode)
}

export const SmartForm = ({
  action,
  mode = "store",
  method,
  fields = [],
  initialValues = {},
  isLoading = false,
  submitLabel,
  submitIcon,
  showSubmitButton = true,
  className = "space-y-4",
  onSuccess,
  children
}: SmartFormProps) => {
  const t = useTranslation()
  const config = ACTION_MODES[mode] ?? ACTION_MODES.store
  const isReadonly = mode === "info" || mode === "delete"
  const isUpdate = mode === "update" || mode === "edit"

  const { data, setData, post, put, processing, errors } = useForm<Record<string, any>>(initialValues)

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) setData(initialValues)
  }, [initialValues])

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (isReadonly) return

  const hasFiles = Object.values(data).some((val) => val instanceof File)
  const options = { preserveScroll: true, onSuccess: (p: any) => onSuccess?.(p?.props) }

  if (isUpdate || method === "put") {
    if (hasFiles) {
      post(action, { ...options, headers: { "X-HTTP-Method-Override": "PUT" } })
    } else {
      put(action, options)
    }
  } else if (method === "patch") {
    patch(action, options)
  } else {
    post(action, options)
  }
}

  return (
    <AsyncState isLoading={isLoading}>
      <form onSubmit={handleSubmit} className={className}>
        {fields.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <FormGroup fields={fields} values={data} errors={errors} isReadonly={isReadonly} onChange={(k, v) => setData(k, v)} />
          </div>
        )}

        {typeof children === "function" ? children({ processing, errors, data }) : children}

        {!isReadonly && showSubmitButton && (
          <div className="pt-4 flex items-center justify-end shrink-0 w-full gap-2 mt-2">
            <SmartButton
              type="submit"
              label={submitLabel ?? t(config.label)}
              loadingLabel={t(config.loadingLabel)}
              variant={config.variant}
              buttonColor={config.buttonColor}
              icon={submitIcon ?? config.icon}
              isLoading={processing}
            />
          </div>
        )}
      </form>
    </AsyncState>
  )
}