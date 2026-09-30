import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { useTranslation } from '@/hooks/use-translation';

const ICONS = {
    'toggle-left': ['tinyint', 'bool'],
    binary: ['int', 'bigint', 'mediumint', 'smallint'],
    hash: ['decimal', 'float', 'double'],
    'list-filter': ['enum'],
    clock: ['datetime', 'timestamp', 'time'],
    calendar: ['date'],
    'text-quote': ['varchar', 'text', 'mediumtext', 'longtext'],
    'code-2': ['json'],
};

const formatFields = (list) => list.map((f) => ({
    ...f, icon: f.is_primary ? 'key' : Object.keys(ICONS).find((icon) => ICONS[icon].includes(f.type)) ?? 'type',
}));

export default function TableFieldsManager({ tableName, tableFields }: { tableName: string; tableFields: any[] }) {
    const t = useTranslation();
    const fields = [
        { name: 'name', label: t('NAME'), placeholder: 'email, id_cliente, price', required: true },
        { name: 'is_foreign', label: t('IS FOREIGN KEY (FK)?'), type: 'checkbox' },
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
            { id: 'json', label: `📦 ${t('JSON (json)')}` },
        ]},
        { name: 'length', label: t('LENGTH / ENUM OPTIONS'), placeholder: t('e.g. 255 or "active, inactive"') },
        { name: 'default_value', label: t('DEFAULT VALUE'), placeholder: t('e.g. activo, 0, null') },
        { name: 'comment', label: t('COMMENT / DESCRIPTION'), placeholder: t('Description or purpose of this field'), type: 'textarea' },
        { name: 'order', label: t('LOCATION / PREVIOUS FIELD (AFTER)'), placeholder: t('e.g. id_navigation (or write "FIRST" for the beginning)') },
        { name: 'is_nullable', label: t('ALLOW NULL VALUES?'), type: 'checkbox', defaultValue: 1 },
        { name: 'auto_increment', label: t('AUTO INCREMENT?'), type: 'checkbox' },
        { name: 'is_unsigned', label: t('UNSIGNED (NO NEGATIVES)?'), type: 'checkbox' },
    ];

    return (
        <>  <Head title={`${t('Fields of')} ${tableName}`} />
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <SmartButton href="/settings/table" icon="arrow-left" variant="outline" size="sm" tooltip="Volver" />
                    <Heading title={`${t('Structure of:')} ${tableName}`} description={t('Manage the fields and data types belonging to this table.')} />
                </div>
                <SimpleList items={formatFields(tableFields)} subtitle="comment" endpoint={`/settings/table/${tableName}/field`} fields={fields} renderExtra={(field) => (
                    <>  <SmartBadge label={field.raw_type ?? field.type} color="cyan" />
                        {field.is_primary && <SmartBadge label="PK" color="amber" />}
                        {field.is_foreign && <SmartBadge label="FK" color="purple" />}
                        {field.auto_increment && <SmartBadge label="AI" color="blue" />}
                        {field.is_nullable && <SmartBadge label="NULL" variant="outline" />}
                    </>
                )} />
            </div>
        </>
    );
}

TableFieldsManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }, { title: 'Table Fields', href: '#' }] };