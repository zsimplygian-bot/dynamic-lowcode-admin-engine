import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Users, Lock, UserCheck } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartBadge } from '@/components/smart-badge';
import { type FieldConfig } from '@/components/form-group';
import { SimpleList } from '@/components/simple-list';
import { Tabs, type TabItem } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';

export interface RoleItem {
    id: string | number;
    name: string;
    users_count?: number;
}

export interface UserRoleItem {
    id: string | number;
    name: string;
    email: string;
    role_id?: string | number;
    role_name?: string;
}

type TabSection = 'roles' | 'users';

export default function RolesManager({
    roles = [],
    users = [],
    roleOptions = [],
    userOptions = [],
}: {
    roles?: RoleItem[];
    users?: UserRoleItem[];
    roleOptions?: { value: string | number; label: string }[];
    userOptions?: { value: string | number; label: string }[];
}) {
    const t = useTranslation();
    const [activeSection, setActiveSection] = useState<TabSection>('roles');

    const sectionTabs: TabItem<TabSection>[] = useMemo(() => [
        { id: 'roles', label: t('Roles'), icon: Shield },
        { id: 'users', label: t('User Assignments'), icon: Users },
    ], [t]);

    const roleFields: FieldConfig[] = useMemo(() => [
        { name: 'name', label: t('ROLE NAME'), placeholder: t('e.g. editor'), required: true }
    ], [t]);

    const userFields: FieldConfig[] = useMemo(() => [
        { name: 'id', label: t('USER'), type: 'select', options: userOptions, required: true },
        { name: 'role_id', label: t('ROLE'), type: 'select', options: roleOptions, required: true }
    ], [userOptions, roleOptions, t]);

    const renderRoleRow = (role: RoleItem) => (
        <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Lock className="size-5" />
                </div>
                <p className="text-sm font-medium truncate">{role.name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {role.users_count !== undefined && (
                    <SmartBadge icon={Users} label={`${role.users_count} ${t('users')}`} variant="secondary" />
                )}
            </div>
        </div>
    );

    const renderUserRow = (user: UserRoleItem) => (
        <div className="flex items-center justify-between min-w-0 gap-4">
            <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 border rounded-lg bg-muted text-muted-foreground shrink-0">
                    <UserCheck className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>
            <SmartBadge label={user.role_name ?? t('Sin Rol')} variant="secondary" />
        </div>
    );

    return (
        <>
            <Head title={t('Roles & Permissions')} />
            <div className="max-w-4xl mx-auto space-y-4">
                <Heading variant="small" title={t('Roles & Access')} description={t('Manage global roles and assign access levels to system users.')} />
                <Tabs activeTab={activeSection} onTabChange={setActiveSection} tabs={sectionTabs} />
                {activeSection === 'roles' ? (
                    <SimpleList items={roles} searchKey="name" endpoint="/settings/role" fields={roleFields} renderRowContent={renderRoleRow} />
                ) : (
                    <SimpleList items={users} searchKey="name" endpoint="/settings/user-role" fields={userFields} renderRowContent={renderUserRow} />
                )}
            </div>
        </>
    );
}

RolesManager.layout = { breadcrumbs: [{ title: 'Roles Settings', href: '/settings/role' }] };