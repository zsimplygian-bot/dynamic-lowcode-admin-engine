import { useState, useMemo } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Table as TableIcon, Settings2, Database, Layers, Upload, Download } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { FormGroup, type FieldConfig } from '@/components/form-group';
import { SimpleList } from '@/components/simple-list';
import DatabaseIEController from '@/actions/App/Http/Controllers/Settings/DatabaseIEController';
import { Tabs, type TabItem } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export interface DatabaseTableItem {
  id: string;
  name: string;
  rows_count?: number;
  size_mb?: string;
}
type TabSection = 'tables' | 'backups';
export default function TablesManager({ dbTables = [] }: { dbTables?: DatabaseTableItem[] }) {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState<TabSection>('tables');
  const sectionTabs: TabItem<TabSection>[] = useMemo(() => [
    { id: 'tables', label: t('Tables'), icon: TableIcon },
    { id: 'backups', label: t('Backups'), icon: Database },
  ], [t]);
  const fields: FieldConfig[] = useMemo(() => [
    { name: 'name', label: t('TABLE NAME'), placeholder: t('e.g. users'), required: true }
  ], [t]);
  const backupFields: FieldConfig[] = useMemo(() => [
    { id: 'backup', label: t('Select .sql file'), type: 'file', accept: '.sql', required: true }
  ], [t]);
  const formattedTables = useMemo(() => {
    return dbTables.map((t) => {
      const name = t.name.split('.').pop() ?? t.name;
      return { ...t, id: name, name };
    });
  }, [dbTables]);
  const renderTableRow = (table: DatabaseTableItem) => (
    <div className="flex items-center justify-between min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
          <TableIcon className="size-5" />
        </div>
        <p className="text-sm font-medium font-mono truncate">{table.name}</p>
      </div>
      <div className="flex items-center gap-2 font-mono shrink-0">
        {table.rows_count !== undefined && <SmartBadge icon={Layers} label={`${table.rows_count}`} variant="secondary" />}
        {table.size_mb !== undefined && <SmartBadge label={`${table.size_mb} MB`} variant="secondary" />}
        <SmartButton href={`/settings/table/${table.id}`} icon={Settings2} size="xs" tooltip={t('View columns')} />
      </div>
    </div>
  );
  return (
    <><Head title={t('Table Management')} />
      <div className="max-w-4xl mx-auto space-y-4">
        <Heading variant="small" title={t('Database')} description={t('Manage active tables, backups, and data imports.')} />
        <Tabs activeTab={activeSection} onTabChange={setActiveSection} tabs={sectionTabs} />
        {activeSection === 'tables' ? (
          <SimpleList items={formattedTables} searchKey="name" endpoint="/settings/table" fields={fields} renderRowContent={renderTableRow} />
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