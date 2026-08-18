<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

trait HasSchemaCache
{
    protected function getRawTableColumns(string $tabla): array
    {
        return Cache::rememberForever("schema_columns_{$tabla}", fn () => 
            Schema::hasTable($tabla) ? Schema::getColumns($tabla) : []
        );
    }

    protected function clearSchemaCache(string $tabla): void
    {
        Cache::forget("schema_columns_{$tabla}");
    }
}