<?php
namespace App\Services;
use App\Models\DynamicModel;
class DynamicHookService
{
    public function afterSave(string $table, array $data, bool $isUpdate): void
    {
        if (!$isUpdate && $table === 'mascota') { DynamicModel::fromTable('cliente')->where('id', $data['cliente_id'])->increment('mascotas'); }
    }
    public function delete(string $table, DynamicModel $record): void
    {
        $data = $record->toArray();
        // 1. Limpieza de relaciones hijas (Before Delete)
        if ($table === 'historia') {
            $childTables = ['historia_seguimiento', 'historia_procedimiento', 'historia_producto', 'historia_anamnesis'];
            foreach ($childTables as $childTable) {
                DynamicModel::fromTable($childTable)->where('historia_id', $data['id'])->delete();
            }
        }
        // 2. Eliminación del registro principal
        $record->delete();
        // 3. Efectos secundarios (After Delete)
        if ($table === 'mascota') { DynamicModel::fromTable('cliente')->where('id', $data['cliente_id'])->decrement('mascotas'); }
    }
}