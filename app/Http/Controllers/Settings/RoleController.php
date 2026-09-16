<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Inertia\{Inertia, Response};
use Spatie\Permission\Models\Role;
class RoleController extends Controller
{
    use HasNotify;
    public function index(): Response
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
            'id_rol'   => $u->roles->first()?->id ?? '',
            'role_name' => $u->roles->first()?->name ?? 'Sin Rol',
        ]);
        return Inertia::render('settings/role', compact('roles', 'users'));
    }
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $id): RedirectResponse { return $this->persist($request, $id); }
    public function destroy(string $id): RedirectResponse
    {
        $role = Role::where('name', $id)->firstOrFail();
        if ($role->name === 'admin') return $this->notify(['error' => 'The admin role cannot be deleted.']);
        $role->delete();
        return $this->notify('Role deleted successfully.');
    }
    private function persist(Request $request, ?string $id = null): RedirectResponse
    {
        $role = $id ? Role::where('name', $id)->firstOrFail() : new Role();
        if ($role->name === 'admin') return $this->notify(['error' => 'The admin role cannot be edited.']);
        $v = $request->validate(['name' => ['required', 'string', 'max:50', 'unique:roles,name' . ($role->exists ? ",{$role->id}" : '')]]);
        $role->fill(['name' => strtolower(trim($v['name']))])->save();
        return $this->notify('Role ' . ($role->wasRecentlyCreated ? 'created' : 'updated') . ' successfully.');
    }
}