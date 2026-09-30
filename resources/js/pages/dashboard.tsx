import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import DynamicCards from '@/components/dashboard/dynamic-cards';
import CustomMetrics from '@/components/dashboard/custom-metrics';
export default function Dashboard({ cards = [] }: { cards?: any[] }) {
    return (
        <>  <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DynamicCards cards={cards} />
                <CustomMetrics />
            </div>
        </>
    );
}
Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };