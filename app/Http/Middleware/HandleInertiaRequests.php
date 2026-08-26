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
        $app = $this->getAppearance();
        return [
            ...parent::share($request),
            'mainNavItems'   => $this->getNavigation(),
            'headerNavItems' => [],
            'name'           => $app['app_name'],
            'logoUrl'        => $app['app_icon_url'] ?? null,
            'logoThumbUrl'   => $app['app_icon_thumb_url'] ?? null,
            'appSettings'    => $app,
            'auth'           => ['user' => $request->user()],
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
                if ($all->isEmpty()) 
                    return $fallback;
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
            $default = ['app_name' => config('app.name'), 'app_icon_url' => null, 'app_icon_thumb_url' => null];
            if (Storage::exists('settings/appearance.json')) {
                $json = json_decode(Storage::get('settings/appearance.json'), true);
                return is_array($json) ? array_merge($default, $json) : $default;
            }
            return $default;
        });
    }
}