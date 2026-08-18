<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
        // Navegación por defecto
        $navigation = [
            'mainNavItems' => [
                ['title' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutGrid'],
            ],
            'headerNavItems' => [],
        ];

        // Leer del archivo JSON si existe
        if (Storage::exists('settings/navigation.json')) {
            $content = Storage::get('settings/navigation.json');
            $json = json_decode($content, true);

            if (is_array($json)) {
                $navigation['mainNavItems'] = $json['mainNavItems'] ?? $navigation['mainNavItems'];
                $navigation['headerNavItems'] = $json['headerNavItems'] ?? [];
            }
        }

        // Cargar apariencia
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
            'mainNavItems'   => $navigation['mainNavItems'],
            'headerNavItems' => $navigation['headerNavItems'],
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