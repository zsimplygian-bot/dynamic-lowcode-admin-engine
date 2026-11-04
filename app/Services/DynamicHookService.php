<?php
namespace App\Services;
use App\Models\DynamicModel;
class DynamicHookService
{
    public function afterSave(string $table, DynamicModel $record, ?array $oldData = null): void
    {
        AuditService::log($table, $record->id, $oldData ? 'u' : 's', $oldData);
        if (!$oldData && $table === 'mascota') {
            $this->syncMascotaCliente($record->cliente_id, increment: true);
        }
    }
    public function beforeDelete(string $table, DynamicModel $record): bool
    {
        if ($table === 'audit') return AuditService::canDelete($record);
        AuditService::log($table, $record->id, 'd', $record->getAttributes());
        if ($table === 'mascota') {
            $this->syncMascotaCliente($record->cliente_id, increment: false);
        }
        if ($table === 'historia') {
            foreach (['historia_seguimiento', 'historia_procedimiento', 'historia_producto', 'historia_anamnesis'] as $child) {
                DynamicModel::fromTable($child)->where('historia_id', $record->id)->delete();
            }
        }
        return true;
    }
    private function syncMascotaCliente(mixed $clienteId, bool $increment): void
    {
        $query = DynamicModel::fromTable('cliente')->where('id', $clienteId);
        $increment ? $query->increment('mascotas') : $query->decrement('mascotas');
    }
}