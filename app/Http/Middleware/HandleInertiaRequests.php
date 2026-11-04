<?php
namespace App\Http\Middleware;
use App\Http\Controllers\Settings\AppearanceController;
use App\Services\TableMetadata;
use Illuminate\Http\Request;
use Inertia\Middleware;
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    public function share(Request $request): array
    {
        $user = $request->user();
        return [
            ...parent::share($request),
            'appSettings' => AppearanceController::getSharedSettings(),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->getRoleNames()->values()->all(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
                ] : null,
            ],
            'flash' => ['id' => session('id')],
            'sidebarOpen' => $request->cookie('sidebar_state', 'true') === 'true',
            'tables_meta' => fn () => collect(TableMetadata::all())->keyBy('name')->all(),
        ];
    }
}