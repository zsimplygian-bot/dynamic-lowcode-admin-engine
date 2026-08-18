<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

trait HasTableMetadata
{
    use HasSchemaCache;

    protected array $hiddenByDefault = ['creater_id', 'updated_at', 'updater_id'];

    protected function ensureTableExists(string $table): void
    {
        if (!Schema::hasTable($table)) {
            abort(404, "La tabla '{$table}' no existe.");
        }
    }

    protected function getTableColumns(string $table): array
    {
        return Cache::rememberForever("schema_metadata_columns_{$table}", function () use ($table) {
            $rawColumns = $this->getRawTableColumns($table);
            if (empty($rawColumns)) {
                return [];
            }

            $primaryKeyPattern = "id_{$table}";

            return array_map(function ($col) use ($primaryKeyPattern) {
                $columnName = is_array($col) ? ($col['name'] ?? '') : $col;
                $comment = is_array($col) ? ($col['comment'] ?? null) : null;

                $isPrimaryId = $columnName === 'id' || $columnName === $primaryKeyPattern;

                $header = match (true) {
                    !empty($comment) && preg_match("/label:\s*['\"]([^'\"]+)['\"]/i", $comment, $matches) => Str::upper($matches[1]),
                    !empty($comment) => Str::upper(str_replace('_', ' ', $comment)),
                    $columnName === 'created_at' => 'FECHA CREACIÓN',
                    $isPrimaryId => 'ID',
                    default => Str::upper(str_replace('_', ' ', $columnName)),
                };

                return [
                    'accessor' => $columnName,
                    'header'   => $header,
                    'hidden'   => in_array($columnName, $this->hiddenByDefault),
                ];
            }, $rawColumns);
        });
    }

    protected function clearTableMetadataCache(string $table): void
    {
        $this->clearSchemaCache($table);
        Cache::forget("schema_metadata_columns_{$table}");
    }
}