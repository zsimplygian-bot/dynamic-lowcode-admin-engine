@php
    use Illuminate\Support\Facades\Storage;

    $appearanceConfig = [
        'app_name'           => config('app.name', 'Laravel'),
        'app_icon_url'       => null,
        'app_icon_thumb_url' => null,
    ];

    $diskLocal = Storage::disk('local');
    if ($diskLocal->exists('settings/appearance.json')) {
        $jsonContent = json_decode($diskLocal->get('settings/appearance.json'), true);
        if (is_array($jsonContent)) {
            $appearanceConfig = array_merge($appearanceConfig, $jsonContent);
        }
    }

    $iconUrl = $appearanceConfig['app_icon_thumb_url'] ?? $appearanceConfig['app_icon_url'] ?? '/favicon.ico';

    $type = str_contains($iconUrl, '.png') ? 'image/png' 
          : (str_contains($iconUrl, '.jpg') || str_contains($iconUrl, '.jpeg') ? 'image/jpeg' 
          : (str_contains($iconUrl, '.svg') ? 'image/svg+xml' : 'image/x-icon'));

    $faviconUrl = $iconUrl !== '/favicon.ico' ? $iconUrl . '?v=' . substr(md5($iconUrl), 0, 8) : $iconUrl;
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Favicon dinámico optimizado con MIME type y Cache Busting --}}
        <link id="dynamic-favicon" rel="icon" type="{{ $type }}" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" href="{{ $faviconUrl }}">

        {{-- Forzar la actualización del favicon en el renderizado inicial --}}
        <script>
            (function() {
                const link = document.getElementById('dynamic-favicon');
                if (link) {
                    const href = link.href;
                    link.href = '';
                    link.href = href;
                }
            })();
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $appearanceConfig['app_name'] }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>