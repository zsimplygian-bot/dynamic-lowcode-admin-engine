<?php
namespace App\Traits;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
trait HasDynamicRelations
{
    /**
     * Configuraciones personalizadas para relaciones específicas
     */
    protected array $relationDefaults = [
        'id_sexo' => [
            'select' => 'ref_sexo.emoji_sexo',
            'search' => 'ref_sexo.emoji_sexo',
        ],
        'id_raza' => [
            'joins'  => [
                ['especie as ref_especie', 'ref_raza.id_especie', '=', 'ref_especie.id_especie'],
            ],
            'select' => "CONCAT(COALESCE(ref_especie.emoji_especie, ''), ' ', ref_raza.raza)",
            'search' => 'ref_raza.raza',
        ],
    ];
    /**
     * Aplica los LEFT JOINs y devuelve el mapa de columnas de búsqueda resueltas
     */
    protected function applyDynamicJoins(Builder $query, string $table, array $columns): array
    {
        $pkName = "id_{$table}";
        $foreigns = array_filter($columns, static function ($col) use ($pkName) {
            $accessor = $col['accessor'] ?? '';
            return $accessor !== $pkName && str_starts_with($accessor, 'id_');
        });
        $searchMapping = [];
        if (empty($foreigns)) {
            $query->select("{$table}.*");
            return $searchMapping;
        }
        $selects = ["{$table}.*"];
        $joinedAliases = [];
        foreach ($foreigns as $col) {
            $fkName       = $col['accessor'];
            $relatedTable = substr($fkName, 3); // 'id_cliente' -> 'cliente'
            $alias        = "ref_{$relatedTable}";
            // Evitar JOIN duplicado si la misma foránea aparece dos veces
            if (isset($joinedAliases[$alias])) continue;
            $joinedAliases[$alias] = true;
            $query->leftJoin("{$relatedTable} as {$alias}", "{$table}.{$fkName}", '=', "{$alias}.id_{$relatedTable}");
            if (isset($this->relationDefaults[$fkName])) {
                $config = $this->relationDefaults[$fkName];
                if (!empty($config['joins'])) {
                    foreach ($config['joins'] as $extraJoin) {
                        $query->leftJoin(...$extraJoin);
                    }
                }
                $selects[] = DB::raw("{$config['select']} as {$relatedTable}");
                $searchMapping[$relatedTable] = DB::raw($config['search'] ?? $config['select']);
            } else {
                $selects[] = "{$alias}.{$relatedTable} as {$relatedTable}";
                $searchMapping[$relatedTable] = "{$alias}.{$relatedTable}";
            }
        }
        $query->select($selects);
        return $searchMapping;
    }
}