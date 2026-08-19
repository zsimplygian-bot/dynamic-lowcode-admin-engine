<?php
namespace App\Traits;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
trait HasSchemaCache
{
    // Verifica existencia usando la caché
    protected function hasTableInSchema(string $table): bool
    {
        return Cache::rememberForever("schema_exists_{$table}", fn () => Schema::hasTable($table));
    }
    // Obtiene las columnas crudas de la BD
    protected function getRawTableColumns(string $table): array
    {
        // Si la tabla no existe, devolvemos array vacío directamente sin cachear la clave de columnas
        if (!$this->hasTableInSchema($table)) {
            return [];
        }

        return Cache::rememberForever("schema_columns_{$table}", fn () => Schema::getColumns($table));
    }
    // Limpia todo el rastro de caché de esquema para la tabla
    protected function clearSchemaCache(string $table): void
    {
        Cache::forget("schema_exists_{$table}");
        Cache::forget("schema_columns_{$table}");
    }
}