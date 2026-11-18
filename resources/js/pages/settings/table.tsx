import { Head } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SimpleList } from '@/components/simple-list'
import { SmartBadge } from '@/components/smart-badge'
import { SmartButton } from '@/components/smart-button'
const t = (s: string) => s, route = '/settings/table'
const fields = [
  { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true },
  { name: 'label', label: t('LABEL'), placeholder: t('e.g. Users List') },
  { name: 'icon', label: t('ICON'), placeholder: t('e.g. users') },
  { name: 'color', label: t('COLOR'), placeholder: t('e.g. bg-violet-500') },
]
export default function TablesManager({ tables = [] }: { tables?: any[] }) {
  return (
    <><Head title={t('Table Management')} />
      <Heading variant="small" title={t('Tables manager')} description={t('Manage, edit or delete active tables')} />
      <SimpleList items={tables} icon="table" title='table' subtitle="comment" endpoint={route} fields={fields} renderExtra={(tbl) => (
        <><SmartBadge icon="layers" label={`${tbl.rows_count}`} variant="secondary"/><SmartButton href={`${route}/${tbl.name}`} icon="settings-2" size="sm" tooltip={t('View columns')}/></>
      )}/>
    </>
  )
}
TablesManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: route }] }