import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { SmartButton } from '@/components/smart-button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editNavigation } from '@/routes/navigation'; 
import { index as tablesIndex } from '@/routes/tables';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import { User, ShieldCheck, Palette, Compass, TableProperties, DatabaseZap, Lock } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: editProfile(), icon: User },
    { title: 'Security', href: editSecurity(), icon: ShieldCheck },
    { title: 'Roles & Access', href: '/settings/role', icon: Lock },
    { title: 'Appearance', href: editAppearance(), icon: Palette },
    { title: 'Navigation', href: editNavigation(), icon: Compass },
    { title: 'Database', href: tablesIndex(), icon: TableProperties },
    { title: 'Cache & System', href: '/settings/cache', icon: DatabaseZap },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const t = useTranslation();

    return (
        <div className="px-4 py-6">
            <Heading title={t('Settings')} description={t('Manage your profile and account settings')} />
            <div className="flex flex-col lg:flex-row lg:space-x-12 mt-6">
                <nav className="flex flex-col space-y-1" aria-label="Settings">
                    {sidebarNavItems.map(({ title, href, icon: Icon }) => {
                        const isActive = isCurrentOrParentUrl(href);
                        return (
                            <SmartButton key={title} size="sm" variant="ghost" label={t(title)} icon={Icon} href={href}
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