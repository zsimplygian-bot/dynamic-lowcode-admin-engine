import { Form, Head, usePage } from '@inertiajs/react'
import AppearanceTabs from '@/components/appearance-tabs'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import CssThemeDropdown from "@/components/css-theme-dropdown"
import { FormGroup } from '@/components/form-group'
import { useTranslation } from '@/hooks/use-translation'
type AppSettings = { app_name?: string; app_icon?: string }
type PageProps = { appSettings?: AppSettings }
export default function Appearance() {
  const t = useTranslation()
  const { appSettings } = usePage<PageProps>().props
  const fields = [ { id: 'app_icon', name: 'app_icon', label: t('App Icon'), type: 'file', accept: 'image/*', defaultValue: appSettings?.app_icon },
                   { id: 'app_name', name: 'app_name', label: t('App Title'), defaultValue: appSettings?.app_name, placeholder: t('My Application'), required: true }, ]
  return (
    <><Head title={t('Appearance settings')} />
      <div className="space-y-4">
        <Heading variant="small" title={t('Appearance')} description={t('Update appearance settings and preferences')} />
        <div className="flex items-center gap-2"> <AppearanceTabs /> <CssThemeDropdown /> </div>
        <Form action="/settings/appearance" method="post" options={{ preserveScroll: true }} className="space-y-4">
          {({ processing, errors }) => (
            <><FormGroup fields={fields} errors={errors} />
              <SmartButton type="submit" icon="save" isLoading={processing} label={t('Save')} loadingLabel={t('Saving...')}/> 
            </>
          )}
        </Form>
      </div>
    </>
  )
}
Appearance.layout = { breadcrumbs: [{ title: 'Appearance settings', href: '/settings/appearance' }] }