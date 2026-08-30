<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasDynamicFileUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    use HasDynamicFileUpload;

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

        // 1. Eliminación explícita mediante _remove_app_icon
        if ($request->boolean('_remove_app_icon')) {
            if (!empty($currentSettings['app_icon_url'])) {
                $this->deleteFileAndThumb($currentSettings['app_icon_url']);
            }
            $currentSettings['app_icon_url']       = null;
            $currentSettings['app_icon_thumb_url'] = null;
        }

        // 2. Procesamiento de la nueva imagen
        if ($request->hasFile('app_icon') && $request->file('app_icon')->isValid()) {
            if (!empty($currentSettings['app_icon_url'])) {
                $this->deleteFileAndThumb($currentSettings['app_icon_url']);
            }

            $storedPath = $this->processAndStoreFile($request->file('app_icon'), 'icons');

            // Formatear rutas para la imagen completa y el thumbnail
            $basePath  = preg_replace('/(?:_thumb)+(\.[a-zA-Z0-9]+)$/i', '$1', $storedPath);
            $thumbPath = preg_replace('/(\.[a-zA-Z0-9]+)$/i', '_thumb$1', $basePath);

            $currentSettings['app_icon_url']       = Storage::url($basePath);
            $currentSettings['app_icon_thumb_url'] = Storage::url($thumbPath);
        }

        $currentSettings['app_name'] = $validated['app_name'];

        // Guardar configuración en archivo JSON
        Storage::disk('local')->put($this->jsonPath, json_encode($currentSettings, JSON_PRETTY_PRINT));

        // Invalidar la caché compartida de Inertia
        Cache::forget('inertia_appearance_settings');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appearance settings updated.')]);

        return to_route('appearance.edit');
    }
}