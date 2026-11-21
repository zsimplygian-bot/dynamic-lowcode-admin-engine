<?php
namespace App\Services;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class DynamicHook
{
    public function __construct(protected File $files) {}
    public function beforeSave(Request $request, string $table, array $payload, ?array $oldData = null): array
    {
        return $this->files->handle($request, $table, $payload, $oldData);
    }
    public function afterSave(string $table, DynamicModel $record, ?array $oldData = null): void
    {
        Audit::log($table, $record->id, $record->getAttributes(), $oldData);
        if (!$oldData && $table === 'mascota') $this->syncMascotaCliente($record->cliente_id, true);
    }
    public function beforeDelete(string $table, DynamicModel $record): bool
    {
        Audit::log($table, $record->id, $record->getAttributes(), action: 'd');
        $this->files->deleteRecordFiles($record->getAttributes());
        if ($table === 'mascota') $this->syncMascotaCliente($record->cliente_id, false);
        if ($table === 'historia') {
            foreach (['historia_seguimiento', 'historia_procedimiento', 'historia_producto', 'historia_anamnesis'] as $child) {
                DB::table($child)->where('historia_id', $record->id)->delete();
            }
        }
        return true;
    }
    private function syncMascotaCliente(mixed $clienteId, bool $increment): void
    {
        DB::table('cliente')->where('id', $clienteId)->{$increment ? 'increment' : 'decrement'}('mascotas');
    }
}