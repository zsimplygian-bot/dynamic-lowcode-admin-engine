import { useState, useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { SmartButton } from "@/components/smart-button"
import { SmartModal } from "@/components/smart-modal"
import { DynamicForm } from "@/components/form/dynamic-form"
import { HistoriaForm } from "@/components/form/historia-form"
import { ACTION_MODES } from "@/lib/action-modes"
import { useTranslation } from "@/hooks/use-translation"

const storeConfig = ACTION_MODES.store
const updateConfig = ACTION_MODES.update

export const NewRecordButton = ({ tableName = "registro", endpoint, fields, initialValues, onSuccess, ...props }: any) => {
  const t = useTranslation()
  const { props: pageProps } = usePage<any>()
  const [createdId, setCreatedId] = useState<string | number | null>(null)
  const [isStoreOpen, setIsStoreOpen] = useState(false)

  const isHistoria = tableName === "historia"
  const resolvedEndpoint = endpoint || `/crud/${tableName}`
  const title = `${t(storeConfig.modalPrefix)} ${tableName.toUpperCase()}`.trim()
  const description = typeof storeConfig.description === "string" ? t(storeConfig.description) : storeConfig.description
  const updateTitle = `${t(updateConfig.modalPrefix)} ${tableName.toUpperCase()} ${createdId ?? ''}`.trim()
  const updateDescription = typeof updateConfig.description === "string" ? t(updateConfig.description) : updateConfig.description

  const extractId = (data: any) => {
    if (!data) return null
    const pKey = `id_${tableName}`
    return data?.[pKey] ?? data?.id ?? data?.toast?.[pKey] ?? data?.toast?.id ?? null
  }

  const handleCreateSuccess = (res: any) => {
    setIsStoreOpen(false)
    const flashData = pageProps?.flash
    const detectedId = extractId(res) || extractId(flashData)
    onSuccess?.(detectedId || res)
    if (isHistoria && detectedId) {
      setCreatedId(detectedId)
    }
  }

  useEffect(() => {
    if (isHistoria && !createdId && pageProps?.flash) {
      const flashId = extractId(pageProps.flash)
      if (flashId && !isStoreOpen) {
        setCreatedId(flashId)
      }
    }
  }, [pageProps])

  return (
    <>
      <SmartModal open={isStoreOpen} onOpenChange={setIsStoreOpen} title={title} description={description}
        trigger={<SmartButton tooltip={`${t("Nuevo")} ${tableName}`} icon={storeConfig.icon} buttonColor={storeConfig.buttonColor} variant={storeConfig.variant} {...props} />} >
        {({ close }) => (
          <DynamicForm tableName={tableName} endpoint={endpoint} fields={fields} initialValues={initialValues} onSuccess={(res: any) => { close(); handleCreateSuccess(res); }} />
        )}
      </SmartModal>
      {isHistoria && createdId && (
        <SmartModal open={true} onOpenChange={(o) => { if (!o) setCreatedId(null) }} title={updateTitle} description={updateDescription} size="5xl" className="lg:max-w-[1000px]">
          {({ close }) => {
            const formContent = (
              <DynamicForm mode="update" recordId={createdId} tableName={tableName} fields={fields} initialValues={initialValues}
                endpoint={`${resolvedEndpoint}/${createdId}`} onSuccess={(id: any) => { onSuccess?.(id); close(); setCreatedId(null); }}
              />
            )
            return (
              <HistoriaForm mode="update" recordId={createdId} tableName={tableName} onSuccess={onSuccess}>
                {formContent}
              </HistoriaForm>
            )
          }}
        </SmartModal>
      )}
    </>
  )
}