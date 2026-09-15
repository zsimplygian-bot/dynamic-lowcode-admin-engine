<?php
namespace App\Http\Controllers\Settings;

use App\Actions\Settings\RoleAction;
use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\{RedirectResponse, Request};
use Inertia\{Inertia, Response};

class RoleController extends Controller
{
    use HasNotify;

    public function index(RoleAction $action): Response { return Inertia::render('settings/role', $action->getIndexData()); }

    public function store(Request $request, RoleAction $action): RedirectResponse { return $this->notify($action->persist($request)); }

    public function update(Request $request, string $id, RoleAction $action): RedirectResponse { return $this->notify($action->persist($request, $id)); }

    public function destroy(string $id, RoleAction $action): RedirectResponse { return $this->notify($action->destroy($id)); }
}