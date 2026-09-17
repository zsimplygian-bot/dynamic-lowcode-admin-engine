<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Spatie\Permission\Models\Permission;
class UserPermissionController extends Controller
{
    use HasNotify;
    public function store(Request $request): RedirectResponse { return $this->persist($request); }
    public function update(Request $request, string $userId): RedirectResponse { return $this->persist($request, $userId); }
    public function destroy(string $userId): RedirectResponse
    {
        $user = User::findOrFail($userId);
        $user->syncPermissions([]);
        return $this->notify("Direct permissions revoked from {$user->name} successfully.");
    }
    private function persist(Request $request, ?string $userId = null): RedirectResponse
    {
        $targetUserId = $userId ?? $request->input('id');
        $v = $request->validate(['permission' => ['required']]);
        $user = User::find($targetUserId);
        if (!$user) return $this->notify(['error' => 'User not found.']);
        $permission = is_numeric($v['permission']) ? Permission::findById((int) $v['permission']) : Permission::where('name', $v['permission'])->first();
        $user->givePermissionTo($permission);
        return $this->notify("Permission assigned directly to {$user->name} successfully.");
    }
}