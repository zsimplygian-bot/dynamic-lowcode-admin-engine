<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
class Audit
{
    public static function log(?string $table = null, ?int $id = null, string $action = 's', ?array $data = null, ?array $oldData = null): void
    {
        $payload = match ($action) {
            's', 'd' => array_filter($data ?? [], fn($v) => $v !== null && $v !== ''),
            'u'      => array_map(fn($v) => $v ?? '', array_diff_assoc($data ?? [], $oldData ?? [])),
            default  => null,
        };
        if (isset($payload['id'])) unset($payload['id']);
        DB::table('audit')->insert([
            'table'      => $table ? TableMetadata::id($table) : null,
            'row'        => $id,
            'action'     => $action,
            'payload'    => $payload ? json_encode($payload, JSON_UNESCAPED_UNICODE) : null,
            'users_id'   => auth()->id(),
            'ip_address' => request()->ip(),
            'at'         => now()
        ]);
    }
}