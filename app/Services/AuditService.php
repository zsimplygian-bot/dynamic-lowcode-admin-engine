<?php
namespace App\Services;
use Illuminate\Support\Facades\{Auth, DB};
class AuditService
{
    public static function log(int|string $table, int|string $rowId, string $action, ?array $payload = null): void
    {
        DB::table('audit')->insert([
            'table'   => is_numeric($table) ? (int) $table : TableMetadata::id($table),
            'row_id'  => $rowId,
            'action'  => $action,
            'user_id' => Auth::id(),
            'payload' => $payload ? json_encode(array_map(fn ($val) => $val ?? '', array_values($payload))) : null,
            'at'      => now(),
        ]);
    }
}