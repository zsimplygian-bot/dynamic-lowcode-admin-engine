<?php
namespace App\Traits;
use Illuminate\Database\Eloquent\Builder;
trait HasDynamicRelations
{
    protected array $defaults = [ 'raza_id' => [ 'select' => "CONCAT(raza.especie, ' ', raza.raza)", ], ];
    protected function applyDynamicJoins(Builder $q, string $table, array $cols): void
    {
        foreach ($cols as $col) {
            $fk = $col['accessor'];
            if (!str_ends_with($fk, '_id')) continue;
            $rel = substr($fk, 0, -3);
            $q->join($rel, "{$rel}.id", "{$table}.{$fk}");
            $cfg = $this->defaults[$fk] ?? null;
            if (isset($cfg['joins'])) {
                foreach ($cfg['joins'] as $extra) $q->join(...$extra);
            }
            $expr = $cfg['select'] ?? "{$rel}.{$rel}";
            $q->selectRaw("{$expr} as {$rel}");
        }
    }
}