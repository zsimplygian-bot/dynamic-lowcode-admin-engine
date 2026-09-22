<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $jsonPath = storage_path('app/private/settings/appearance.json');
            $appIcon = null;

            if (file_exists($jsonPath)) {
                $settings = json_decode(file_get_contents($jsonPath), true);
                $appIcon = $settings['app_icon'] ?? null;
            }

            $iconUrl = $appIcon 
                ? asset(ltrim(str_replace('\\', '/', $appIcon), '/')) . '?v=' . filemtime($jsonPath) 
                : asset('favicon.ico');
        @endphp

        <link rel="icon" type="image/png" href="{{ $iconUrl }}">

        {{-- Inline script to apply custom theme CSS vars --}}
        <script>
            (function() {
                const root = document.documentElement;
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                }

                try {
                    const saved = localStorage.getItem("app_custom_css_vars_v2");
                    if (saved) {
                        const styles = JSON.parse(saved);
                        const isDark = root.classList.contains("dark");
                        const mode = isDark ? "dark" : "light";
                        const active = styles[mode] || {};
                        for (const key in active) {
                            if (active[key]) root.style.setProperty(key, active[key]);
                        }
                    }
                } catch (e) {}
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: var(--background, oklch(1 0 0));
            }

            html.dark {
                background-color: var(--background, oklch(0.145 0 0));
            }
        </style>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>