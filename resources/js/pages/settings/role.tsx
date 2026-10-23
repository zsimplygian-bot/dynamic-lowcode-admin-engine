import { Head } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SmartBadge } from '@/components/smart-badge'
import { SimpleList } from '@/components/simple-list'
import { Tabs } from '@/components/ui/tabs'
export default function RolesManager({ roles = [], users = [] }: { roles?: any[]; users?: any[] }) {
  
  const roleFields = [{ name: 'name', label: t('ROLE NAME'), placeholder: t('e.g. editor'), required: true }]
  const userFields = [ { name: 'id', label: t('USER'), type: 'select', required: true }, { name: 'id_rol', label: t('ROLE'), type: 'select', required: true } ]
  return (
    <><Head title={t('Roles & Permissions')} />
      <div className="space-y-2">
        <Heading variant="small" title={t('Roles & Access')} description={t('Manage global roles and assign access levels to system users.')} />
        <Tabs tabs={[{ id: 'roles', label: t('Roles'), icon: 'shield' }, { id: 'users', label: t('User Assignments'), icon: 'users' }]}>
          {(sec) => sec === 'roles' ? (
            <SimpleList items={roles} icon="lock" searchKey="name" endpoint="/settings/role" fields={roleFields} 
            renderExtra={(role) => role.users_count !== undefined && <SmartBadge icon="users" label={`${role.users_count} ${t('users')}`} variant="secondary" />} />
          ) : (
            <SimpleList items={users} icon="user-check" searchKey="name" subtitleKey="email" endpoint="/settings/user-role" fields={userFields} 
            renderExtra={(user) => <SmartBadge label={user.role_name ?? t('Sin Rol')} variant="secondary" />} />
          )}
        </Tabs>
      </div>
    </>
  )
}
RolesManager.layout = { breadcrumbs: [{ title: 'Roles Settings', href: '/settings/role' }] }