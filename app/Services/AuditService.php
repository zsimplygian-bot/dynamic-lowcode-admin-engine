<?php
namespace App\Services;
use App\Models\DynamicModel;
class AuditService
{
    protected static function model(): DynamicModel { return DynamicModel::fromTable('audit'); }
    public static function log(string $table, int|string $id, string $action, ?array $oldData = null): void
    {
        $tableId = TableMetadata::id($table);
        if ($oldData) {
            self::model()->where(['table' => $tableId, 'row' => $id])->latest('id')->first()?->update(['payload' => json_encode($oldData, JSON_UNESCAPED_UNICODE)]);
        }
        self::model()->create(['table' => $tableId, 'row' => $id, 'action' => $action, 'users_id' => auth()->id(), 'at' => now()]);
    }
    public static function canDelete(DynamicModel $audit): bool
    {
        $targetTable = collect(TableMetadata::all())->firstWhere('id', $audit->table)['name'] ?? null;
        return !$targetTable || !DynamicModel::fromTable($targetTable)->where('id', $audit->row)->exists();
    }
}