import { useState, useMemo, memo } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Table as TableIcon, Settings2, Database, Layers, Upload, Download } from 'lucide-react';
import Heading from '@/components/heading';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SearchInput } from '@/components/search-input';
import { FormGroup } from '@/components/form-group';
import { SmartButton } from '@/components/smart-button';
import { SmartBadge } from '@/components/smart-badge';
import DatabaseIEController from '@/actions/App/Http/Controllers/Settings/DatabaseIEController';
import { Tabs, type TabItem } from '@/components/ui/tabs';
export interface DatabaseTableItem {
    id: string;
    name: string;
    rows_count?: number;
    size_mb?: string;
}
interface DatabaseManagerProps {
    dbTables?: DatabaseTableItem[];
}
type TabSection = 'tables' | 'backups';
const SECTION_TABS: TabItem<TabSection>[] = [
    { id: 'tables', label: 'Tablas', icon: TableIcon },
    { id: 'backups', label: 'Respaldos', icon: Database },
];
const fields = [
    { name: 'name', label: 'Nombre de la tabla', placeholder: 'Ej. users', required: true }
];
const TableItemRow = memo(({ table }: { table: DatabaseTableItem }) => (
    <div className="flex items-center justify-between p-1 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
                <TableIcon {...{ className: "size-5" }} />
            </div>
            <p className="text-sm font-medium font-mono truncate">{table.name}</p>
        </div>
        <div className="flex items-center gap-3 font-mono shrink-0">
            {table.rows_count !== undefined && (
                <SmartBadge {...{ icon: Layers, label: `${table.rows_count} registros`, variant: "secondary" }} />
            )}
            {table.size_mb && (
                <SmartBadge {...{ label: `${table.size_mb} MB`, variant: "secondary" }} />
            )}
            <SmartButton {...{ href: `/settings/tables/${table.id}`, icons: Settings2, label: "Editar", variant: "outline", size: "xs" }} />
            <ActionButtons {...{ row_id: table.id, endpoint: "/settings/tables", title: "Tabla de Base de Datos", fields, initialValues: table }} />
        </div>
    </div>
));
TableItemRow.displayName = 'TableItemRow';
export default function TablesManager({ dbTables = [] }: DatabaseManagerProps) {
    const [activeSection, setActiveSection] = useState<TabSection>('tables');
    const [searchQuery, setSearchQuery] = useState('');
    const formattedTables = useMemo(() => {
        return dbTables.map((t) => {
            const cleanName = t.name.split('.').pop() ?? t.name;
            return {
                ...t,
                id: cleanName,
                name: cleanName,
            };
        });
    }, [dbTables]);
    const filteredTables = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return query ? formattedTables.filter((t) => t.name.toLowerCase().includes(query)) : formattedTables;
    }, [formattedTables, searchQuery]);
    const handleExport = () => {
        window.location.href = '/settings/tables/export';
    };
    return (
        <>
            <Head {...{ title: "Gestión de Tablas" }} />
            <div className="max-w-4xl mx-auto space-y-6">
                <Heading {...{ variant: "small", title: "Administración de Base de Datos", description: "Gestiona las tablas activas, respaldos e importación de datos." }} />
                <Tabs {...{ activeTab: activeSection, onTabChange: setActiveSection, tabs: SECTION_TABS }} />
                {/* TABLAS */}
                {activeSection === 'tables' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <SearchInput {...{ value: searchQuery, onChange: setSearchQuery }} />
                            <div className="flex items-center gap-3 shrink-0">
                                <SmartBadge {...{ label: `${filteredTables.length} de ${formattedTables.length} tablas`, variant: "outline", }} />
                                <NewRecordButton {...{ endpoint: "/settings/tables", title: "Tabla de Base de Datos", fields }} />
                            </div>
                        </div>
                        <div className="border rounded-xl bg-card overflow-hidden">
                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                {filteredTables.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        {searchQuery
                                            ? `No se encontraron tablas que coincidan con "${searchQuery}".`
                                            : 'No hay tablas registradas.'}
                                    </div>
                                ) : (
                                    filteredTables.map((table) => (
                                        <TableItemRow key={table.id} {...{ table }} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* RESPALDOS E IMPORTACIÓN */}
                {activeSection === 'backups' && (
                    <div className="space-y-6 border rounded-xl p-6 bg-card">
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Exportar respaldo</h3>
                            <p className="text-xs text-muted-foreground">
                                Descarga una copia de seguridad completa de la base de datos en formato SQL.
                            </p>
                            <SmartButton {...{ icons: Download, label: "Exportar", onClick: handleExport }} />
                        </div>
                        <hr className="border-border" />
                        <Form {...{ ...DatabaseIEController.import.form(), options: { preserveScroll: true }, className: "space-y-4" }}>
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium">Importar respaldo</h3>
                                        <FormGroup {...{ fields: [{ id: 'backup', label: 'Seleccionar archivo .sql', type: 'file', accept: '.sql', required: true }], errors }} />
                                    </div>
                                    <SmartButton {...{ type: "submit", icons: Upload, label: "Importar", loadingLabel: "Importando...", isLoading: processing, variant: "secondary" }} />
                                </>
                            )}
                        </Form>
                    </div>
                )}
            </div>
        </>
    );
}
TablesManager.layout = {
    breadcrumbs: [{ title: 'Configuración de Tablas', href: '/settings/tables' }],
};