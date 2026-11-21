<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
class Audit
{
    public static function log( ?string $table = null, int|string|null $id = null, ?array $data = null, ?array $old = null, string $action = 's' ): void {
        if ($old) $action = 'u'; // Se autodetecta: si hay datos viejos, es update
        $payload = match ($action) {
            'u'     => self::diff($old, $data ?? []),
            default => $data,
        };
        if ($action === 'u' && empty($payload)) return;
        DB::table('audit')->insert([
            'table'      => $table ? TableMetadata::id($table) : null,
            'row'        => $id,
            'action'     => $action,
            'payload'    => $payload ? json_encode($payload, JSON_UNESCAPED_UNICODE) : null,
            'users_id'   => auth()->id(),
            'ip_address' => request()->ip(),
            'at'         => now(),
        ]);
    }
    protected static function diff(array $old, array $new): array
    {
        $diff = [];
        foreach ($new as $k => $v) {
            if (($old[$k] ?? null) !== $v) $diff[$k] = [$old[$k] ?? null, $v];
        }
        return $diff;
    }
}