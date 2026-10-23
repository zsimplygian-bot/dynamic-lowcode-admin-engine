import { Head } from '@inertiajs/react'
import Heading from '@/components/heading'
import { SmartBadge } from '@/components/smart-badge'
import { SimpleList } from '@/components/simple-list'
import { Tabs } from '@/components/ui/tabs'
export default function PermissionsManager({ permissions = [], roles = [], users = [] }: { permissions?: any[]; roles?: any[]; users?: any[] }) {
  
  const permissionFields = [{ name: 'name', label: t('PERMISSION NAME'), placeholder: t('e.g. edit articles'), required: true }]
  const rolePermissionFields = [ { name: 'id', label: t('ROLE'), type: 'select', required: true }, { name: 'permission', label: t('PERMISSION'), type: 'select', required: true } ]
  const userPermissionFields = [ { name: 'id', label: t('USER'), type: 'select', required: true }, { name: 'permission', label: t('PERMISSION'), type: 'select', required: true } ]
  return (
    <><Head title={t('Permissions Management')} />
      <div className="space-y-2">
        <Heading variant="small" title={t('Permissions & Access')} description={t('Manage global permissions and assign them directly to roles or users.')} />
        <Tabs tabs={[
          { id: 'permissions', label: t('Permissions'), icon: 'key-round' },
          { id: 'role-permissions', label: t('Role Permissions'), icon: 'shield' },
          { id: 'user-permissions', label: t('User Direct Permissions'), icon: 'users' }
        ]}>
          {(sec) => sec === 'permissions' ? (
            <SimpleList items={permissions} icon="lock" searchKey="name" endpoint="/settings/permission" fields={permissionFields} 
            renderExtra={(perm) => perm.roles_count !== undefined && <SmartBadge icon="shield" label={`${perm.roles_count} ${t('roles')}`} variant="secondary" />} />
          ) : sec === 'role-permissions' ? (
            <SimpleList items={roles} icon="shield" searchKey="name" endpoint="/settings/role-permission" fields={rolePermissionFields} 
            renderExtra={(role) => <SmartBadge label={`${role.permissions_count ?? 0} ${t('permissions')}`} variant="secondary" />} />
          ) : (
            <SimpleList items={users} icon="check-square" searchKey="name" subtitleKey="email" endpoint="/settings/user-permission" fields={userPermissionFields} 
            renderExtra={(user) => <SmartBadge label={`${user.permissions_count ?? 0} ${t('direct permissions')}`} variant="secondary" />} />
          )}
        </Tabs>
      </div>
    </>
  )
}
PermissionsManager.layout = { breadcrumbs: [{ title: 'Permission Settings', href: '/settings/permission' }] }