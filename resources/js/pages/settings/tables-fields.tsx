import { memo } from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Key, Type } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartButton } from '@/components/smart-button';
import { SimpleList, FieldConfig } from '@/components/simple-list';
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
const FIELD_FORM_CONFIG: FieldConfig[] = [
    { name: 'name', label: 'NOMBRE', placeholder: 'Ej. user_id', required: true },
    { name: 'type', label: 'TIPO', type: 'select', required: true,
        options: [
            { id: 'varchar', label: 'Texto corto (varchar)' },
            { id: 'text', label: 'Texto largo (text)' },
            { id: 'int', label: 'Entero (int)' },
            { id: 'bigint', label: 'Entero Grande (bigint)' },
            { id: 'tinyint', label: 'Booleano / Tinyint' },
            { id: 'datetime', label: 'Fecha y hora (datetime)' },
            { id: 'date', label: 'Fecha (date)' },
            { id: 'decimal', label: 'Decimal (decimal)' },
            { id: 'json', label: 'JSON (json)' },
        ]
    },
    { name: 'raw_type', label: 'LONGITUD', placeholder: 'Ej. varchar(255) o decimal(10,2)' },
    { name: 'default_value', label: 'VALOR POR DEFECTO', placeholder: 'Ej. active, 0, null' },
    { name: 'comment', label: 'COMENTARIO / DESCRIPCIÓN', placeholder: 'Descripción o propósito de este campo', type: 'textarea' },
    { name: 'order', label: 'UBICACIÓN / CAMPO PREVIO (AFTER)', placeholder: 'Ej. id_navigation (o escribe "FIRST" para el inicio)' },
    { name: 'is_nullable', label: 'PERMITIR VALORES NULOS?', type: 'checkbox' },
    { name: 'auto_increment', label: 'AUTOINCREMENTABLE?', type: 'checkbox' },
];
const FieldRowContent = memo(({ field }: { field: any }) => (
    <div {...{ className: "flex items-center justify-between min-w-0 pr-2" }}>
        <div {...{ className: "flex items-center gap-2 min-w-0" }}>
            {field.is_primary ? <Key {...{ className: "size-4 text-amber-500 shrink-0" }} /> : <Type {...{ className: "size-4 text-muted-foreground shrink-0" }} />}
            <div {...{ className: "flex flex-col min-w-0" }}>
                <div {...{ className: "flex items-center gap-1.5" }}>
                    <span {...{ className: "font-mono text-sm font-medium truncate" }}>{field.name}</span>
                    {field.is_primary && <span {...{ className: "text-[10px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0" }}>PK</span>}
                    {Boolean(field.auto_increment) && <span {...{ className: "text-[10px] font-bold bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0" }}>AI</span>}
                </div>
                {field.comment && <span {...{ className: "text-xs text-muted-foreground truncate" }}>{field.comment}</span>}
            </div>
        </div>
        <div {...{ className: "flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0" }}>
            <span>{field.raw_type ?? field.type}</span>
            {Boolean(field.is_nullable) && <span {...{ className: "bg-muted px-1.5 py-0.5 rounded text-[10px]" }}>NULL</span>}
        </div>
    </div>
));
FieldRowContent.displayName = 'FieldRowContent';
export default function TableFieldsManager({ tableName = "tabla_desconocida", fieldsList = [] }: TableFieldsProps) {
    const endpoint = `/settings/tables/${tableName}/fields`;
    return (
        <> <Head {...{ title: `Campos de ${tableName}` }} />
            <div {...{ className: "max-w-4xl mx-auto space-y-0" }}>
                <div {...{ className: "flex items-center gap-2" }}>
                        <SmartButton {...{ href: "/settings/tables", icon: ArrowLeft, variant: "outline", size: "sm" }} />
                    <Heading {...{ title: `Estructura de: ${tableName}`, description: "Administra los campos y tipos de datos pertenecientes a esta tabla." }} />
                </div>
                <SimpleList {...{ items: fieldsList, searchKey: "name", endpoint, fields: FIELD_FORM_CONFIG, emptyText: "Esta tabla no posee columnas configuradas.", 
                    renderRowContent: (field) => <FieldRowContent {...{ field }} />
                }} />
            </div>
        </>
    );
}
TableFieldsManager.layout = { breadcrumbs: [{ title: 'Configuración de Tablas', href: '/settings/tables' }, { title: 'Campos de Tabla', href: '#' }] };