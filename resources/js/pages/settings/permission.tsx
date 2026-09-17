import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { KeyRound, Shield, Users, Lock, CheckSquare } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export default function PermissionsManager({ permissions = [], roles = [], users = [] }) {
    const t = useTranslation();
    const [activeSection, setActiveSection] = useState('permissions');
    const sectionTabs = [
        { id: 'permissions', label: t('Permissions'), icon: KeyRound },
        { id: 'role-permissions', label: t('Role Permissions'), icon: Shield },
        { id: 'user-permissions', label: t('User Direct Permissions'), icon: Users },
    ];
    const permissionFields = [{ name: 'name', label: t('PERMISSION NAME'), placeholder: t('e.g. edit articles'), required: true }];
    const rolePermissionFields = [
        { name: 'id', label: t('ROLE'), type: 'select', required: true },
        { name: 'permission', label: t('PERMISSION'), type: 'select', required: true }
    ];
    const userPermissionFields = [
        { name: 'id', label: t('USER'), type: 'select', required: true },
        { name: 'permission', label: t('PERMISSION'), type: 'select', required: true }
    ];
    return (
        <>  <Head title={t('Permissions Management')} />
            <div className="max-w-4xl mx-auto space-y-4">
                <Heading variant="small" title={t('Permissions & Access')} description={t('Manage global permissions and assign them directly to roles or users.')} />
                <Tabs activeTab={activeSection} onTabChange={setActiveSection} tabs={sectionTabs} />
                {activeSection === 'permissions' && (
                    <SimpleList items={permissions} icon={Lock} searchKey="name" endpoint="/settings/permission" fields={permissionFields} 
                    renderExtra={(perm) => perm.roles_count !== undefined && <SmartBadge icon={Shield} label={`${perm.roles_count} ${t('roles')}`} variant="secondary" />} />
                )}
                {activeSection === 'role-permissions' && (
                    <SimpleList items={roles} icon={Shield} searchKey="name" endpoint="/settings/role-permission" fields={rolePermissionFields} 
                    renderExtra={(role) => <SmartBadge label={`${role.permissions_count ?? 0} ${t('permissions')}`} variant="secondary" />} />
                )}
                {activeSection === 'user-permissions' && (
                    <SimpleList items={users} icon={CheckSquare} searchKey="name" subtitleKey="email" endpoint="/settings/user-permission" 
                    fields={userPermissionFields} renderExtra={(user) => <SmartBadge label={`${user.permissions_count ?? 0} ${t('direct permissions')}`} variant="secondary" />} />
                )}
            </div>
        </>
    );
}
PermissionsManager.layout = { breadcrumbs: [{ title: 'Permission Settings', href: '/settings/permission' }] };