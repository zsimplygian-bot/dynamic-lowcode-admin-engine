<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HasNotify;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use HasNotify;

    public function index(): Response
    {
        $roles = Role::withCount('users')->get()->map(fn ($role) => [
            'id'          => $role->id,
            'name'        => $role->name,
            'users_count' => $role->users_count,
        ]);

        $users = User::with('roles')->get()->map(fn ($user) => [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role_id'   => $user->roles->first()?->id ?? '',
            'role_name' => $user->roles->first()?->name ?? 'Sin Rol',
        ]);

        $roleOptions = Role::all()->map(fn ($r) => ['value' => $r->id, 'label' => ucfirst($r->name)])->toArray();

        return Inertia::render('settings/role', compact('roles', 'users', 'roleOptions'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name'],
        ]);

        Role::create(['name' => strtolower(trim($validated['name']))]);

        return $this->notify('Role created successfully.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:roles,name,' . $id],
        ]);

        $role->update(['name' => strtolower(trim($validated['name']))]);

        return $this->notify('Role updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $role = Role::findOrFail($id);
        
        if ($role->name === 'admin') {
            return $this->notify('The admin role cannot be deleted.', 'error');
        }

        $role->delete();

        return $this->notify('Role deleted successfully.');
    }

    public function assignRole(Request $request, string $userId): RedirectResponse
    {
        $validated = $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        $user = User::findOrFail($userId);
        $role = Role::findOrFail($validated['role_id']);

        $user->syncRoles([$role->name]);

        return $this->notify("Role assigned to {$user->name} successfully.");
    }
}