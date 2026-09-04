import { useState } from 'react';
import { Head, Form, Link } from '@inertiajs/react';
import { Table as TableIcon, Settings2, Database, Layers, Upload, Download } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import { FormGroup } from '@/components/form-group';
import { SimpleList, FieldConfig } from '@/components/simple-list';
import DatabaseIEController from '@/actions/App/Http/Controllers/Settings/DatabaseIEController';
import { Tabs, type TabItem } from '@/components/ui/tabs';
export interface DatabaseTableItem {
  id: string;
  name: string;
  rows_count?: number;
  size_mb?: string;
}
type TabSection = 'tables' | 'backups';
const SECTION_TABS: TabItem<TabSection>[] = Object.freeze([
  { id: 'tables', label: 'Tablas', icon: TableIcon }, { id: 'backups', label: 'Respaldos', icon: Database },
]);
const FIELDS: FieldConfig[] = Object.freeze([{ name: 'name', label: 'Nombre de la tabla', placeholder: 'Ej. users', required: true }]);
const BACKUP_FIELDS = Object.freeze([{ id: 'backup', label: 'Seleccionar archivo .sql', type: 'file', accept: '.sql', required: true }]);
const renderTableRow = (table: DatabaseTableItem) => (
  <div className="flex items-center justify-between min-w-0">
    <div className="flex items-center gap-2 min-w-0">
      <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
        <TableIcon className="size-5" />
      </div>
      <p className="text-sm font-medium font-mono truncate">{table.name}</p>
    </div>
    <div className="flex items-center gap-2 font-mono shrink-0">
      {table.rows_count !== undefined && <SmartBadge {...{ icon: Layers, label: `${table.rows_count} registros`, variant: "secondary" }} />}
      {table.size_mb && <SmartBadge {...{ label: `${table.size_mb} MB`, variant: "secondary" }} />}
        <SmartButton {...{ href: `/settings/tables/${table.id}`, icon: Settings2, label: "Campos", size: "xs" }} />
    </div>
  </div>
);
export default function TablesManager({ dbTables = [] }: { dbTables?: DatabaseTableItem[] }) {
  const [activeSection, setActiveSection] = useState<TabSection>('tables');
  const formattedTables = dbTables.map((t) => {
    const name = t.name.split('.').pop() ?? t.name;
    return { ...t, id: name, name };
  });
  return (
    <><Head {...{ title: "Gestión de Tablas" }} />
      <div className="max-w-4xl mx-auto space-y-4">
        <Heading {...{ variant: "small", title: "Base de Datos", description: "Gestiona las tablas activas, respaldos e importación de datos." }} />
        <Tabs {...{ activeTab: activeSection, onTabChange: setActiveSection, tabs: SECTION_TABS }} />
        {activeSection === 'tables' ? (
          <SimpleList {...{ items: formattedTables, searchKey: "name", endpoint: "/settings/tables", fields: FIELDS, renderRowContent: renderTableRow }} />
        ) : (
          <div className="space-y-4 border rounded-xl p-4 bg-card">
            <div className="space-y-2">
              <Heading {...{ variant: "small", title: "Exportar respaldo", description: "Descarga una copia de seguridad completa de la base de datos en formato SQL." }} />
              <SmartButton {...{ icon: Download, label: "Exportar", onClick: () => { window.location.href = '/settings/tables/export'; } }} />
            </div>
            <hr className="border-border" />
            <Form {...{ ...DatabaseIEController.import.form(), options: { preserveScroll: true }, className: "space-y-2" }}>
              {({ processing, errors }) => (
                <div className="space-y-2">
                  <Heading {...{ variant: "small", title: "Importar respaldo", description: "Sube un archivo de respaldo .sql para restaurar la estructura y los datos." }} />
                  <FormGroup {...{ fields: BACKUP_FIELDS, errors }} />
                  <SmartButton {...{ type: "submit", icon: Upload, label: "Importar", loadingLabel: "Importando...", isLoading: processing, variant: "secondary" }} />
                </div>
              )}
            </Form>
          </div>
        )}
      </div>
    </>
  );
}
TablesManager.layout = { breadcrumbs: [{ title: 'Configuración de Tablas', href: '/settings/tables' }] };