import { createInertiaApp, usePage } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

declare global { function isRole(role: string): boolean }
window.isRole = (role: string) => {
    const { auth } = usePage<any>().props;
    return Boolean(auth?.user?.roles?.includes(role));
};
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome': return null;
            case name.startsWith('auth/'): return AuthLayout;
            case name.startsWith('settings/'): return [AppLayout, SettingsLayout];
            default: return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration="{0}">
                {app}
                <Toaster/>
            </TooltipProvider>
        );
    },
    progress: { color: '#FF0000' },
});

initializeTheme();