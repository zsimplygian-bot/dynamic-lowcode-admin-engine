import { useState, useMemo, memo, useEffect } from 'react';
import { Form, Head } from '@inertiajs/react';
import { Columns, ArrowLeft, Type, Key } from 'lucide-react';
import Heading from '@/components/heading';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SearchInput } from '@/components/search-input';
import { SmartButton } from '@/components/smart-button';
import { SortableList } from '@/components/sortable-list';
export interface FieldItem {
    id: string;
    name: string;
    type: string;
    is_nullable?: boolean;
    is_primary?: boolean;
    default_value?: string | null;
}
interface TableFieldsProps {
    tableName?: string;
    fieldsList?: FieldItem[];
}
const FIELD_FORM_CONFIG = [
    { name: 'name', label: 'Nombre del campo', placeholder: 'Ej. user_id', required: true },
    { 
        name: 'type', 
        label: 'Tipo de dato', 
        type: 'select', 
        required: true,
        options: [
            { label: 'Texto corto (string / varchar)', value: 'string' },
            { label: 'Texto largo (text)', value: 'text' },
            { label: 'Entero (integer)', value: 'integer' },
            { label: 'Entero Grande (bigInteger)', value: 'bigInteger' },
            { label: 'Booleano (boolean)', value: 'boolean' },
            { label: 'Fecha y hora (datetime)', value: 'datetime' },
            { label: 'Fecha (date)', value: 'date' },
            { label: 'Decimal / Flotante (decimal)', value: 'decimal' },
            { label: 'JSON (json)', value: 'json' },
        ]
    },
    { name: 'nullable', label: 'Permitir valores nulos (NULL)', type: 'checkbox' },
    { name: 'default_value', label: 'Valor por defecto (Opcional)', placeholder: 'Ej. active, 0, null' }
];
const FieldItemRow = memo(({ field, tableName }: { field: FieldItem; tableName: string }) => {
    const initialValues = useMemo(() => ({ ...field, nullable: field.is_nullable }), [field]);
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                {field.is_primary ? <Key className="size-4" /> : <Type className="size-4" />}
                <span className="font-mono text-sm">{field.name}</span>
                {field.is_primary && <span className="text-xs font-bold">PK</span>}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
                <span>{field.type}</span>
                {Boolean(field.is_nullable) && <span>NULL</span>}
                <ActionButtons {...{ row_id: field.id, endpoint: `/settings/tables/${tableName}/fields`, title: "Campo de la Tabla", fields: FIELD_FORM_CONFIG, initialValues }} />
            </div>
        </div>
    );
});
FieldItemRow.displayName = 'FieldItemRow';
export default function TableFieldsManager({ tableName = "tabla_desconocida", fieldsList = [] }: TableFieldsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<FieldItem[]>(fieldsList);
    useEffect(() => {
        setItems(fieldsList);
    }, [fieldsList]);
    const filteredFields = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return items;
        return items.filter((f) => f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query));
    }, [items, searchQuery]);
    const isSearching = Boolean(searchQuery.trim());
    return (
        <>
            <Head {...{ title: `Campos - ${tableName}` }} />
            <Form {...{ action: `/settings/tables/${tableName}/fields/reorder`, method: "post", options: { preserveScroll: true }, transform: () => ({ fields: items.map((f) => f.name) }), className: "max-w-4xl mx-auto space-y-2" }}>
                {({ processing }) => (
                    <>
                        <div className="flex items-center gap-4">
                            <SmartButton {...{ href: "/settings/tables", icons: ArrowLeft, variant: "outline", size: "sm" }} />
                            <Heading {...{ title: `Estructura de: ${tableName}`, description: "Administra los campos, reordena las columnas y configura restricciones." }} />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <SearchInput {...{ value: searchQuery, onChange: setSearchQuery,  }} />
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Columns className="size-4" />
                                    <span>{filteredFields.length} de {items.length} columnas</span>
                                </div>
                                <NewRecordButton {...{ endpoint: `/settings/tables/${tableName}/fields`, title: "Campo", fields: FIELD_FORM_CONFIG }} />
                            </div>
                        </div>
                        <SortableList {...{ items: filteredFields, onReorder: (reordered) => { if (!isSearching) setItems(reordered); }, getItemKey: (item) => item.id, emptyMessage: isSearching ? `No se encontraron columnas que coincidan con "${searchQuery}".` : 'Esta tabla no tiene columnas registradas.', renderItem: (field) => <FieldItemRow {...{ field, tableName }} /> }} />
                        <div className="flex justify-end">
                            <SmartButton {...{ type: "submit", isLoading: processing, disabled: isSearching, label: processing ? 'Guardando orden...' : 'Guardar Cambios' }} />
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
TableFieldsManager.layout = {
    breadcrumbs: [
        { title: 'Configuración de Tablas', href: '/settings/tables' },
        { title: 'Campos de Tabla', href: '#' }
    ],
};