<?php

namespace App\Http\Controllers;

use App\Models\DynamicModel;
use App\Services\{AuditService, DynamicHookService, TableMetadata};
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class DynamicCrudController extends Controller
{
    use HasDynamicFileUpload, HasNotify;

    protected function getModel(string $table): DynamicModel 
    { 
        return DynamicModel::fromTable($table); 
    }
    public function show(string $table, string $id) { return response()->json(['data' => $this->getModel($table)->findOrFail($id)]); }
    public function store(Request $request, string $table) 
    { 
        return $this->persist($request, $table); 
    }

    public function update(Request $request, string $table, string $id) 
    { 
        return $this->persist($request, $table, $id); 
    }

    protected function persist(Request $request, string $table, ?string $id = null)
    {
        $isUpdate = !empty($id);
        $record = $isUpdate ? $this->getModel($table)->findOrFail($id) : $this->getModel($table);

        // Capturamos el estado anterior antes de modificar la entidad
        $oldData = $isUpdate ? $record->getAttributes() : null;

        // ... tu lógica de validación, subida de archivos o hooks ...
        $record->fill($request->all());
        $record->save();

        // En 's' oldData es null; en 'u' se guarda la foto previa en el registro anterior de auditoría
        AuditService::log($table, $record->id, $isUpdate ? 'u' : 's', $oldData);

        return $this->notify($isUpdate ? 'Registro actualizado.' : 'Registro creado.');
    }

        public function destroy(string $table, string $id)
    {
        if ($table === 'audit') {
            return $this->purgeAuditRecord($id);
        }

        $record = $this->getModel($table)->findOrFail($id);
        app(DynamicHookService::class)->delete($table, $record);

        AuditService::log($table, $id, 'd');

        // Obtenemos el ID numérico de la tabla desde TableMetadata
        $tableId = TableMetadata::id($table);

        return $this->notify('Registro eliminado.', 'success', [
            'action' => [
                'label'  => 'Deshacer',
                'url'    => route('crud.restore', ['table' => $table, 'id' => $id]),
                'method' => 'post',
                'data'   => [
                    'table'    => $table,
                    'table_id' => $tableId, // <--- Enviamos el ID numérico (ej: 12)
                    'id'       => $id,
                ],
            ],
        ]);
    }

    public function restore(Request $request)
    {
        $tableName = $request->input('table') ?: $request->route('table') ?: $request->route('tableName');
        $id        = $request->input('id')    ?: $request->route('id');
        $tableId = (int) ($request->input('table_id') ?: TableMetadata::id($tableName));
        // 1. Buscamos y eliminamos el 'd' de auditoría
        $query = \Illuminate\Support\Facades\DB::table('audit')
            ->where('row', $id)
            ->where('action', 'd');
        if ($tableId > 0) {
            $query->where('table', $tableId);
        }
        $audit = $query->orderByDesc('id')->first();
        if ($audit) {
            \Illuminate\Support\Facades\DB::table('audit')->where('id', $audit->id)->delete();
            // 2. Revertir efectos secundarios en hooks (ej: volver a incrementar mascotas)
            $record = $this->getModel($tableName)->find($id);
            if ($record) {
                app(DynamicHookService::class)->restore($tableName, $record);
            }
        }
        return $this->notify(
            $audit ? 'Acción deshecha con éxito.' : 'No se encontró el registro para restaurar.',
            $audit ? 'success' : 'error'
        );
    }
    public function destroyBulk(Request $request, string $table)
    {
        $ids = (array) $request->input('ids', []);

        if ($table === 'audit') {
            foreach ($ids as $id) {
                $this->purgeAuditRecord($id);
            }
            return $this->notify('Auditoría purgada.');
        }

        foreach ($ids as $id) {
            $record = $this->getModel($table)->find($id);
            if ($record) {
                AuditService::log($table, $id, 'd', $record->getAttributes());
            }
        }

        return $this->notify('Filas eliminadas.');
    }

    /**
     * Eliminación física real (Hard-delete) solo si ya no existe auditoría para esa fila
     */
    protected function purgeAuditRecord(string $auditId)
    {
        $audit = DynamicModel::fromTable('audit')->findOrFail($auditId);
        $targetTableId = $audit->table;
        $targetRowId   = $audit->row;
        $audit->delete();
        // Si ya no quedan registros de auditoría para esa fila, SE BORRA FÍSICAMENTE
        $hasRemaining = DynamicModel::fromTable('audit')
            ->where('table', $targetTableId)
            ->where('row', $targetRowId)
            ->exists();
        if (!$hasRemaining) {
            $tableName = TableMetadata::name($targetTableId);
            if ($tableName && \Illuminate\Support\Facades\Schema::hasTable($tableName)) {
                $record = DynamicModel::fromTable($tableName)->find($targetRowId);
                if ($record) {
                    app(DynamicHookService::class)->purge($tableName, $record);
                }
            }
        }
        return $this->notify('Registro de auditoría eliminado.');
    }
}