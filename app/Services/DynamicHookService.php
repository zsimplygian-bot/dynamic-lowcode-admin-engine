<?php

namespace App\Services;

use App\Models\DynamicModel;

class DynamicHookService
{
    public function afterSave(string $table, array $data, bool $isUpdate): void
    {
        if (!$isUpdate && $table === 'mascota') {
            DynamicModel::fromTable('cliente')->where('id', $data['cliente_id'])->increment('mascotas');
        }
    }

    /**
     * Efectos secundarios al eliminar (Soft-delete)
     * ¡NO llamamos a $record->delete()! La fila se conserva viva en la tabla.
     */
    public function delete(string $table, DynamicModel $record): void
    {
        if ($table === 'mascota') {
            DynamicModel::fromTable('cliente')->where('id', $record->cliente_id)->decrement('mascotas');
        }
    }

    /**
     * Revertir efectos secundarios al Deshacer (Restore)
     */
    public function restore(string $table, DynamicModel $record): void
    {
        if ($table === 'mascota') {
            DynamicModel::fromTable('cliente')->where('id', $record->cliente_id)->increment('mascotas');
        }
    }

    /**
     * Eliminación física real (Hard-delete solo cuando se purga la auditoría)
     */
    public function purge(string $table, DynamicModel $record): void
    {
        if ($table === 'historia') {
            $childTables = ['historia_seguimiento', 'historia_procedimiento', 'historia_producto', 'historia_anamnesis'];
            foreach ($childTables as $childTable) {
                DynamicModel::fromTable($childTable)->where('historia_id', $record->id)->delete();
            }
        }

        $record->delete();
    }
}