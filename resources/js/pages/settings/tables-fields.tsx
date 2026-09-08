import { Head } from '@inertiajs/react';
import { ArrowLeft, Key, Type } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { useTranslation } from '@/hooks/use-translation';
export interface FieldItem {
  id: string; name: string; type: string; is_nullable?: boolean;
  is_primary?: boolean; auto_increment?: boolean; raw_type?: string;
  comment?: string; default_value?: string | null;
}
function FieldRowContent({ field }: { field: FieldItem }) {
  return (
    <div className="flex items-center justify-between min-w-0 text-sm font-mono">
      <div className="flex items-center gap-2 min-w-0">
        {field.is_primary ? <Key className="size-5 text-amber-500" /> : <Type className="size-5" />}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium truncate">{field.name}</span>
            <SmartBadge label={field.raw_type ?? field.type} color="cyan" />
            {field.is_primary && <SmartBadge label="PK" color="amber" />}
            {Boolean(field.auto_increment) && <SmartBadge label="AI" color="blue" />}
            {Boolean(field.is_nullable) && <SmartBadge label="NULL" variant="outline" />}
          </div>
          {field.comment && <span className="font-sans text-muted-foreground truncate">{field.comment}</span>}
        </div>
      </div>
    </div>
  );
}
export default function TableFieldsManager({ tableName, fieldsList = [] }: { tableName?: string; fieldsList?: FieldItem[] }) {
  const t = useTranslation();
  const fields = [
    { name: 'name', label: t('NAME'), placeholder: t('e.g. user_id'), required: true },
    { name: 'type', label: t('TYPE'), type: 'select', required: true, options: [
        { id: 'varchar', label: t('Short text (varchar)') },
        { id: 'text', label: t('Long text (text)') },
        { id: 'int', label: t('Integer (int)') },
        { id: 'bigint', label: t('Big Integer (bigint)') },
        { id: 'tinyint', label: t('Boolean / Tinyint') },
        { id: 'datetime', label: t('Date and time (datetime)') },
        { id: 'date', label: t('Date (date)') },
        { id: 'decimal', label: t('Decimal (decimal)') },
        { id: 'json', label: t('JSON (json)') },
      ]
    },
    { name: 'raw_type', label: t('LENGTH / SIZE'), type: 'number', placeholder: t('e.g. 255'), min: 1, max: 255 },
    { name: 'default_value', label: t('DEFAULT VALUE'), placeholder: t('e.g. active, 0, null') },
    { name: 'comment', label: t('COMMENT / DESCRIPTION'), placeholder: t('Description or purpose of this field'), type: 'textarea' },
    { name: 'order', label: t('LOCATION / PREVIOUS FIELD (AFTER)'), placeholder: t('e.g. id_navigation (or write "FIRST" for the beginning)') },
    { name: 'is_nullable', label: t('ALLOW NULL VALUES?'), type: 'checkbox' },
    { name: 'auto_increment', label: t('AUTO INCREMENT?'), type: 'checkbox' },
  ] as const;
  return (
    <>
      <Head title={`${t('Fields of')} ${tableName}`} />
      <div>
        <div className="flex items-center gap-2">
          <SmartButton href="/settings/tables" icon={ArrowLeft} variant="outline" size="sm" />
          <Heading title={`${t('Structure of:')} ${tableName}`} description={t('Manage the fields and data types belonging to this table.')} />
        </div>
        <SimpleList items={fieldsList} searchKey="name" endpoint={`/settings/tables/${tableName}/fields`} fields={fields as any}
          renderRowContent={(field) => <FieldRowContent field={field} />}
        />
      </div>
    </>
  );
}
TableFieldsManager.layout = { breadcrumbs: [ { title: 'Table Settings', href: '/settings/tables' }, { title: 'Table Fields', href: '#' } ] };