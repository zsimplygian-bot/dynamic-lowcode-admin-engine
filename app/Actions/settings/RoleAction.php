<?php
namespace App\Actions\Settings;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
class RoleAction
{
    public function getIndexData(): array
    {
        $roles = Role::withCount('users')->get()->map(fn ($r) => [
            'id'          => $r->name,
            'name'        => $r->name,
            'users_count' => $r->users_count,
        ]);
        $users = User::with('roles')->get()->map(fn ($u) => [
            'id'        => $u->id,
            'name'      => $u->name,
            'email'     => $u->email,
            'role_id'   => $u->roles->first()?->id ?? '',
            'role_name' => $u->roles->first()?->name ?? 'Sin Rol',
        ]);
        return compact('roles', 'users');
    }
    public function persist(Request $request, ?string $id = null): string|array
    {
        $role = $id ? Role::where('name', $id)->firstOrFail() : new Role();
        if ($role->name === 'admin') return ['error' => 'The admin role cannot be edited.'];
        $v = $request->validate(['name' => ['required', 'string', 'max:50', 'unique:roles,name' . ($role->exists ? ",{$role->id}" : '')]]);
        $role->fill(['name' => strtolower(trim($v['name']))])->save();
        return 'Role ' . ($role->wasRecentlyCreated ? 'created' : 'updated') . ' successfully.';
    }
    public function destroy(string $id): string|array
    {
        $role = Role::where('name', $id)->firstOrFail();
        if ($role->name === 'admin') return ['error' => 'The admin role cannot be deleted.'];
        $role->delete();
        return 'Role deleted successfully.';
    }
}