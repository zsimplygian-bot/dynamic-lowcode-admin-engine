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
    private static string $jsonPath = 'settings/appearance.json';
    public static function getSharedSettings(): array
    {
        return Cache::rememberForever('inertia_appearance_settings', function () {
            $disk = Storage::disk('local');
            $data = $disk->exists(self::$jsonPath) ? json_decode($disk->get(self::$jsonPath), true) : [];
            return [ 'app_name' => $data['app_name'] ?? config('app.name'), 'app_icon' => $data['app_icon'] ?? null, ]; });
    }
    public function index() { return Inertia::render('settings/appearance'); }
    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:255'],
            'app_icon' => $request->hasFile('app_icon') ? ['file', 'mimes:png,jpg,jpeg,svg,webp', 'max:2048'] : ['nullable', 'string'], ]);
        $settings = self::getSharedSettings();
        $data = $this->handleFilesUpload($request, 'icons', $validated, $settings);
        Storage::disk('local')->put( self::$jsonPath, json_encode([...$settings, ...$data], JSON_PRETTY_PRINT) );
        Cache::forget('inertia_appearance_settings');
        return $this->notify('Appearance settings updated.');
    }
}