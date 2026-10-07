import { Head, usePage } from '@inertiajs/react'
import AppearanceTabs from '@/components/appearance-tabs'
import Heading from '@/components/heading'
import CssThemeDropdown from "@/components/css-theme-dropdown"
import { SmartForm } from '@/components/smart-form'
import { useTranslation } from '@/hooks/use-translation'
type AppSettings = { app_name?: string; app_icon?: string }
type PageProps = { appSettings?: AppSettings }
export default function Appearance() {
  const t = useTranslation()
  const { appSettings } = usePage<PageProps>().props
  const fields = [
    { id: 'app_icon', name: 'app_icon', label: t('App Icon'), type: 'file', accept: 'image/*' },
    { id: 'app_name', name: 'app_name', label: t('App Title'), placeholder: t('My Application'), required: true },
  ]
  return (
    <><Head title={t('Appearance settings')} />
      <div className="space-y-4">
        <Heading variant="small" title={t('Appearance')} description={t('Update appearance settings and preferences')} />
        <div className="flex items-center gap-2"><AppearanceTabs /><CssThemeDropdown /></div>
        <SmartForm
  action="/settings/appearance"
  method="post"
  fields={fields}
  initialValues={{ app_icon: appSettings?.app_icon ?? '', app_name: appSettings?.app_name ?? '' }}
  submitIcon="save"
  submitLabel={t('Save')}
/>
      </div>
    </>
  )
}
Appearance.layout = { breadcrumbs: [{ title: 'Appearance settings', href: '/settings/appearance' }] }