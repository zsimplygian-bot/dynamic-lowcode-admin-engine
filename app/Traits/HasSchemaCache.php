<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

trait HasSchemaCache
{
    protected function hasTableInSchema(string $table): bool
    {
        return Cache::rememberForever("schema_exists_{$table}", fn () => Schema::hasTable($table));
    }

    protected function getRawTableColumns(string $table): array
    {
        if (!$this->hasTableInSchema($table)) {
            return [];
        }

        return Cache::rememberForever("schema_columns_{$table}", fn () => Schema::getColumns($table));
    }

    /**
     * Limpia TODO el ecosistema de caché para una tabla dada
     */
    public function clearAllTableCache(string $table): void
    {
        Cache::forget("schema_exists_{$table}");
        Cache::forget("schema_columns_{$table}");
        Cache::forget("schema_metadata_v4_{$table}");
        Cache::forget("compiled_schema_v2_{$table}");
        Cache::forget("compiled_rules_{$table}_create");
        Cache::forget("compiled_rules_{$table}_update");
    }
}