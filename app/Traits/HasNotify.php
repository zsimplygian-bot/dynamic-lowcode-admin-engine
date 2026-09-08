<?php
namespace App\Traits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
trait HasNotify
{
    protected function notify(string $message, string $type = 'success', ?string $field = null): RedirectResponse
    {
        if ($field) {
            throw ValidationException::withMessages([$field => __($message)]);
        }
        Inertia::flash('toast', ['type' => $type, 'message' => __($message)]);
        return back();
    }
}