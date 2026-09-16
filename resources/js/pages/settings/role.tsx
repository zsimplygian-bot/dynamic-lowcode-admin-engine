import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Users, Lock, UserCheck } from 'lucide-react';
import Heading from '@/components/heading';
import { SmartBadge } from '@/components/smart-badge';
import { SimpleList } from '@/components/simple-list';
import { Tabs } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
export default function RolesManager({ roles = [], users = [] }) {
    const t = useTranslation();
    const [activeSection, setActiveSection] = useState('roles');
    const sectionTabs = [
        { id: 'roles', label: t('Roles'), icon: Shield },
        { id: 'users', label: t('User Assignments'), icon: Users },
    ];
    const roleFields = [
        { name: 'name', label: t('ROLE NAME'), placeholder: t('e.g. editor'), required: true }
    ];
    const userFields = [
        { name: 'id', label: t('USER'), type: 'select', required: true, },
        { name: 'id_rol', label: t('ROLE'), type: 'select', required: true, }
    ];
    return (
        <>  <Head title={t('Roles & Permissions')} />
            <div className="max-w-4xl mx-auto space-y-4">
                <Heading variant="small" title={t('Roles & Access')} description={t('Manage global roles and assign access levels to system users.')} />
                <Tabs activeTab={activeSection} onTabChange={setActiveSection} tabs={sectionTabs} />
                {activeSection === 'roles' ? (
                    <SimpleList items={roles} icon={Lock} searchKey="name" endpoint="/settings/role" fields={roleFields} 
                    renderExtra={(role) => role.users_count !== undefined && <SmartBadge icon={Users} label={`${role.users_count} ${t('users')}`} variant="secondary" />} />
                ) : (
                    <SimpleList items={users} icon={UserCheck} searchKey="name" subtitleKey="email" endpoint="/settings/user-role" 
                    fields={userFields} renderExtra={(user) => <SmartBadge label={user.role_name ?? t('Sin Rol')} variant="secondary" />} />
                )}
            </div>
        </>
    );
}
RolesManager.layout = { breadcrumbs: [{ title: 'Roles Settings', href: '/settings/role' }] };