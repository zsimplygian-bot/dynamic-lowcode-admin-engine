import { Head } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { SmartBadge } from '@/components/smart-badge'
import { SimpleList } from '@/components/simple-list'
import { Tabs } from '@/components/ui/tabs'
import { SmartForm } from '@/components/smart-form'
export default function TablesManager({ tables = [] }: { tables?: any[] }) {
  
  const fields = [
    { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true },
    { name: 'label', label: t('LABEL'), placeholder: t('e.g. Users List') },
    { name: 'icon', label: t('ICON'), placeholder: t('e.g. users') },
    { name: 'color', label: t('COLOR'), placeholder: t('e.g. bg-violet-500') }, ]
  const backupFields = [
    { name: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true },
    { name: 'keep_protected', label: t('KEEP PROTECTED TABLES (USERS, ROLES, SESSIONS, ETC.)?'), type: 'checkbox', defaultValue: 1 }, ]
  return (
    <><Head title={t('Table Management')} />
      <div className="space-y-2"> 
        <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
        <Tabs tabs={[{ id: 'tables', label: t('Tables'), icon: 'table' }, { id: 'backups', label: t('Backups'), icon: 'database' }]}>
          {(sec) => sec === 'tables' ? (
            <SimpleList items={tables} icon="table" subtitle="comment" endpoint="/settings/table" fields={fields} renderExtra={(tbl) => (
              <><SmartBadge icon="layers" label={`${tbl.rows_count}`} variant="secondary" />
                <SmartButton href={`/settings/table/${tbl.name}`} icon="settings-2" size="xs" tooltip={t('View columns')} /> </> )} />
          ) : (
            <div className="space-y-4 border rounded-xl p-4 bg-card">
              <div className="space-y-2">
                <Heading variant="small" title={t('Export backup')} description={t('Download a complete backup copy of the database in SQL format.')} />
                <SmartButton onClick={() => window.location.href = '/settings/table/export'} icon="download" label={t('Export')} />
              </div>
              <hr className="border-border" />
              <div className="space-y-2">
                <Heading variant="small" title={t('Import backup')} description={t('Upload a .sql backup file to restore structure and data.')} />
                <SmartForm action="/settings/table/import" mode="s" fields={backupFields} />
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </>
  )
}
TablesManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }] }