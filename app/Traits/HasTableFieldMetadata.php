<?php

namespace App\Traits;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

trait HasTableFieldMetadata
{
    public function getTableFieldMetadata(string $table): array
    {
        $columns = [];

        foreach (Schema::getColumnListing($table) as $name) {
            $isForeign = str_ends_with($name, '_id');

            $col = [
                'accessor' => $name,
                'header'   => Str::upper(str_replace('_', ' ', $name)),
            ];
            if ($isForeign) $col['hidden'] = true;
            $columns[] = $col;

            if ($isForeign) {
                $rel = substr($name, 0, -3);
                $columns[] = [
                    'accessor' => $rel,
                    'header'   => Str::upper(str_replace('_', ' ', $rel)),
                ];
            }
        }

        return $columns;
    }
}