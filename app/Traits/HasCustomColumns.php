<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait HasCustomColumns
{
    protected array $customColumns = [
        'historia' => [
            'precio' => [
                'header' => 'PRECIO',
                'sql' => '(
                    COALESCE((SELECT SUM(precio) FROM historia_procedimiento WHERE historia_id = historia.id), 0) +
                    COALESCE((SELECT SUM(precio) FROM historia_producto WHERE historia_id = historia.id), 0)
                )'
            ]
        ]
    ];

    protected function getCustomColumns(string $table): array
    {
        return $this->customColumns[$table] ?? [];
    }

    protected function applyCustomColumns(Builder $query, string $table): void
    {
        foreach ($this->getCustomColumns($table) as $accessor => $cfg) {
            $query->selectRaw("{$cfg['sql']} as {$accessor}");
        }
    }
}