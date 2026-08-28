<?php

namespace App\Traits;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

trait HasExtraColumns
{
    /**
     * Registro de columnas calculadas / extras por cada tabla
     */
    protected function getExtraColumnsConfig(string $table): array
    {
        $configs = [
            'cliente' => [
                [
                    'accessor'   => 'total_mascota',
                    'header'     => 'MASCOTAS',
                    'type'       => 'number',
                    'after'      => 'cliente',      // 👈 Se posiciona justo después del campo 'cliente'
                    'sortable'   => true,           // 👈 Permite ordenar de mayor a menor
                    'searchable' => true,           // 👈 Permite buscar por cantidad
                    'rawQuery'   => '(SELECT COUNT(*) FROM mascota WHERE mascota.id_cliente = cliente.id_cliente)',
                ],
            ],
        ];

        return $configs[$table] ?? [];
    }

    /**
     * Inserta las columnas calculadas en la posición exacta ('after') para React
     */
    protected function appendExtraColumnsToMetadata(string $table, array &$columns): void
    {
        $extras = $this->getExtraColumnsConfig($table);

        foreach ($extras as $extra) {
            $colDef = [
                'accessor'   => $extra['accessor'],
                'name'       => $extra['accessor'],
                'header'     => $extra['header'],
                'label'      => $extra['header'],
                'type'       => $extra['type'] ?? 'text',
                'searchable' => $extra['searchable'] ?? false,
                'sortable'   => $extra['sortable'] ?? true,
                'hidden'     => $extra['hidden'] ?? false,
                'is_primary' => false,
                'is_foreign' => false,
                'is_extra'   => true,
            ];

            // Si definiste 'after', buscamos el índice de esa columna para insertarla justo después
            $after = $extra['after'] ?? null;
            $inserted = false;

            if ($after) {
                foreach ($columns as $index => $col) {
                    if (($col['accessor'] ?? '') === $after || ($col['name'] ?? '') === $after) {
                        array_splice($columns, $index + 1, 0, [$colDef]);
                        $inserted = true;
                        break;
                    }
                }
            }

            // Si no tiene 'after' o no encontró la columna, la pone al final
            if (!$inserted) {
                $columns[] = $colDef;
            }
        }
    }

    /**
     * Aplica los selectRaw y devuelve el mapa de expresiones SQL para búsqueda y orden
     */
    protected function applyExtraColumns(Builder $query, string $table): array
    {
        $extras = $this->getExtraColumnsConfig($table);
        $extraMap = [];

        foreach ($extras as $extra) {
            $accessor = $extra['accessor'];
            $rawQuery = $extra['rawQuery'] ?? null;

            if ($rawQuery) {
                $query->selectRaw("{$rawQuery} as {$accessor}");
                $extraMap[$accessor] = $rawQuery;
            }
        }

        return $extraMap;
    }
}