<?php

namespace App\Services;

use Illuminate\Support\Facades\{Auth, DB};

class AuditService
{
    public static function log(string $table, int|string $rowId, string $action, ?array $payload = null): void
    {
        $userId = Auth::id();
        $cleanValues = $payload ? array_map(fn ($val) => $val ?? '', array_values($payload)) : null;

        dispatch(fn () => DB::table('audit')->insert([
            'table'   => $table,
            'row_id'  => $rowId,
            'action'  => $action,
            'user_id' => $userId,
            'payload' => $cleanValues ? json_encode($cleanValues) : null,
            'at'      => now(),
        ]));
    }
}