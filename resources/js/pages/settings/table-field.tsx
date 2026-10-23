import { Head } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SmartButton } from '@/components/smart-button'
import { SmartBadge } from '@/components/smart-badge'
import { SimpleList } from '@/components/simple-list'
const ICONS: Record<string, string> = {
  tinyint: 'toggle-left', bool: 'toggle-left',
  int: 'binary', bigint: 'binary', mediumint: 'binary', smallint: 'binary',
  decimal: 'hash', float: 'hash', double: 'hash',
  enum: 'list-filter',
  datetime: 'clock', timestamp: 'clock', time: 'clock', date: 'calendar',
  varchar: 'text-quote', text: 'text-quote', mediumtext: 'text-quote', longtext: 'text-quote',
  json: 'code-2',
}
export default function TableFieldsManager({ tableName, tableFields }: { tableName: string; tableFields: any[] }) {
  
  const fields = [
    { name: 'name', label: t('NAME'), placeholder: 'email, cliente_id, price', required: true },
    { name: 'type', label: t('TYPE'), type: 'select', required: true, defaultValue: 'varchar', options: [
      { id: 'varchar', label: `🔤 ${t('Short text (varchar)')}` },
      { id: 'text', label: `📄 ${t('Long text (text)')}` },
      { id: 'enum', label: `📋 ${t('List options (enum)')}` },
      { id: 'int', label: `🔢 ${t('Integer (int)')}` },
      { id: 'bigint', label: `🔢 ${t('Big Integer (bigint)')}` },
      { id: 'tinyint', label: `🔘 ${t('Boolean / Tinyint')}` },
      { id: 'datetime', label: `⏰ ${t('Date and time (datetime)')}` },
      { id: 'timestamp', label: `⏱️ ${t('Timestamp (timestamp)')}` },
      { id: 'date', label: `📅 ${t('Date (date)')}` },
      { id: 'decimal', label: `🪙 ${t('Decimal (decimal)')}` },
      { id: 'json', label: `📦 ${t('JSON (json)')}` }, ]},
    { name: 'length', label: t('LENGTH / ENUM OPTIONS'), placeholder: t('e.g. 255 or "active, inactive"') },
    { name: 'default_value', label: t('DEFAULT VALUE'), placeholder: t('e.g. activo, 0, null') },
    { name: 'comment', label: t('COMMENT / DESCRIPTION'), placeholder: t('Description or purpose'), type: 'textarea' },
    { name: 'order', label: t('LOCATION / AFTER FIELD'), placeholder: t('e.g. id_user (or "FIRST")') },
    { name: 'is_nullable', label: t('ALLOW NULL?'), type: 'checkbox', defaultValue: 1 },
    { name: 'auto_increment', label: t('AUTO INCREMENT?'), type: 'checkbox' },
    { name: 'is_unsigned', label: t('UNSIGNED?'), type: 'checkbox' },
  ]
  const items = tableFields.map((f) => ({ ...f, icon: f.is_primary ? 'key' : (ICONS[f.type] ?? 'type') }))
  return (
    <><Head title={`${t('Fields of')} ${tableName}`} />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SmartButton href="/settings/table" icon="arrow-left" variant="outline" size="sm" tooltip="Volver" />
          <Heading title={`${t('Structure of:')} ${tableName}`} description={t('Manage fields and data types.')} />
        </div>
        <SimpleList items={items} subtitle="comment" endpoint={`/settings/table/${tableName}/field`} fields={fields} renderExtra={(f) => (
          <><SmartBadge label={f.raw_type ?? f.type} color="cyan" />
            {f.is_primary && <SmartBadge label="PK" color="amber" />}
            {f.auto_increment && <SmartBadge label="AI" color="blue" />}
            {f.is_nullable && <SmartBadge label="NULL" variant="outline" />}
          </>
        )} />
      </div>
    </>
  )
}
TableFieldsManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }, { title: 'Table Fields', href: '#' }] }