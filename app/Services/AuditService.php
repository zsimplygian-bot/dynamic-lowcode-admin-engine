<?php
namespace App\Services;
use Illuminate\Support\Facades\{Auth, DB};
class AuditService
{
    public static function log(string $table, int|string $rowId, string $action, ?array $payload = null): void
    {
        $cleanValues = $payload ? array_map(fn ($val) => $val ?? '', array_values($payload)) : null;
        DB::table('audit')->insert([
            'table'   => $table,
            'row_id'  => $rowId,
            'action'  => $action,
            'user_id' => Auth::id(),
            'payload' => $cleanValues ? json_encode($cleanValues) : null,
            'at'      => now(),
        ]);
    }
}