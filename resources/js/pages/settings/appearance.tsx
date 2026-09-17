import { Form, Head, usePage } from '@inertiajs/react'
import { Save } from 'lucide-react'
import AppearanceTabs from '@/components/appearance-tabs'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { FormGroup } from '@/components/form-group'
import { useTranslation } from '@/hooks/use-translation'
import { edit as editAppearance } from '@/routes/appearance'
import AppearanceController from '@/actions/App/Http/Controllers/Settings/AppearanceController'

type AppSettings = { app_name?: string; app_icon?: string }
type PageProps = { appSettings?: AppSettings }

export default function Appearance() {
  const t = useTranslation()
  const { appSettings } = usePage<PageProps>().props

  return (
    <><Head title={t('Appearance settings')} />
      <div className="space-y-6">
        <Heading variant="small" title={t('Appearance')} description={t('Update appearance settings and preferences')} />
        <AppearanceTabs />
        <Form {...AppearanceController.update.form()} options={{ preserveScroll: true }} className="space-y-6">
          {({ processing, errors }) => (
            <><FormGroup errors={errors}
                fields={[
                  { id: 'app_icon', name: 'app_icon', label: t('App Icon'), type: 'file', accept: 'image/*', defaultValue: appSettings?.app_icon },
                  { id: 'app_name', name: 'app_name', label: t('App Title'), defaultValue: appSettings?.app_name, placeholder: t('My Application'), required: true },
                ]}
              />
              <div className="flex items-center gap-4">
                <SmartButton type="submit" icon={Save} isLoading={processing} label={t('Save')} loadingLabel={t('Saving...')} data-test="update-appearance-button" />
              </div>
            </>
          )}
        </Form>
      </div>
    </>
  )
}
Appearance.layout = { breadcrumbs: [{ title: 'Appearance settings', href: editAppearance() }] }