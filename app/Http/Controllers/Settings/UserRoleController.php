<?php
namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    use HasNotify;
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $userId): RedirectResponse { return $this->persist($request, $userId); }

    public function destroy(string $userId): RedirectResponse
    {
        $user = User::findOrFail($userId);
        $user->syncRoles([]);
        return $this->notify("Roles removed from {$user->name} successfully.");
    }

    private function persist(Request $request, ?string $userId = null): RedirectResponse
    {
        $targetUserId = $userId ?? $request->input('users_id') ?? $request->input('id_user') ?? $request->input('id');
        $roleParam = $request->input('roles_id') ?? $request->input('id_rol') ?? $request->input('role');
        if (!$roleParam) return $this->notify(['error' => 'Role is required.']);
        $user = User::find($targetUserId);
        if (!$user) return $this->notify(['error' => 'User not found.']);
        $role = is_numeric($roleParam) ? Role::findById((int) $roleParam) : Role::where('name', $roleParam)->first();
        if (!$role) return $this->notify(['error' => 'Role not found.']);
        $user->syncRoles([$role->name]);
        return $this->notify("Role assigned to {$user->name} successfully.");
    }
}