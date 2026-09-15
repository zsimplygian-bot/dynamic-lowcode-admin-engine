<?php
namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserRoleAction
{
    public function persist(Request $request, ?string $userId = null): string|array
    {
        $targetUserId = $userId ?? $request->input('user_id') ?? $request->input('id');

        if (!$targetUserId) {
            return ['error' => 'Please select a valid user.', 'field' => 'user_id'];
        }

        $v = $request->validate([
            'role_id' => ['required'],
        ]);

        $user = User::find($targetUserId);
        if (!$user) return ['error' => 'User not found.'];

        $roleParam = $v['role_id'];
        $role = is_numeric($roleParam) 
            ? Role::findById((int) $roleParam) 
            : Role::where('name', $roleParam)->first();

        if (!$role) return ['error' => 'The selected role does not exist.', 'field' => 'role_id'];

        $user->syncRoles([$role->name]);

        return "Role assigned to {$user->name} successfully.";
    }

    public function destroy(string $userId): string|array
    {
        $user = User::findOrFail($userId);
        $user->syncRoles([]);

        return "Roles removed from {$user->name} successfully.";
    }
}