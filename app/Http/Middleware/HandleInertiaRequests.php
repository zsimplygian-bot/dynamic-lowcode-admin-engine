<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, DB, Storage};
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

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
            'locale'       => $locale,
            'translations' => file_exists($langFile) 
                ? json_decode(file_get_contents($langFile), true) 
                : [],
            'mainNavItems'   => $this->getNavigation(),
            'headerNavItems' => [],
            'name'           => $app['app_name'],
            'logoUrl'        => $app['app_icon'] ?? null,
            'logoThumbUrl'   => $app['app_icon_thumb'] ?? null,
            'appSettings'    => $app,
            'flash'          => array_merge($request->session()->get('flash', []), [
                'toast' => fn () => $request->session()->get('toast'),
                'id'    => fn () => $request->session()->get('id'),
            ], array_filter($request->session()->all(), fn ($key) => str_starts_with($key, 'id_'), ARRAY_FILTER_USE_KEY)),
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
        return Cache::remember('inertia_main_nav_items', 3600, function () {
            $fallback = [['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid']];
            try {
                $all = DB::table('navigation')
                    ->select('id_navigation as id', 'navigation as title', 'path as href', 'emoji_navigation as icon', 'parent')
                    ->orderBy('order_index', 'asc')
                    ->get();

                if ($all->isEmpty()) {
                    return $fallback;
                }

                $grouped = $all->groupBy(fn ($item) => (int) ($item->parent ?? 0));

                return $grouped->get(0, collect())->map(function ($p) use ($grouped) {
                    $children = $grouped->get((int) $p->id, collect())->map(fn ($c) => [
                        'id' => $c->id, 'title' => $c->title, 'href' => $c->href, 'icon' => $c->icon ?? 'LayoutGrid'
                    ])->values()->all();

                    return ['id' => $p->id, 'title' => $p->title, 'href' => $p->href, 'icon' => $p->icon ?? 'LayoutGrid', 'items' => $children ?: null];
                })->values()->all();
            } catch (\Throwable $e) {
                return $fallback;
            }
        });
    }

    protected function getAppearance(): array
    {
        return Cache::remember('inertia_appearance_settings', 3600, function () {
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