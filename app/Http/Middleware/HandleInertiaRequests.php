<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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
        $mainNavItems = [
            ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
        ];

        if (Schema::hasTable('navigation')) {
            $all = DB::table('navigation')
                ->select(
                    'id_navigation as id',
                    'navigation as title',
                    'path as href',
                    'emoji_navigation as icon',
                    'parent',
                    'order_index'
                )
                ->orderBy('order_index', 'asc')
                ->get();

            if ($all->isNotEmpty()) {
                $parents = $all->filter(fn ($item) => empty($item->parent) || (int) $item->parent === 0);

                $mainNavItems = $parents->map(function ($parent) use ($all) {
                    $children = $all->filter(fn ($child) => (int) $child->parent === (int) $parent->id)
                        ->map(fn ($child) => [
                            'id'    => $child->id,
                            'title' => $child->title,
                            'href'  => $child->href,
                            'icon'  => $child->icon ?? 'LayoutGrid',
                        ])
                        ->values()
                        ->toArray();

                    return [
                        'id'    => $parent->id,
                        'title' => $parent->title,
                        'href'  => $parent->href,
                        'icon'  => $parent->icon ?? 'LayoutGrid',
                        'items' => !empty($children) ? $children : null,
                    ];
                })->values()->toArray();
            }
        }

        $appearance = [
            'app_name'           => config('app.name'),
            'app_icon_url'       => null,
            'app_icon_thumb_url' => null,
        ];

        if (Storage::exists('settings/appearance.json')) {
            $json = json_decode(Storage::get('settings/appearance.json'), true);
            if (is_array($json)) {
                $appearance = array_merge($appearance, $json);
            }
        }

        return [
            ...parent::share($request),
            'mainNavItems'   => $mainNavItems,
            'headerNavItems' => [],
            'name'           => $appearance['app_name'],
            'logoUrl'        => $appearance['app_icon_url'] ?? null,
            'logoThumbUrl'   => $appearance['app_icon_thumb_url'] ?? null,
            'appSettings'    => $appearance,
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen'    => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}