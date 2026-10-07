<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasDynamicFileUpload;
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Storage};
use Inertia\Inertia;
class AppearanceController extends Controller
{
    use HasDynamicFileUpload, HasNotify;
    private string $jsonPath = 'settings/appearance.json';
    private function getSettings(): array
    {
        $disk = Storage::disk('local');
        if ($disk->exists($this->jsonPath)) {
            $data = json_decode($disk->get($this->jsonPath), true);
            if (is_array($data)) return $data;
        }
        return ['app_name' => config('app.name'), 'app_icon' => null];
    }
    public function index() { return Inertia::render('settings/appearance', ['appSettings' => $this->getSettings()]); }
    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:255'],
            'app_icon' => ['nullable', 'file', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'],
        ]);
        $settings = $this->getSettings();
        $data = $this->handleFilesUpload($request, 'icons', $validated, $settings);
        Storage::disk('local')->put($this->jsonPath, json_encode(array_merge($settings, $data), JSON_PRETTY_PRINT));
        Cache::forget('inertia_appearance_settings');
        return $this->notify('Appearance settings updated.');
    }
}