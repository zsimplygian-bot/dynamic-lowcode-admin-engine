<?php
namespace App\Traits;
use Illuminate\Database\Query\Builder;
trait HasExtraColumns
{
    protected function getExtraColumnsConfig(string $table): array
    {
        return [
            'cliente' => [[
                'accessor'   => 'total_mascota',
                'header'     => 'MASCOTAS',
                'type'       => 'number',
                'after'      => 'cliente',
                'sortable'   => true,
                'searchable' => true,
                'rawQuery'   => '(SELECT COUNT(*) FROM mascota WHERE mascota.id_cliente = cliente.id_cliente)',
            ]],
        ][$table] ?? [];
    }
    protected function appendExtraColumnsToMetadata(string $table, array &$columns): void
    {
        foreach ($this->getExtraColumnsConfig($table) as $extra) {
            $acc = $extra['accessor'];
            $lbl = $extra['header'] ?? $acc;
            $colDef = [
                'accessor'   => $acc,
                'name'       => $acc,
                'header'     => $lbl,
                'label'      => $lbl,
                'type'       => $extra['type'] ?? 'text',
                'searchable' => $extra['searchable'] ?? false,
                'sortable'   => $extra['sortable'] ?? true,
                'hidden'     => $extra['hidden'] ?? false,
                'is_primary' => false,
                'is_foreign' => false,
                'is_extra'   => true,
            ];
            $after = $extra['after'] ?? null;
            $idx   = $after ? array_search($after, array_column($columns, 'accessor')) : false;
            if ($idx === false && $after) $idx = array_search($after, array_column($columns, 'name'));
            $idx !== false ? array_splice($columns, $idx + 1, 0, [$colDef]) : $columns[] = $colDef;
        }
    }
    protected function applyExtraColumns(Builder $query, string $table): array
    {
        $map = [];
        foreach ($this->getExtraColumnsConfig($table) as $extra) {
            if ($raw = $extra['rawQuery'] ?? null) {
                $query->selectRaw("{$raw} as {$extra['accessor']}");
                $map[$extra['accessor']] = $raw;
            }
        }
        return $map;
    }
}