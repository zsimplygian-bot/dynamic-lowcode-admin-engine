<?php
namespace App\Http\Middleware;

use App\Http\Controllers\Settings\AppearanceController;
use App\Traits\HasTableMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    use HasTableMetadata;

    protected $rootView = 'app';

    public function share(Request $request): array
    {
        if (session('locale')) app()->setLocale(session('locale'));

        $locale = app()->getLocale();
        $langFile = lang_path("{$locale}.json");
        $app = AppearanceController::getSharedSettings();
        $user = $request->user();

        return [
            ...parent::share($request),
            'locale'       => $locale,
            'translations' => file_exists($langFile) ? json_decode(file_get_contents($langFile), true) : [],
            'mainNavItems' => $this->getNavigation(),
            'headerNavItems' => [],
            'name'         => $app['app_name'],
            'logoUrl'      => $app['app_icon'] ?? null,
            'appSettings'  => $app,
            'flash'        => ['toast' => session('toast')],
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'avatar'       => $user->avatar,
                    'avatar_thumb' => $user->avatar_thumb,
                    'roles'        => $user->getRoleNames(),
                    'permissions'  => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'sidebarOpen' => $request->cookie('sidebar_state', 'true') === 'true',
        ];
    }

    protected function getNavigation(): array
    {
        return Cache::rememberForever('inertia_main_nav_items', function () {
            $tables = collect($this->getTableMetadata())->keyBy('name');
            $makeItem = fn (string $name) => [
                'title' => Str::ucfirst($tables[$name]['label'] ?? $tables[$name]['title'] ?? $name),
                'href'  => "/table/{$name}",
                'icon'  => $tables[$name]['icon'] ?? 'table',
            ];

            return [
                ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'layout-grid'],
                $makeItem('historia'),
                $makeItem('cita'),
                $makeItem('mascota'),
                $makeItem('cliente'),
                [
                    'title' => 'Items',
                    'icon'  => 'folder-tree',
                    'items' => array_map($makeItem, ['procedimiento', 'producto', 'categoria_procedimiento', 'categoria_producto', 'raza', 'especie', 'motivo']),
                ],
            ];
        });
    }
}