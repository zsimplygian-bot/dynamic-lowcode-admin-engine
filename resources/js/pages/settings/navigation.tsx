import { useState, useEffect } from 'react';
import { Form, Head } from '@inertiajs/react';
import { DynamicIcon } from '@/components/dynamic-icon';
import Heading from '@/components/heading';
import NavigationController from '@/actions/App/Http/Controllers/Settings/NavigationController';
import { SmartButton } from '@/components/smart-button';
import { NewRecordButton } from '@/components/new-record-button';
import { ActionButtons } from '@/components/action-buttons';
import { SortableList } from '@/components/sortable-list';
export interface NavItem {
    id?: string;
    title: string;
    href: string;
    icon?: string;
}
const NAV_FIELDS = [
    { name: 'title', label: 'Título', placeholder: 'Ej. Dashboard', required: true },
    { name: 'href', label: 'URL (Ruta)', placeholder: 'Ej. /dashboard', required: true },
    { name: 'icon', label: 'Icono (Lucide)', placeholder: 'Ej. LayoutGrid', required: false },
];
export default function NavigationManager({ mainNavItems = [] }: { mainNavItems?: NavItem[] }) {
    const [items, onReorder] = useState<NavItem[]>(mainNavItems);
    const endpoint = '/settings/navigation/item';
    const emptyMessage = 'No hay elementos configurados en este menú.';
    useEffect(() => {
        onReorder(mainNavItems);
    }, [mainNavItems]);
    const renderItem = (item: NavItem, index: number) => (
        <>
            <div className="flex items-center gap-3">
                <div className="p-2 border rounded-lg bg-muted">
                    <DynamicIcon name={item.icon || 'LayoutGrid'} className="size-5" />
                </div>
                <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.href}</p>
                </div>
            </div>
            <ActionButtons {...{ row_id: item.id || index, endpoint, title: "Elemento de menú", fields: NAV_FIELDS, initialValues: item }} />
        </>
    );
    return (
        <>
            <Head title="Configuración de Navegación" />
            <h1 className="sr-only">Configuración de Navegación</h1>
            <Form {...NavigationController.update.form()}
                options={{ preserveScroll: true }}
                transform={(data) => ({ ...data, mainNavItems: items })}
                className="max-w-4xl mx-auto space-y-4"
            >
                {({ processing }) => (
                    <>
                        <div className="flex items-center justify-between">
                            <Heading {...{ variant: "small", title: "Navegación", description: "Gestiona y reordena los elementos del menú de tu aplicación." }} />
                            <NewRecordButton {...{ endpoint, title: "Elemento de menú", fields: NAV_FIELDS }} />
                        </div>
                        <SortableList {...{ items, onReorder, emptyMessage, renderItem }} />
                        <div className="flex justify-end">
                            <SmartButton {...{ type: "submit", isLoading: processing, label: processing ? 'Guardando posición...' : 'Guardar Cambios' }} />
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
NavigationManager.layout = {
    breadcrumbs: [{ title: 'Navigation settings', href: '/settings/navigation' }],
};