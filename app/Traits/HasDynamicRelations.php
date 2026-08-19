<?php

namespace App\Traits;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

trait HasDynamicRelations
{
    protected function applyDynamicJoins(Builder $query, string $table, array $columns): void
    {
        $pkName = "id_{$table}";
        $foreigns = array_filter($columns, static function ($col) use ($pkName) {
            $accessor = $col['accessor'] ?? '';
            if ($accessor === $pkName) return false;
            // Solo foráneas estrictas que inicien con 'id_'
            return str_starts_with($accessor, 'id_');
        });

        if (empty($foreigns)) return;

        $defaults = [
            'id_sexo' => [
                'select' => 'ref_sexo.emoji_sexo',
            ],
            'id_raza' => [
                'joins'  => [
                    ['especie as ref_especie', 'ref_raza.id_especie', '=', 'ref_especie.id_especie'],
                ],
                'select' => "CONCAT(COALESCE(ref_especie.emoji_especie, ''), ' ', ref_raza.raza)",
            ],
        ];

        $selects = ["{$table}.*"];

        foreach ($foreigns as $col) {
            $fkName = $col['accessor'];
            $relatedTable = substr($fkName, 3); // remueve 'id_' -> 'cliente', 'raza', 'sexo'
            $alias = "ref_{$relatedTable}";

            $query->leftJoin("{$relatedTable} as {$alias}", "{$table}.{$fkName}", '=', "{$alias}.id_{$relatedTable}");

            if (isset($defaults[$fkName])) {
                $config = $defaults[$fkName];
                if (!empty($config['joins'])) {
                    foreach ($config['joins'] as $extraJoin) {
                        $query->leftJoin(...$extraJoin);
                    }
                }
                $selects[] = DB::raw("{$config['select']} as {$relatedTable}");
            } else {
                $selects[] = "{$alias}.{$relatedTable} as {$relatedTable}";
            }
        }

        $query->select($selects);
    }
}