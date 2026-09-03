<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Traits\{HasAuditFields, HasDynamicFileUpload, HasDynamicValidation, HasInertiaNotifications, HasProtectedTables};
use Illuminate\Http\{JsonResponse, RedirectResponse, Request};
use Illuminate\Support\Facades\DB;
class DynamicCRUDController extends Controller
{
    use HasAuditFields, HasDynamicFileUpload, HasDynamicValidation, HasInertiaNotifications, HasProtectedTables;
    protected function getModel(string $tabla): DynamicModel
    {
        $this->validateTable($tabla);
        return DynamicModel::fromTable($tabla);
    }
    public function show(string $tabla, string $id): JsonResponse
    {
        $registro = $this->getModel($tabla)->findOrFail($id);
        return response()->json(['success' => true, 'data' => $registro]);
    }
    public function store(Request $request, string $tabla): RedirectResponse
    {
        $this->persist($request, $tabla);
        return $this->notifyAndRedirect('Registro creado correctamente.');
    }
    public function update(Request $request, string $tabla, string $id): RedirectResponse
    {
        $this->persist($request, $tabla, $id);
        return $this->notifyAndRedirect('Registro actualizado correctamente.');
    }
    public function destroy(string $tabla, string $id): RedirectResponse
    {
        DB::transaction(function () use ($tabla, $id) {
            $model = $this->getModel($tabla)->findOrFail($id);
            $this->deleteRecordFiles($model);
            $model->delete();
        });
        return $this->notifyAndRedirect('Registro eliminado correctamente.');
    }
    private function persist(Request $request, string $tabla, ?string $id = null): void
    {
        DB::transaction(function () use ($request, $tabla, $id) {
            $isUpdate = $id !== null;
            $model = $this->getModel($tabla);
            $existingRecord = $isUpdate ? $model->findOrFail($id) : null;
            $validated = $this->validateDynamicData($request, $tabla, $isUpdate);
            $data = $isUpdate ? $this->applyUpdateAudit($validated, $request) : $this->applyCreationAudit($validated, $request);
            $finalData = $this->handleFilesUpload($request, $tabla, $data, $existingRecord);
            if ($isUpdate) { $existingRecord->update($finalData);
            } else { $model->create($finalData);
            }
        });
    }
}