<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasInertiaNotifications;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;
class CacheController extends Controller
{
    use HasInertiaNotifications;
    public function edit(): Response
    {
        return Inertia::render('settings/cache');
    }
    public function destroy(Request $request): RedirectResponse
    {
        // Limpia toda la caché de Laravel: config, rutas, vistas, eventos y app cache
        Artisan::call('optimize:clear');
        return $this->notifyAndRedirect('Global system cache cleared successfully.');
    }
}