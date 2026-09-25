import { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Table as TableIcon, Settings2, Database, Layers, Upload, Download } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { FormGroup } from '@/components/form-group';
import { SimpleList } from '@/components/simple-list';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export default function TablesManager({ dbTables }) {
    const t = useTranslation();
    const [section, setSection] = useState('tables');
    const fields = [{ name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true }];
    const backupFields = [ { id: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true },
                           { id: 'keep_protected', label: t('KEEP PROTECTED TABLES (USERS, ROLES, SESSIONS, ETC.)?'), type: 'checkbox', defaultValue: 1 }, ];
    return (
        <>  <Head title={t('Table Management')} />
            <div className="space-y-2">
                <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
                <Tabs onTabChange={setSection} tabs={[{ id: 'tables', label: t('Tables'), icon: TableIcon }, { id: 'backups', label: t('Backups'), icon: Database }]} />
                {section === 'tables' ? (
                    <SimpleList items={dbTables} icon={TableIcon} endpoint="/settings/table" fields={fields} renderExtra={(table) => (
                        <>  <SmartBadge icon={Layers} label={`${table.rows_count}`} variant="secondary" />
                            <SmartBadge label={`${table.size_mb} MB`} variant="secondary" />
                            <SmartButton href={`/settings/table/${table.name}`} icon={Settings2} size="xs" tooltip={t('View columns')} />
                        </>
                    )} />
                ) : ( <div className="space-y-4 border rounded-xl p-4 bg-card">
                        <div className="space-y-2">
                            <Heading variant="small" title={t('Export backup')} description={t('Download a complete backup copy of the database in SQL format.')} />
                            <SmartButton href="/settings/table/export" icon={Download} label={t('Export')} />
                        </div>
                        <hr className="border-border" />
                        <Form action="/settings/table/import" method="post" options={{ preserveScroll: true }}>
                            {({ processing, errors }) => (
                                <div className="space-y-2">
                                    <Heading variant="small" title={t('Import backup')} description={t('Upload a .sql backup file to restore structure and data.')} />
                                    <FormGroup fields={backupFields} errors={errors} />
                                    <SmartButton type="submit" icon={Upload} label={t('Import')} loadingLabel={t('Importing...')} isLoading={processing} variant="secondary" />
                                </div>
                            )}
                        </Form>
                    </div>
                )}
            </div>
        </>
    );
}
TablesManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }] };