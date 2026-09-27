import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { SmartButton } from '@/components/smart-button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';
const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: '/settings/profile', icon: 'user' },
    { title: 'Security', href: '/settings/security', icon: 'shield-check' },
    { title: 'Roles & Access', href: '/settings/role', icon: 'lock' },
    { title: 'Permissions', href: '/settings/permission', icon: 'key-round' },
    { title: 'Appearance', href: '/settings/appearance', icon: 'palette' },
    { title: 'Navigation', href: '/settings/navigation', icon: 'compass' },
    { title: 'Database', href: '/settings/table', icon: 'table-properties' },
    { title: 'Cache & System', href: '/settings/cache', icon: 'database-zap' },
];
export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const t = useTranslation();
    return (
        <div className="px-4 py-6">
            <Heading title={t('Settings')} description={t('Manage your profile and account settings')} />
            <div className="flex flex-col lg:flex-row lg:space-x-12 mt-6">
                <nav className="flex flex-col space-y-1" aria-label="Settings">
                    {sidebarNavItems.map(({ title, href, icon }) => {
                        const isActive = isCurrentOrParentUrl(href);
                        return (
                            <SmartButton key={title} size="sm" variant="ghost" label={t(title)} icon={icon} href={href}
                                className={cn('w-full justify-start gap-2', isActive && 'bg-muted font-medium')}
                            />
                        );
                    })}
                </nav>
                <Separator className="my-6 lg:hidden" />
                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}