<?php

namespace App\Services;

use App\Traits\HasProtectedTables;
use Illuminate\Support\Facades\{Cache, DB};

class TableMetadata
{
    use HasProtectedTables;

    public static function parse(?string $comment): array
    {
        preg_match('/id:\s*(\d+)/i', $comment, $id);
        preg_match('/icon:\s*([^\s]+)/i', $comment, $icon);
        preg_match('/color:\s*([^\s]+)/i', $comment, $color);
        preg_match('/label:\s*(.*?)(?=\s*(id:|icon:|color:|$))/i', $comment, $label);

        return [
            'id'    => isset($id[1]) ? (int) $id[1] : null,
            'icon'  => $icon[1] ?? null,
            'color' => $color[1] ?? null,
            'label' => trim($label[1] ?? '') ?: null,
        ];
    }

    public static function build(?string $icon = null, ?string $label = null, ?string $color = null, ?int $id = null): string
    {
        return trim(implode(' ', array_filter([
            $id !== null ? "id: {$id}" : null,
            $icon ? "icon: {$icon}" : null,
            $color ? "color: {$color}" : null,
            $label ? "label: {$label}" : null,
        ])));
    }

    public static function getRawTables(): array
    {
        $db = session('active_db', config('database.connections.mysql.database'));

        $results = DB::select("
            SELECT 
                table_name AS name, 
                table_comment AS comment 
            FROM information_schema.tables 
            WHERE table_schema = ? 
              AND table_type = 'BASE TABLE'
        ", [$db]);

        return array_map(fn ($r) => [
            'name' => (string) $r->name,
            'comment' => (string) ($r->comment ?? ''),
        ], $results);
    }

    public static function ensureUniqueIds(): void
    {
        $instance = new self();
        $tables = self::getRawTables();
        $usedIds = [];
        $toUpdate = [];

        foreach ($tables as $t) {
            if ($instance->isProtected($t['name'])) continue;
            $parsed = self::parse($t['comment']);
            $id = $parsed['id'];
            if ($id !== null && !in_array($id, $usedIds, true)) {
                $usedIds[] = $id;
            } else {
                $toUpdate[] = ['name' => $t['name'], 'parsed' => $parsed];
            }
        }

        if (empty($toUpdate)) return;

        foreach ($toUpdate as $item) {
            $available = array_values(array_diff(range(1, 999), $usedIds));
            if (!$available) break;
            $newId = $available[0];
            $usedIds[] = $newId;
            $comment = self::build($item['parsed']['icon'], $item['parsed']['label'], $item['parsed']['color'], $newId);
            DB::statement("ALTER TABLE `{$item['name']}` COMMENT = '" . addslashes($comment) . "'");
        }
    }

    public static function get(string $table): array
    {
        $db = session('active_db', config('database.connections.mysql.database'));

        return Cache::rememberForever("table_meta_{$db}_{$table}", function () use ($table) {
            $comment = collect(self::getRawTables())->firstWhere('name', $table)['comment'] ?? '';

            return array_merge(['name' => $table, 'comment' => $comment ?: null], self::parse($comment));
        });
    }

    public static function id(string $table): int 
    { 
        return self::get($table)['id'] ?? 0; 
    }

    public static function all(bool $includeStats = false): array
    {
        self::ensureUniqueIds();
        $instance = new self();
        $tables = self::getRawTables();

        return collect($tables)
            ->reject(fn ($t) => $instance->isProtected($t['name']))
            ->sortBy('name')
            ->map(fn ($t) => array_merge(
                ['name' => $t['name'], 'comment' => $t['comment'] ?: null],
                self::parse($t['comment'] ?? ''),
                $includeStats ? ['rows_count' => DB::table($t['name'])->count()] : []
            ))
            ->values()
            ->all();
    }

    public static function generateUniqueId(): int
    {
        $existing = collect(self::getRawTables())
            ->map(fn ($t) => self::parse($t['comment'] ?? '')['id'])
            ->filter()
            ->all();

        $available = array_values(array_diff(range(1, 999), $existing));

        return $available ? $available[array_rand($available)] : abort(500, 'Table ID limit reached');
    }
}