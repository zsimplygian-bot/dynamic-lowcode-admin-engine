import { useState, useMemo, memo } from 'react';
import { Head } from '@inertiajs/react';
import { Table as TableIcon, Database, Layers, Search } from 'lucide-react';
import Heading from '@/components/heading';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { Input } from '@/components/ui/input';

export interface DatabaseTableItem {
    id: string;
    name: string;
    rows_count?: number;
    size_mb?: string;
}

const fields = [
    { name: 'name', label: 'Nombre de la tabla', placeholder: 'Ej. users', required: true }
];

const TableItemRow = memo(({ table }: { table: DatabaseTableItem }) => (
    <div className="flex items-center justify-between p-1 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0"><TableIcon className="size-5" /></div>
            <div className="truncate">
                <p className="text-sm font-medium font-mono truncate">{table.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono shrink-0">
            {table.rows_count !== undefined && <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"><Layers className="size-3.5" />{table.rows_count} registros</span>}
            {table.size_mb && <span className="bg-muted px-2 py-1 rounded-md">{table.size_mb} MB</span>}
            <ActionButtons {...{ row_id: table.id, endpoint: '/settings/database-tables', title: 'Tabla de Base de Datos', fields, initialValues: table }} />
        </div>
    </div>
));
TableItemRow.displayName = 'TableItemRow';

export default function DatabaseTablesManager({ dbTables = [] }: { dbTables?: DatabaseTableItem[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Formateamos las tablas para conservar solo el nombre limpio (después del punto)
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

    return (
        <>
            <Head title="Tablas de la Base de Datos" />
            <h1 className="sr-only">Tablas de la Base de Datos</h1>
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Heading {...{ variant: 'small', title: 'Tablas de la Base de Datos', description: 'Listado de tablas presentes en el esquema activo de tu base de datos.' }} />
                    <NewRecordButton {...{ endpoint: '/settings/database-tables', title: 'Tabla de Base de Datos', fields }} />
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input {...{ type: 'text', placeholder: 'Buscar tabla...', 
                            value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: 'pl-9 h-9' }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border shrink-0">
                        <Database className="size-4" />
                        <span>{filteredTables.length} de {formattedTables.length} tablas</span>
                    </div>
                </div>
                <div className="border rounded-xl bg-card overflow-hidden">
                    <div className="divide-y max-h-[500px] overflow-y-auto">
                        {filteredTables.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                {searchQuery ? `No se encontraron tablas que coincidan con "${searchQuery}".` : 'No hay tablas registradas.'}
                            </div>
                        ) : (
                            filteredTables.map((table) => <TableItemRow key={table.id} {...{ table }} />)
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
DatabaseTablesManager.layout = { breadcrumbs: [{ title: 'Tablas de Base de Datos', href: '/settings/database-tables' }] };