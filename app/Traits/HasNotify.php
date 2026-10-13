<?php
namespace App\Traits;

use Illuminate\Validation\ValidationException;

trait HasNotify
{
    protected function notify(string $message, string $type = 'success', ?string $field = null, array $data = [])
    {
        if ($field) { throw ValidationException::withMessages([$field => __($message)]); }
        session()->flash('toast', ['type' => $type, 'message' => __($message), ...$data]);
        return back();
    }
}