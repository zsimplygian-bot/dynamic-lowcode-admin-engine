<?php
namespace App\Traits;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
trait HasDynamicRelations
{
    // Resolutores base. Si el controlador define $customFkResolvers, los fusionamos.
    protected function getResolvers(): array
    {
        $defaults = [
            'id_sexo' => [
                'select' => 'ref_sexo.emoji_sexo',
            ],
            'id_raza' => [
                'joins'  => [
                    ['especie as ref_especie', 'ref_raza.id_especie', '=', 'ref_especie.id_especie'],
                ],
                'select' => "CONCAT(COALESCE(ref_especie.emoji_especie, ''), ' ', ref_raza.raza)",
                'search' => 'ref_raza.raza',
            ],
        ];
        return array_merge($defaults, property_exists($this, 'customFkResolvers') ? $this->customFkResolvers : []);
    }
    // Aplica JOINs dinámicos y resolutores personalizados
    protected function applyDynamicJoins(Builder $query, string $mainTable, array &$columns): void
    {
        $foreignKeys = DB::table('information_schema.KEY_COLUMN_USAGE')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $mainTable)
            ->whereNotNull('REFERENCED_TABLE_NAME')
            ->get(['COLUMN_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME']);
        $selects = ["{$mainTable}.*"];
        $fkMap = [];
        $resolvers = $this->getResolvers();
        foreach ($foreignKeys as $fk) {
            $fkCol = $fk->COLUMN_NAME;
            $refTable = $fk->REFERENCED_TABLE_NAME;
            $refPk = $fk->REFERENCED_COLUMN_NAME;
            if (in_array($fkCol, ['creater_id', 'updater_id', 'user_id'])) {
                continue;
            }
            $alias = "ref_{$refTable}";
            $displayCol = str_replace('id_', '', $fkCol);
            // 1. JOIN principal
            $query->leftJoin("{$refTable} as {$alias}", "{$mainTable}.{$fkCol}", '=', "{$alias}.{$refPk}");
            // 2. Resolver custom vs Estándar
            $config = $resolvers[$fkCol] ?? [];
            // JOINs extra
            foreach ($config['joins'] ?? [] as $j) {
                $query->leftJoin(...$j);
            }
            // Expresión de selección y columna de búsqueda
            $expr = $config['select'] ?? "{$alias}.{$displayCol}";
            $searchColumn = $config['search'] ?? "{$alias}.{$displayCol}";
            // Sintaxis limpia: si detecta espacios o funciones SQL como CONCAT, genera un DB::raw
            $selects[] = (str_contains($expr, ' ') || str_contains($expr, '('))
                ? DB::raw("{$expr} as {$displayCol}")
                : "{$expr} as {$displayCol}";
            $fkMap[$fkCol] = [
                'alias'        => $displayCol,
                'header'       => Str::upper(str_replace('_', ' ', $displayCol)),
                'searchColumn' => $searchColumn,
            ];
        }
        $query->select($selects);
        // 3. Mapeo de metadata para React
        $columns = array_map(function ($col) use ($fkMap) {
            $accessor = $col['accessor'];
            if (isset($fkMap[$accessor])) {
                return [
                    'accessor'     => $fkMap[$accessor]['alias'],
                    'header'       => $fkMap[$accessor]['header'],
                    'hidden'       => false,
                    'searchColumn' => $fkMap[$accessor]['searchColumn'],
                ];
            }
            return $col;
        }, $columns);
    }
}