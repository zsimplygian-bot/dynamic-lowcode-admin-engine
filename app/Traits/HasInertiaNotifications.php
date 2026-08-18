<?php
namespace App\Traits;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
trait HasInertiaNotifications
{
    protected function notifyAndRedirect(string $message, string $type = 'success', ?string $route = null): RedirectResponse
    {
        Inertia::flash('toast', [ 'type' => $type, 'message' => __($message) ]);
        return $route ? redirect()->route($route) : back();
    }
}