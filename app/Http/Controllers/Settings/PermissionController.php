<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Inertia\{Inertia, Response};
use Spatie\Permission\Models\{Permission, Role};
class PermissionController extends Controller
{
    use HasNotify;
    public function index(): Response
    {
        $permissions = Permission::withCount('roles')->get()->map(fn ($p) => [
            'id'          => $p->name,
            'name'        => $p->name,
            'roles_count' => $p->roles_count,
        ]);
        $roles = Role::with('permissions')->get()->map(fn ($r) => [
            'id'                => $r->id,
            'name'              => $r->name,
            'permissions_count' => $r->permissions->count(),
        ]);
        $users = User::with('permissions')->get()->map(fn ($u) => [
            'id'                => $u->id,
            'name'              => $u->name,
            'email'             => $u->email,
            'permissions_count' => $u->permissions->count(),
        ]);
        return Inertia::render('settings/permission', compact('permissions', 'roles', 'users'));
    }
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $id): RedirectResponse { return $this->persist($request, $id); }
    public function destroy(string $id): RedirectResponse
    {
        $permission = Permission::where('name', $id)->firstOrFail();
        $permission->delete();
        return $this->notify('Permission deleted successfully.');
    }
    private function persist(Request $request, ?string $id = null): RedirectResponse
    {
        $permission = $id ? Permission::where('name', $id)->firstOrFail() : new Permission();
        $v = $request->validate(['name' => ['required', 'string', 'max:50', 'unique:permissions,name' . ($permission->exists ? ",{$permission->id}" : '')]]);
        $permission->fill(['name' => strtolower(trim($v['name']))])->save();
        return $this->notify('Permission ' . ($permission->wasRecentlyCreated ? 'created' : 'updated') . ' successfully.');
    }
}