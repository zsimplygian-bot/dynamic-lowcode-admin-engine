<?php
namespace App\Http\Middleware;
use App\Http\Controllers\Settings\AppearanceController;
use Illuminate\Http\Request;
use Inertia\Middleware;
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    public function share(Request $request): array
    {
        app()->setLocale($locale = session('locale', app()->getLocale()));
        $file = lang_path("{$locale}.json");
        $user = $request->user();
        return [
            ...parent::share($request),
            'locale' => $locale,
            'translations' => is_file($file) ? json_decode(file_get_contents($file), true) : [],
            'appSettings' => AppearanceController::getSharedSettings(),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ], 'sidebarOpen' => $request->cookie('sidebar_state', 'true') === 'true',
        ];
    }
}