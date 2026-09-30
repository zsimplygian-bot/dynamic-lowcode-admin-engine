<?php
namespace App\Traits;
use Illuminate\Support\Facades\{DB, Schema};
trait HasTableMetadata
{
    use HasCommentMetadata, HasProtectedTables;
    protected function getTableMetadata(array|string|null $table = null, bool $includeStats = false): array
    {
        if (!$table) {
            return collect(Schema::getTables())
                ->reject(fn ($t) => $this->isProtected($t['name']))
                ->sortBy('name')
                ->map(fn ($t) => $this->getTableMetadata($t, $includeStats))
                ->values()
                ->all();
        }
        $name = is_array($table) ? $table['name'] : $table;
        $comment = is_array($table) ? ($table['comment'] ?? '') : (collect(Schema::getTables())->firstWhere('name', $name)['comment'] ?? '');
        return array_merge([
            'name' => $name,
            'comment' => $comment ?: null,
        ], $this->parseComment($comment), $includeStats ? ['rows_count' => DB::table($name)->count()] : []);
    }
}