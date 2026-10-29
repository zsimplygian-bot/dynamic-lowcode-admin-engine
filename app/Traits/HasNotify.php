<?php

namespace App\Traits;

use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

trait HasNotify
{
    /**
     * Notificación Flash con soporte para validación, sesión y acciones interactivas.
     * 
     * Ejemplos de uso:
     * - $this->notify('Guardado exitosamente');
     * - $this->notify('Error en el campo', 'error', 'email');
     * - $this->notify('Eliminado', 'success', ['action' => ['label' => 'Deshacer', ...]]);
     */
    protected function notify(string $message, string $type = 'success', string|array|null $field = null, array $data = [])
    {
        // Si el tercer argumento es un array, se interpreta como $data directamente
        if (is_array($field)) {
            $data = $field;
            $field = null;
        }

        if ($field) {
            throw ValidationException::withMessages([$field => __($message)]);
        }

        if (isset($data['id'])) {
            session()->flash('id', $data['id']);
        }

        Inertia::flash('toast', [
            'type'    => $type,
            'message' => __($message),
            ...$data,
        ]);

        return back();
    }
}