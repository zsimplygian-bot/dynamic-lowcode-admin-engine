import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { useTranslation } from '@/hooks/use-translation';
function getFieldIconName(type, isPrimary) {
    if (isPrimary) return 'key';
    const t = type ?? '';
    if (t.includes('tinyint') || t.includes('bool')) return 'toggle-left';
    if (t.includes('int')) return 'binary';
    if (t.includes('decimal') || t.includes('float') || t.includes('double')) return 'hash';
    if (t.includes('enum')) return 'list-filter';
    if (t.includes('time') || t.includes('datetime') || t.includes('timestamp')) return 'clock';
    if (t.includes('date')) return 'calendar';
    if (t.includes('text')) return 'text-quote';
    if (t.includes('json')) return 'code-2';
    return 'type';
}
export default function TableFieldsManager({ tableName, fieldsList }) {
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
            { id: 'date', label: `📅 ${t('Date (date)')}` },
            { id: 'decimal', label: `🪙 ${t('Decimal (decimal)')}` },
            { id: 'json', label: `📦 ${t('JSON (json)')}` },
        ]},
        { name: 'enum_values', label: t('ENUM VALUES (COMMA SEPARATED)'), placeholder: t('e.g. activo, inactivo or hombre, mujer'), dependsOn: { name: 'type', value: 'enum' } },
        { name: 'length', label: t('LENGTH / SIZE'), type: 'number', placeholder: t('e.g. 255'), min: 1, max: 255 },
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
                    <SmartButton href="/settings/table" icon="arrow-left" variant="outline" size="sm" />
                    <Heading title={`${t('Structure of:')} ${tableName}`} description={t('Manage the fields and data types belonging to this table.')} />
                </div>
                <SimpleList items={fieldsList} icon={(field) => getFieldIconName(field.type, field.is_primary)} subtitleKey="comment" endpoint={`/settings/table/${tableName}/field`} fields={fields} renderExtra={(field) => (
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