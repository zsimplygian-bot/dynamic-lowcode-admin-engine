<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasExtraColumns
{
    use FormatsDateDifference;

    protected function getExtraColumnsConfig(string $table): array
    {
        return [
            'cliente' => [[
                'accessor'   => 'total_mascota',
                'header'     => 'MASCOTAS',
                'type'       => 'number',
                'after'      => 'cliente',
                'searchable' => true,
                'rawQuery'   => '(SELECT COUNT(*) FROM mascota WHERE mascota.cliente_id = cliente.id)',
            ]],
            'mascota' => [[
                'accessor'   => 'edad',
                'header'     => 'EDAD',
                'type'       => 'text',
                'after'      => 'fecha_nacimiento',
                'searchable' => true,
                'rawQuery'   => "CASE 
                    WHEN TIMESTAMPDIFF(YEAR, mascota.fecha_nacimiento, CURRENT_DATE) < 1 
                        THEN CONCAT(TIMESTAMPDIFF(MONTH, mascota.fecha_nacimiento, CURRENT_DATE), IF(TIMESTAMPDIFF(MONTH, mascota.fecha_nacimiento, CURRENT_DATE) = 1, ' mes', ' meses'))
                    WHEN TIMESTAMPDIFF(MONTH, mascota.fecha_nacimiento, CURRENT_DATE) % 12 = 0 
                        THEN CONCAT(TIMESTAMPDIFF(YEAR, mascota.fecha_nacimiento, CURRENT_DATE), IF(TIMESTAMPDIFF(YEAR, mascota.fecha_nacimiento, CURRENT_DATE) = 1, ' año', ' años'))
                    ELSE CONCAT(
                        TIMESTAMPDIFF(YEAR, mascota.fecha_nacimiento, CURRENT_DATE), IF(TIMESTAMPDIFF(YEAR, mascota.fecha_nacimiento, CURRENT_DATE) = 1, ' año y ', ' años y '),
                        TIMESTAMPDIFF(MONTH, mascota.fecha_nacimiento, CURRENT_DATE) % 12, IF(TIMESTAMPDIFF(MONTH, mascota.fecha_nacimiento, CURRENT_DATE) % 12 = 1, ' mes', ' meses')
                    )
                END",
            ]],
        ][$table] ?? [];
    }

    protected function appendExtraColumnsToMetadata(string $table, array &$columns): void
    {
        foreach ($this->getExtraColumnsConfig($table) as $extra) {
            $acc = $extra['accessor'];
            $colDef = array_filter([
                'accessor'   => $acc,
                'name'       => $acc,
                'header'     => $extra['header'] ?? $acc,
                'label'      => $extra['header'] ?? $acc,
                'type'       => $extra['type'] ?? 'text',
                'searchable' => $extra['searchable'] ?? null,
                'sortable'   => true,
                'is_extra'   => true,
            ], fn($v) => $v !== null);

            $after = $extra['after'] ?? null;
            $idx = $after ? array_search($after, array_column($columns, 'accessor')) : false;

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