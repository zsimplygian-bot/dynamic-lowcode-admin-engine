import { Head } from '@inertiajs/react';
import { ArrowLeft, Binary, Calendar, Clock, Code2, Hash, Key, TextQuote, ToggleLeft, Type } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { useTranslation } from '@/hooks/use-translation';

function getFieldIcon(type: string) {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('int')) return Binary;
  if (t.includes('decimal') || t.includes('float') || t.includes('double')) return Hash;
  if (t.includes('tinyint') || t.includes('bool')) return ToggleLeft;
  if (t.includes('date') && !t.includes('time')) return Calendar;
  if (t.includes('time') || t.includes('datetime') || t.includes('timestamp')) return Clock;
  if (t.includes('text')) return TextQuote;
  if (t.includes('json')) return Code2;
  return Type;
}

function FieldRowContent({ field }: { field: any }) {
  const IconComponent = field.is_primary ? Key : getFieldIcon(field.type);

  return (
    <div className="flex items-center justify-between min-w-0 text-sm font-mono">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
          <IconComponent className={`size-5 ${field.is_primary ? 'text-amber-500' : ''}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium truncate">{field.name}</span>
            <SmartBadge label={field.raw_type ?? field.type} color="cyan" />
            {field.is_primary && <SmartBadge label="PK" color="amber" />}
            {field.is_foreign && <SmartBadge label="FK" color="purple" />}
            {field.auto_increment && <SmartBadge label="AI" color="blue" />}
            {field.is_nullable && <SmartBadge label="NULL" variant="outline" />}
          </div>
          {field.comment && <span className="font-sans text-muted-foreground truncate">{field.comment}</span>}
        </div>
      </div>
    </div>
  );
}

export default function TableFieldsManager({ tableName, fieldsList = [] }: { tableName?: string; fieldsList?: any[] }) {
  const t = useTranslation();
  const fields = [
    { name: 'name', label: t('NAME'), placeholder: 'email, id_cliente, price', required: true },
    { name: 'is_foreign', label: t('IS FOREIGN KEY (FK)?'), type: 'checkbox' },
    { name: 'type', label: t('TYPE'), type: 'select', required: true, defaultValue: 'varchar', options: [
        { id: 'varchar', label: `🔤 ${t('Short text (varchar)')}` },
        { id: 'text', label: `📄 ${t('Long text (text)')}` },
        { id: 'int', label: `🔢 ${t('Integer (int)')}` },
        { id: 'bigint', label: `🔢 ${t('Big Integer (bigint)')}` },
        { id: 'tinyint', label: `🔘 ${t('Boolean / Tinyint')}` },
        { id: 'datetime', label: `⏰ ${t('Date and time (datetime)')}` },
        { id: 'date', label: `📅 ${t('Date (date)')}` },
        { id: 'decimal', label: `🪙 ${t('Decimal (decimal)')}` },
        { id: 'json', label: `📦 ${t('JSON (json)')}` },
      ]
    },
    { name: 'length', label: t('LENGTH / SIZE'), type: 'number', placeholder: t('e.g. 255'), min: 1, max: 255 },
    { name: 'default_value', label: t('DEFAULT VALUE'), placeholder: t('e.g. active, 0, null') },
    { name: 'comment', label: t('COMMENT / DESCRIPTION'), placeholder: t('Description or purpose of this field'), type: 'textarea' },
    { name: 'order', label: t('LOCATION / PREVIOUS FIELD (AFTER)'), placeholder: t('e.g. id_navigation (or write "FIRST" for the beginning)') },
    { name: 'is_nullable', label: t('ALLOW NULL VALUES?'), type: 'checkbox', defaultValue: 1 },
    { name: 'auto_increment', label: t('AUTO INCREMENT?'), type: 'checkbox' },
    { name: 'is_unsigned', label: t('UNSIGNED (NO NEGATIVES)?'), type: 'checkbox' },
  ] as const;

  return (
    <><Head title={`${t('Fields of')} ${tableName}`} />
      <div>
        <div className="flex items-center gap-2">
          <SmartButton href="/settings/table" icon={ArrowLeft} variant="outline" size="sm" />
          <Heading title={`${t('Structure of:')} ${tableName}`} description={t('Manage the fields and data types belonging to this table.')} />
        </div>
        <SimpleList items={fieldsList} searchKey="name" endpoint={`/settings/table/${tableName}/field`} fields={fields as any} renderRowContent={(field) => <FieldRowContent field={field}/>} />
      </div>
    </>
  );
}

TableFieldsManager.layout = { breadcrumbs: [ { title: 'Table Settings', href: '/settings/table' }, { title: 'Table Fields', href: '#' } ] };