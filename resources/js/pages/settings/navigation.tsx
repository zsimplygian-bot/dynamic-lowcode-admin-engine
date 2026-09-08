import { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { DynamicTableContent } from '@/components/dynamic-table';
import { useTranslation } from '@/hooks/use-translation';
export default function NavigationManager() {
    const t = useTranslation();
    const headingProps = useMemo(() => ({
        variant: "small" as const,
        title: t("Navigation"),
        description: t("Manage main menu items and system shortcuts.")
    }), [t]);
    return (
        <>  <Head title={t("Navigation Settings")} />
            <h1 className="sr-only">{t("Navigation Settings")}</h1>
            <div className="max-w-7xl mx-auto">
                <Heading {...headingProps} />
                <DynamicTableContent tableName="navigation" />
            </div>
        </>
    );
}
NavigationManager.layout = { breadcrumbs: [{ title: 'Navigation Settings', href: '/settings/navigation' }], };