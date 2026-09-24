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

        {{-- Script bloqueante síncrono: Aplica la clase dark y variables CSS antes de pintar la pantalla --}}
        <script>
            (function() {
                const root = document.documentElement;
                try {
                    const savedTheme = localStorage.getItem("theme");
                    const isDark = savedTheme 
                        ? savedTheme === "dark" 
                        : window.matchMedia("(prefers-color-scheme: dark)").matches;

                    if (isDark) {
                        root.classList.add("dark");
                        root.style.colorScheme = "dark";
                    } else {
                        root.classList.remove("dark");
                        root.style.colorScheme = "light";
                    }

                    const savedVars = localStorage.getItem("app_custom_css_vars_v2");
                    if (savedVars) {
                        const styles = JSON.parse(savedVars);
                        const mode = isDark ? "dark" : "light";
                        const active = styles[mode] || {};
                        for (const key in active) {
                            if (active[key]) root.style.setProperty(key, active[key]);
                        }
                    }
                } catch (e) {}
            })();
        </script>

        <style>
            html {
                background-color: var(--background, #ffffff);
            }
            html.dark {
                background-color: var(--background, #09090b);
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