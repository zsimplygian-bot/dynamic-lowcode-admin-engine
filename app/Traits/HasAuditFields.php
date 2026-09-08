<?php
namespace App\Traits;
use Illuminate\Support\Facades\Auth;
trait HasAuditFields
{
    public static function bootHasAuditFields(): void
    {
        static::creating(function ($model) {
            if ($userId = Auth::id()) {
                $model->creater_id ??= $userId;
                $model->updater_id ??= $userId;
            }
        });
        static::updating(function ($model) {
            if ($userId = Auth::id()) {
                $model->updater_id = $userId;
            }
        });
    }
}