import { useState, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { SmartBadge } from '@/components/smart-badge'
import { SimpleList } from '@/components/simple-list'
import { Tabs } from '@/components/ui/tabs'
import { SmartForm } from '@/components/smart-form'
import { SmartCard } from '@/components/smart-card'
import { FormGroup, FieldConfig } from '@/components/form-group'
import { Input } from '@/components/ui/input'

const t = (s: string) => s

interface PageProps {
  tables?: any[]
  database?: {
    current: string
    available: string[]
  }
  [key: string]: any
}

export default function TablesManager({ tables = [] }: { tables?: any[] }) {
  const { database } = usePage<PageProps>().props
  const [purging, setPurging] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [newDbName, setNewDbName] = useState('')
  const [creating, setCreating] = useState(false)

  const handlePurge = () => {
    setPurging(true)
    router.delete('/settings/table/purge', { preserveScroll: true, onFinish: () => setPurging(false) })
  }

  // Cambiar de Base de Datos y Limpiar Todo el Almacenamiento Local (Igual que en System)
  const handleDatabaseChange = (val: any) => {
    const nextDb = typeof val === 'object' && val !== null ? (val.id ?? val.value) : val

    if (!nextDb || nextDb === 'undefined' || nextDb === database?.current) return

    setSwitching(true)

    // Limpieza total del almacenamiento del navegador al estilo de System
    localStorage.clear()
    sessionStorage.clear()

    router.post(
      '/settings/database/switch',
      { database: nextDb },
      {
        preserveScroll: false,
        onFinish: () => setSwitching(false),
        onSuccess: async () => {
          // Limpiar CacheStorage del navegador si existe
          if ('caches' in window) {
            try {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map((name) => caches.delete(name)))
            } catch (err) {
              console.warn('Error clearing caches:', err)
            }
          }

          // Recarga forzada limpia sin historial previo
          window.location.href = window.location.pathname + '?_t=' + Date.now()
        },
      }
    )
  }

  // Crear una Nueva Base de Datos
  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = newDbName.trim().toLowerCase()
    if (!cleanName) return

    setCreating(true)
    router.post(
      '/settings/database/create',
      { name: cleanName },
      {
        preserveScroll: true,
        onFinish: () => setCreating(false),
        onSuccess: () => {
          setNewDbName('')
          window.location.reload()
        },
      }
    )
  }

  // Configuración con id y label para FormSelectSimple
  const databaseFields: FieldConfig[] = useMemo(() => [
    {
      name: 'database',
      type: 'select',
      placeholder: t('Select Database / Project'),
      disabled: switching,
      options: (database?.available || []).map((dbName) => ({
        id: dbName,
        value: dbName,
        label: dbName === database?.current ? `${dbName} (${t('Active')})` : dbName,
      })),
    },
  ], [database, switching])

  const fields = [
    { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true },
    { name: 'label', label: t('LABEL'), placeholder: t('e.g. Users List') },
    { name: 'icon', label: t('ICON'), placeholder: t('e.g. users') },
    { name: 'color', label: t('COLOR'), placeholder: t('e.g. bg-violet-500') },
  ]
  
  const backupFields = [
    { name: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true },
    { name: 'keep_protected', label: t('KEEP PROTECTED TABLES (USERS, ROLES, SESSIONS, ETC.)?'), type: 'checkbox', defaultValue: 1 },
  ]

  return (
    <>
      <Head title={t('Table Management')} />
      <div className="space-y-4">
        {/* Panel de Gestión de Base de Datos y Proyectos */}
        <div className="border rounded-xl bg-card p-4 space-y-4">
          {/* Fila 1: Selector de Base de Datos Activa */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold tracking-tight">{t('Active Database / Project')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('Switch dynamically between database projects hosted on the same server.')}
              </p>
            </div>
            <div className="w-full sm:w-72">
              <FormGroup
                fields={databaseFields}
                values={{ database: database?.current || '' }}
                disabled={switching}
                onChange={(_, value) => handleDatabaseChange(value)}
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Fila 2: Formulario para Crear Nueva Base de Datos */}
          <form onSubmit={handleCreateDatabase} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('Create New Database')}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t('Create a new MySQL database and initialize all system tables automatically.')}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="text"
                placeholder={t('e.g. videojuegos')}
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                disabled={creating}
                className="w-full sm:w-56 h-9 text-sm"
              />
              <SmartButton
                type="submit"
                icon="plus"
                label={t('Create')}
                loadingLabel={t('Creating...')}
                isLoading={creating}
                disabled={!newDbName.trim() || creating}
                size="sm"
              />
            </div>
          </form>
        </div>

        {/* Pestañas de Tablas, Backups y Purga */}
        <div className="space-y-2">
          <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
          <Tabs tabs={[{ id: 'tables', label: t('Tables'), icon: 'table' }, { id: 'backups', label: t('Backups'), icon: 'database' }, { id: 'danger', label: t('Purge'), icon: 'alert-triangle' }]}>
            {(sec) => sec === 'tables' ? (
              <SimpleList items={tables} icon="table" subtitle="comment" endpoint="/settings/table" fields={fields} renderExtra={(tbl) => (
                <>
                  <SmartBadge icon="layers" label={`${tbl.rows_count}`} variant="secondary" />
                  <SmartButton href={`/settings/table/${tbl.name}`} icon="settings-2" size="xs" tooltip={t('View columns')} />
                </>
              )} />
            ) : sec === 'backups' ? (
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
            ) : (
              <SmartCard variant="destructive" icon="alert-triangle" title={t('Purge non-protected tables & audit logs')} description={t('This action will delete all user-created tables and truncate all audit logs. System and protected tables will not be affected.')}>
                <SmartButton variant="destructive" icon="trash-2" label={t('Purge Database')} loadingLabel={t('Purging...')} isLoading={purging} onClick={handlePurge} confirmation={{ title: t('Confirm Purge'), description: t('Are you sure you want to delete all dynamic tables and clear audit history?'), confirmText: t('Yes, Purge') }} />
              </SmartCard>
            )}
          </Tabs>
        </div>
      </div>
    </>
  )
}

TablesManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }] }