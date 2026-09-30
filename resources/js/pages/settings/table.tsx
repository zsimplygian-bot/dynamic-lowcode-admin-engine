import { Head, Form } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { FormGroup } from '@/components/form-group';
import { SimpleList } from '@/components/simple-list';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export default function TablesManager({ tables = [] }: { tables?: any }) {
    const t = useTranslation();
    const fields = [ { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true },
                     { name: 'label', label: t('LABEL'), placeholder: t('e.g. Users List') },
                     { name: 'icon', label: t('ICON'), placeholder: t('e.g. users') },
                     { name: 'color', label: t('COLOR'), placeholder: t('e.g. bg-violet-500') } ];
    const backupFields = [ { id: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true }, 
                           { id: 'keep_protected', label: t('KEEP PROTECTED TABLES (USERS, ROLES, SESSIONS, ETC.)?'), type: 'checkbox', defaultValue: 1 } ];
    return (
        <>  <Head title={t('Table Management')} />
            <div className="space-y-2">
                <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
                <Tabs tabs={[{ id: 'tables', label: t('Tables'), icon: 'table' }, { id: 'backups', label: t('Backups'), icon: 'database' }]}>
                {(section) => section === 'tables' ? (
                    <SimpleList items={tables} icon="table" subtitle="comment" endpoint="/settings/table" fields={fields} renderExtra={(table) => (
                        <>  <SmartBadge icon="layers" label={`${table.rows_count}`} variant="secondary" />
                            <SmartButton href={`/settings/table/${table.name}`} icon="settings-2" size="xs" tooltip={t('View columns')} />
                        </>
                    )} />
                ) : ( <div className="space-y-4 border rounded-xl p-4 bg-card">
                        <div className="space-y-2">
                            <Heading variant="small" title={t('Export backup')} description={t('Download a complete backup copy of the database in SQL format.')} />
                            <SmartButton href="/settings/table/export" icon="download" label={t('Export')} />
                        </div>
                        <hr className="border-border" />
                        <Form action="/settings/table/import" method="post" options={{ preserveScroll: true }}>
                            {({ processing, errors }) => (
                                <div className="space-y-2">
                                    <Heading variant="small" title={t('Import backup')} description={t('Upload a .sql backup file to restore structure and data.')} />
                                    <FormGroup fields={backupFields} errors={errors} />
                                    <SmartButton type="submit" icon="upload" label={t('Import')} loadingLabel={t('Importing...')} isLoading={processing} variant="secondary" />
                                </div>
                            )}
                        </Form>
                    </div>
                )}
                </Tabs>
            </div>
        </>
    );
}
TablesManager.layout = { breadcrumbs: [{ title: 'Table Settings', href: '/settings/table' }] };