<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'avatar'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * Atributos dinámicos que siempre se adjuntan en toArray() / Inertia.
     */
    protected $appends = [
        'avatar_thumb',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Accesor para la imagen original del avatar.
     */
    public function getAvatarAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, '/storage/') || str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return Storage::disk('public')->url($value);
    }

    /**
     * Accesor dinámico para obtener la versión thumb (_thumb.png).
     */
    public function getAvatarThumbAttribute(): ?string
    {
        $original = $this->avatar;

        if (!$original) {
            return null;
        }

        // Inserta '_thumb' justo antes de la extensión del archivo
        return preg_replace('/(\.[\w]+)$/', '_thumb$1', $original);
    }
}