import { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Table as TableIcon, Settings2, Database, Layers, Upload, Download } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { FormGroup } from '@/components/form-group';
import { SimpleList } from '@/components/simple-list';
import DatabaseIEController from '@/actions/App/Http/Controllers/Settings/DatabaseIEController';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export default function TablesManager({ dbTables = [] }) {
    const t = useTranslation();
    const [activeSection, setActiveSection] = useState('tables');
    const sectionTabs = [
        { id: 'tables', label: t('Tables'), icon: TableIcon },
        { id: 'backups', label: t('Backups'), icon: Database },
    ];
    const fields = [ { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true } ];
    const backupFields = [ { id: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true } ];
    return (
        <>  <Head title={t('Table Management')} />
            <div className="space-y-4">
                <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
                <Tabs activeTab={activeSection} onTabChange={setActiveSection} tabs={sectionTabs} />
                {activeSection === 'tables' ? (
                    <SimpleList items={dbTables} icon={TableIcon} searchKey="name" endpoint="/settings/table" fields={fields} renderExtra={(table) => (
                        <>  {table.rows_count !== undefined && <SmartBadge icon={Layers} label={`${table.rows_count}`} variant="secondary" />}
                            {table.size_mb !== undefined && <SmartBadge label={`${table.size_mb} MB`} variant="secondary" />}
                            <SmartButton href={`/settings/table/${table.id ?? table.name.split('.').pop()}`} icon={Settings2} size="xs" tooltip={t('View columns')} />
                        </>
                    )} />
                ) : (
                    <div className="space-y-4 border rounded-xl p-4 bg-card">
                        <div className="space-y-2">
                            <Heading variant="small" title={t('Export backup')} description={t('Download a complete backup copy of the database in SQL format.')} />
                            <SmartButton icon={Download} label={t('Export')} onClick={() => { window.location.href = '/settings/table/export'; }} />
                        </div>
                        <hr className="border-border" />
                        <Form {...DatabaseIEController.import.form()} options={{ preserveScroll: true }} className="space-y-2">
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