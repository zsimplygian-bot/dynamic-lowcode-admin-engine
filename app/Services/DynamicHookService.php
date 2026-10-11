<?php
namespace App\Services;
use App\Models\DynamicModel;
class DynamicHookService
{
    public function afterSave(string $table, array $data, bool $isUpdate): void
    {
        if (!$isUpdate && $table === 'mascota') { DynamicModel::fromTable('cliente')->where('id', $data['cliente_id'])->increment('mascotas'); }
    }
    public function afterDelete(string $table, array $data): void
    {
        if ($table === 'mascota') { DynamicModel::fromTable('cliente')->where('id', $data['cliente_id'])->decrement('mascotas'); }
    }
}