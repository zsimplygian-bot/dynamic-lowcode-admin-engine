import { useMemo } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { Tabs } from '@/components/ui/tabs'
import { SmartForm } from '@/components/smart-form'
import { SmartCard } from '@/components/smart-card'
import { SimpleList } from '@/components/simple-list'
import { SmartBadge } from '@/components/smart-badge'
import { http } from '@/hooks/use-router'
const path = '/settings/database', t = (s: string) => s
const backupFields = [
  { name: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true },
  { name: 'keep_protected', label: t('KEEP PROTECTED TABLES (USERS, ROLES, SESSIONS, ETC.)?'), type: 'checkbox', defaultValue: 1 },
]
const createDbFields = [ { name: 'name', label: t('DATABASE NAME'), placeholder: t('e.g. videojuego'), required: true } ]
export default function DatabaseManager() {
  const { database } = usePage<any>().props
  const handleSwitch = (dbName: string) => {
    localStorage.clear(); sessionStorage.clear()
    http.post(`${path}/switch`, { database: dbName }, { preserveScroll: false })
  }
  const handleExport = async () => {
    toast.success(t('Exporting database... download will start shortly'))
    await http.download(`${path}/export`)
  }
  const projectItems = useMemo(() => (database?.available || []).map((db: string) => ({ id: db, name: db, isCurrent: db === database?.current })), [database])
  return (
    <><Head title={t('Database Management')} />
      <div className="space-y-2">
        <Heading variant="small" title={t('Database manager')} description={t('Switch projects, manage backups and purge data')} />
        <Tabs tabs={[ { id: 'projects', label: t('Projects'), icon: 'layers' }, { id: 'backups', label: t('Backups'), icon: 'database' }, { id: 'danger', label: t('Purge'), icon: 'alert-triangle' }, ]}>
          {(sec) => sec === 'projects' ? (
            <SimpleList items={projectItems} icon="database" title="Database" endpoint={path} fields={createDbFields} renderExtra={(item: any) => (
              item.isCurrent ? <SmartBadge icon="check" label={t('Active')} variant="secondary" /> : <SmartButton icon="refresh-cw" tooltip={t('Switch')} size="sm" onClick={() => handleSwitch(item.name)} />
            )} />
          ) : sec === 'backups' ? (
            <div className="space-y-4 border rounded-xl p-4 bg-card">
              <div className="space-y-2">
                <Heading variant="small" title={t('Export backup')} description={t('Download a complete backup copy of the database in SQL format.')} />
                <SmartButton icon="download" label={t('Export')} onClick={handleExport} />
              </div>
              <hr className="border-border" />
              <div className="space-y-2">
                <Heading variant="small" title={t('Import backup')} description={t('Upload a .sql backup file to restore structure and data.')} />
                <SmartForm action={`${path}/import`} mode="s" fields={backupFields} />
              </div>
            </div>
          ) : (
            <SmartCard variant="destructive" icon="alert-triangle" title={t('Purge non-protected tables & audit logs')} description={t('Deletes all user-created tables. System tables are preserved.')}>
              <SmartButton variant="destructive" icon="trash-2" label={t('Purge Database')} loadingLabel={t('Purging...')} onClick={() => http.delete(`${path}/purge`)} />
            </SmartCard>
          )}
        </Tabs>
      </div>
    </>
  )
}
DatabaseManager.layout = { breadcrumbs: [{ title: 'Database Settings', href: path }] }