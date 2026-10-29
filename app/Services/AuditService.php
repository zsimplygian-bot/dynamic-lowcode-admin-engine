<?php

namespace App\Services;

use App\Models\DynamicModel;

class AuditService
{
    public static function log(string $table, int|string $id, string $action, ?array $oldData = null): void
    {
        $tableId = TableMetadata::id($table);
        $model = DynamicModel::fromTable('audit');

        // ÚNICAMENTE si es edición ('u') guardamos el estado anterior en el registro previo
        if ($action === 'u' && $oldData !== null) {
            $model->where('table', $tableId)
                ->where('row', $id)
                ->latest('id')
                ->first()
                ?->update(['payload' => json_encode($oldData, JSON_UNESCAPED_UNICODE)]);
        }

        // El nuevo registro ('s', 'u' o 'd') siempre se crea con payload null
        $model->create([
            'table'    => $tableId,
            'row'      => $id,
            'action'   => $action,
            'users_id' => auth()->id(),
            'at'       => now(),
        ]);
    }
}