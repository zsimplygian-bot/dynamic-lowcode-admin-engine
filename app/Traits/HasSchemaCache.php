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
    protected function getTableColumns(string $table): array
    {
        return $this->hasTableInSchema($table) ? Cache::rememberForever("schema_columns_{$table}", fn () => Schema::getColumns($table)) : [];
    }
}