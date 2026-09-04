import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { DynamicTableContent } from '@/components/dynamic-table';
const TABLE_NAME = 'navigation';
export default function NavigationManager() {
    const headingProps = useMemo(() => ({
        variant: "small" as const,
        title: "Navegación",
        description: "Gestiona los elementos del menú principal y accesos del sistema."
    }), []);
    return (
        <> <Head {...{ title: "Configuración de Navegación" }} />
            <h1 {...{ className: "sr-only" }}>Configuración de Navegación</h1>
            <div {...{ className: "max-w-7xl mx-auto" }}>
                <Heading {...headingProps} />
                    <DynamicTableContent {...{ tableName: TABLE_NAME }} />
            </div>
        </>
    );
}
NavigationManager.layout = { breadcrumbs: [{ title: 'Configuración de Navegación', href: '/settings/navigation' }], };