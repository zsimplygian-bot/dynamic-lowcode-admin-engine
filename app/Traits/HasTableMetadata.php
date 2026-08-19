<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait HasTableMetadata
{
    use HasSchemaCache, InfersColumnDefinition;

    protected array $hiddenByDefault = [
        'creater_id' => true,
        'updated_at' => true,
        'updater_id' => true,
    ];

    protected array $nonSearchableColumns = [
        'creater_id' => true,
        'created_at' => true,
        'updater_id' => true,
        'updated_at' => true,
    ];

    protected array $nonSearchableTypes = [
        'file'  => true,
        'image' => true,
    ];

    public function getTableColumns(string $table): array
    {
        // Cambiamos el prefijo de la clave a 'schema_metadata_v2_' para invalidar caché vieja automáticamente
        return Cache::rememberForever("schema_metadata_v2_{$table}", function () use ($table) {
            $rawColumns = $this->getRawTableColumns($table);
            if (empty($rawColumns)) return [];

            $pkName = "id_{$table}";
            $columns = [];

            foreach ($rawColumns as $col) {
                $base = $this->buildBaseColumnDefinition($col, $table);
                $name = $base['name'];

                $isForeign = ($name !== $pkName) && str_starts_with($name, 'id_');

                // 1. Inyecta la columna base (FK)
                $columns[] = [
                    'accessor'   => $name,
                    'header'     => $base['label'],
                    'type'       => $base['type'],
                    'searchable' => !isset($this->nonSearchableColumns[$name]) && !isset($this->nonSearchableTypes[$base['type']]),
                    'hidden'     => $isForeign || isset($this->hiddenByDefault[$name]),
                ];

                // 2. Inyecta la columna descriptiva asociada justo después (ej: 'id_cliente' -> 'cliente')
                if ($isForeign) {
                    $relatedName = substr($name, 3);
                    $columns[] = [
                        'accessor'   => $relatedName,
                        'header'     => strtoupper($relatedName),
                        'type'       => 'text',
                        'searchable' => false,
                        'hidden'     => false,
                    ];
                }
            }

            return $columns;
        });
    }

    public function clearTableMetadataCache(string $table): void
    {
        $this->clearSchemaCache($table);
        Cache::forget("schema_metadata_v2_{$table}");
    }
}