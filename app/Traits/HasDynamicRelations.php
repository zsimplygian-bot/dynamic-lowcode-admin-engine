<?php
namespace App\Traits;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
trait HasDynamicRelations
{
    protected array $defaults = ['raza_id' => ['select' => "CONCAT(raza.especie, ' ', raza.raza)"]];
    protected function applyDynamicJoins(Builder $q, string $table, array $cols): void
    {
        foreach ($cols as $col) {
            if (!$this->isFk($col)) continue;
            $rel = substr($col, 0, -3);
            $q->join($rel, "{$rel}.id", "{$table}.{$col}");
            if (isset($this->defaults[$col]['joins'])) {
                foreach ($this->defaults[$col]['joins'] as $extra) $q->join(...$extra);
            }
            $q->selectRaw("{$this->getExpr($col)} as {$rel}");
        }
    }
    protected function getSortColumn(string $table, string $sortBy, array $cols): mixed
    {
        $fk = str_ends_with($sortBy, '_id') ? $sortBy : "{$sortBy}_id";
        if (!in_array($fk, $cols, true)) return "{$table}.{$sortBy}";
        $expr = $this->getExpr($fk);
        return str_contains($expr, '(') ? DB::raw($expr) : $expr;
    }
    protected function applyDynamicSearch(Builder $q, string $term, array $cols): void
    {
        foreach ($cols as $col) {
            if (!$this->isFk($col)) continue;
            $expr = $this->getExpr($col);
            str_contains($expr, '(') ? $q->orWhereRaw("{$expr} LIKE ?", ["%{$term}%"]) : $q->orWhere($expr, 'like', "%{$term}%");
        }
    }
    private function isFk(string $col): bool { return str_ends_with($col, '_id'); }
    private function getExpr(string $fk): string
    {
        $rel = substr($fk, 0, -3);
        return $this->defaults[$fk]['select'] ?? "{$rel}.{$rel}";
    }
}