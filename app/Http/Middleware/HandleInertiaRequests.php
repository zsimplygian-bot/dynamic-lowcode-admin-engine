<?php
namespace App\Http\Middleware;
use App\Traits\HasTableMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Storage};
use Illuminate\Support\Str;
use Inertia\Middleware;
class HandleInertiaRequests extends Middleware
{
    use HasTableMetadata;
    protected $rootView = 'app';
    public function version(Request $request): ?string { return parent::version($request); }
    public function share(Request $request): array
    {
        if (session()->has('locale')) {
            app()->setLocale(session('locale'));
        }
        $locale = app()->getLocale();
        $langFile = lang_path("{$locale}.json");
        $app = $this->getAppearance();
        $user = $request->user();
        return [
            ...parent::share($request),
            'locale'         => $locale,
            'translations'   => file_exists($langFile) 
                ? json_decode(file_get_contents($langFile), true) 
                : [],
            'mainNavItems'   => $this->getNavigation(),
            'headerNavItems' => [],
            'name'           => $app['app_name'],
            'logoUrl'        => $app['app_icon'] ?? null,
            'logoThumbUrl'   => $app['app_icon_thumb'] ?? null,
            'appSettings'    => $app,
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'avatar'       => $user->avatar,
                    'avatar_thumb' => $user->avatar_thumb,
                    'roles'        => $user->getRoleNames(),
                    'permissions'  => $user->getAllPermissions()->pluck('name'),
                ]) : null,
            ],
            'sidebarOpen'    => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
    protected function getNavigation(): array
    {
        return Cache::rememberForever('inertia_main_nav_items', function () {
            try {
                $tables = collect($this->getTableMetadata())->keyBy('name');
                $makeItem = function (string $tableName) use ($tables) {
                    $meta = $tables->get($tableName);
                    $rawTitle = $meta['label'] ?? $meta['title'] ?? $tableName;
                    $formattedTitle = Str::ucfirst($rawTitle);
                    return [
                        'title' => $formattedTitle,
                        'href'  => "/table/{$tableName}",
                        'icon'  => $meta['icon'] ?? 'table',
                    ];
                };
                $itemSubKeys = ['procedimiento', 'producto', 'categoria_procedimiento', 'categoria_producto', 'raza', 'motivo'];
                $itemSubItems = collect($itemSubKeys)->map(fn ($key) => $makeItem($key))->values()->all();
                return [
                    ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'layout-grid'],
                    $makeItem('historia'),
                    $makeItem('cita'),
                    $makeItem('mascota'),
                    $makeItem('cliente'),
                    [
                        'title' => 'Items',
                        'icon'  => 'folder-tree',
                        'items' => $itemSubItems,
                    ],
                ];
            } catch (\Throwable $e) {
                return [['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'layout-grid']];
            }
        });
    }
    protected function getAppearance(): array
    {
        return Cache::rememberForever('inertia_appearance_settings', function () {
            $default = ['app_name' => config('app.name'), 'app_icon' => null, 'app_icon_thumb' => null];
            if (Storage::disk('local')->exists('settings/appearance.json')) {
                $json = json_decode(Storage::disk('local')->get('settings/appearance.json'), true);
                if (is_array($json)) {
                    $settings = array_merge($default, $json);
                
                    if (!empty($settings['app_icon'])) {
                        $settings['app_icon_thumb'] = preg_replace('/\.([^.]+)$/', '_thumb.$1', $settings['app_icon']);
                    }
                    return $settings;
                }
            }
            return $default;
        });
    }
}