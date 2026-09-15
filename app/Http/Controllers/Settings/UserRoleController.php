<?php
namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UserRoleAction;
use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};

class UserRoleController extends Controller
{
    use HasNotify;

    public function store(Request $request, UserRoleAction $action): RedirectResponse { return $this->notify($action->persist($request)); }

    public function update(Request $request, string $userId, UserRoleAction $action): RedirectResponse { return $this->notify($action->persist($request, $userId)); }

    public function destroy(string $userId, UserRoleAction $action): RedirectResponse { return $this->notify($action->destroy($userId)); }
}