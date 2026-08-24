<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class NavigationController extends Controller
{
    private function getItems(): array
    {
        if (!Schema::hasTable('navigation')) {
            return [];
        }

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

        $parents = $all->filter(fn ($item) => empty($item->parent) || (int) $item->parent === 0);

        return $parents->map(function ($parent) use ($all) {
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

    public function edit(): Response
    {
        return Inertia::render('settings/navigation', [
            'mainNavItems' => $this->getItems(),
        ]);
    }
}