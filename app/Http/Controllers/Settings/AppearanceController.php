<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasImageProcessing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    use HasImageProcessing;

    private string $jsonPath = 'settings/appearance.json';

    private function getSettings(): array
    {
        $disk = Storage::disk('local');
        if ($disk->exists($this->jsonPath)) {
            $data = json_decode($disk->get($this->jsonPath), true);
            return is_array($data) ? $data : [];
        }

        return [
            'app_name'           => config('app.name'),
            'app_icon_url'       => null,
            'app_icon_thumb_url' => null,
        ];
    }

    public function edit(): Response
    {
        return Inertia::render('settings/appearance', [
            'appSettings' => $this->getSettings(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:255'],
            'app_icon' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
        ]);

        $currentSettings = $this->getSettings();

        if ($request->hasFile('app_icon') && $request->file('app_icon')->isValid()) {
            // Limpiar archivos anteriores si existen
            if (!empty($currentSettings['app_icon_url'])) {
                // Extraer la ruta relativa relativa al disco público (ej. "icons/1786817281_VvBx2.jpg")
                $relativeBasePath = preg_replace('/^\/?storage\//', '', parse_url($currentSettings['app_icon_url'], PHP_URL_PATH));
                $relativeThumbPath = preg_replace('/(\.[a-zA-Z0-9]+)$/i', '_thumb$1', $relativeBasePath);

                Storage::disk('public')->delete([$relativeBasePath, $relativeThumbPath]);
            }

            $storedPath = $this->processAndStoreFile($request->file('app_icon'), 'icons');

            // Obtener rutas base y thumb limpias
            $basePath = preg_replace('/(?:_thumb)+(\.[a-zA-Z0-9]+)$/i', '$1', $storedPath);
            $thumbPath = preg_replace('/(\.[a-zA-Z0-9]+)$/i', '_thumb$1', $basePath);

            $currentSettings['app_icon_url'] = Storage::url($basePath);
            $currentSettings['app_icon_thumb_url'] = Storage::url($thumbPath);
        }

        $currentSettings['app_name'] = $validated['app_name'];

        Storage::disk('local')->put($this->jsonPath, json_encode($currentSettings, JSON_PRETTY_PRINT));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appearance settings updated.')]);

        return to_route('appearance.edit');
    }
}