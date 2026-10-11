<?php
namespace App\Traits;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
trait HasNotify
{
    protected function notify(string $message, string $type = 'success', ?string $field = null, array $data = [])
    {
        if ($field) { throw ValidationException::withMessages([$field => __($message)]); }
        Inertia::flash('toast', ['type' => $type, 'message' => __($message), ...$data]);
        return back();
    }
}