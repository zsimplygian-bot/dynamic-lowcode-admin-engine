<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Spatie\Permission\Models\{Permission, Role};
class RolePermissionController extends Controller
{
    use HasNotify;
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $roleId): RedirectResponse { return $this->persist($request, $roleId); }
    public function destroy(string $roleId): RedirectResponse
    {
        $role = Role::findOrFail($roleId);
        $role->syncPermissions([]);
        return $this->notify("Permissions revoked from role {$role->name} successfully.");
    }
    private function persist(Request $request, ?string $roleId = null): RedirectResponse
    {
        $targetRoleId = $roleId ?? $request->input('id');
        $v = $request->validate(['permission' => ['required']]);
        $role = Role::find($targetRoleId);
        if (!$role) return $this->notify(['error' => 'Role not found.']);
        $permission = is_numeric($v['permission']) ? Permission::findById((int) $v['permission']) : Permission::where('name', $v['permission'])->first();
        $role->givePermissionTo($permission);
        return $this->notify("Permission assigned to role {$role->name} successfully.");
    }
}