import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import DynamicCards from '@/components/dashboard/dynamic-cards';
export default function Dashboard({ counts = {} }) {
    return (
        <> <Head {...{ title: "Dashboard" }} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl  p-4"> <DynamicCards {...{ counts }} /> </div>
        </>
    );
}
Dashboard.layout = { breadcrumbs: [ { title: 'Dashboard', href: dashboard(), }, ], };