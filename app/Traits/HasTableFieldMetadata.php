<?php
namespace App\Traits;
use Illuminate\Support\Facades\{Cache, Schema};
use Illuminate\Support\Str;
trait HasTableFieldMetadata
{
    public function getTableColumns(string $table): array
    {
        return Cache::rememberForever("table_cols_{$table}", fn() => Schema::getColumnListing($table));
    }
    public function getTableFieldMetadata(string $table): array
    {
        return Cache::rememberForever("table_meta_{$table}", fn() => array_map(function ($name) {
            $key = str_ends_with($name, '_id') ? substr($name, 0, -3) : $name;
            return ['accessor' => $key, 'header' => Str::upper(str_replace('_', ' ', $key))];
        }, $this->getTableColumns($table)));
    }
}