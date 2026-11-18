<?php
namespace App\Services;
use App\Traits\HasProtectedTables;
use Illuminate\Support\Facades\DB;
class TableMetadata
{
    use HasProtectedTables;
    public static function parse(?string $comment): array
    {
        $comment = trim($comment ?? '');
        $data = [];
        if (str_starts_with($comment, '{') || str_starts_with(stripslashes($comment), '{')) {
            $data = json_decode($comment, true) ?? json_decode(stripslashes($comment), true) ?? [];
        } else {
            preg_match_all('/(id|icon|color|label):\s*(.*?)(?=\s+(?:id|icon|color|label):|$)/i', str_replace('|', ' ', $comment), $matches, PREG_SET_ORDER);
            foreach ($matches as $m) $data[strtolower($m[1])] = trim($m[2]);
        }
        return [
            'id'    => isset($data['id']) && is_numeric($data['id']) ? (int) $data['id'] : null,
            'icon'  => !empty($data['icon']) ? $data['icon'] : null,
            'color' => !empty($data['color']) ? $data['color'] : null,
            'label' => !empty($data['label']) ? $data['label'] : null,
        ];
    }
    public static function build(?string $icon = null, ?string $label = null, ?string $color = null, ?int $id = null): string
    {
        return collect(compact('id', 'icon', 'color', 'label'))
            ->filter(fn ($v) => !blank($v))
            ->map(fn ($v, $k) => "{$k}: " . trim(str_replace(['"', "'", ','], '', $v)))
            ->implode(' ');
    }
    public static function getRawTables(): array
    {
        $db = session('active_db', config('database.connections.mysql.database'));
        return array_map(fn ($r) => ['name' => (string) $r->name, 'comment' => (string) ($r->comment ?? '')], 
            DB::select("SELECT table_name AS name, table_comment AS comment FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'", [$db])
        );
    }
    public static function get(string $table): array
    {
        $raw = collect(self::getRawTables())->firstWhere('name', $table);
        $comment = $raw['comment'] ?? '';
        return array_merge(['name' => $table, 'comment' => $comment ?: null], self::parse($comment));
    }
    public static function id(string $table): int { return self::get($table)['id'] ?? 0; }
    public static function all(bool $includeStats = false): array
    {
        $instance = new self();
        return collect(self::getRawTables())
            ->reject(fn ($t) => $instance->isProtected($t['name']))
            ->sortBy('name')
            ->map(function ($t) use ($includeStats) {
                $meta = self::parse($t['comment']);
                return [
                    'id'         => $meta['id'],
                    'name'       => $t['name'],
                    'label'      => $meta['label'],
                    'icon'       => $meta['icon'],
                    'color'      => $meta['color'],
                    'comment'    => $meta['label'] ?: ($t['comment'] ?: null),
                    'rows_count' => $includeStats ? DB::table($t['name'])->count() : 0,
                ];
            })->values()->all();
    }
    public static function generateUniqueId(): int
    {
        $used = array_filter(array_column(self::all(), 'id'));
        return current(array_diff(range(1, 999), $used)) ?: abort(500, 'Table ID limit reached');
    }
}