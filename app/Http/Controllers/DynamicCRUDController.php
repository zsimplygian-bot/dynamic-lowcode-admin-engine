<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Traits\{HasDynamicFileUpload, HasDynamicValidation, HasInertiaNotifications, HasProtectedTables};
use Illuminate\Http\{JsonResponse, RedirectResponse, Request};
class DynamicCRUDController extends Controller
{
    use HasDynamicFileUpload, HasDynamicValidation, HasInertiaNotifications, HasProtectedTables;
    protected function getModel(string $tableName): DynamicModel
    {
        $this->validateTable($tableName); return DynamicModel::fromTable($tableName);
    }
    public function show(string $tableName, string $id): JsonResponse
    {
        return response()->json([ 'data' => $this->getModel($tableName)->findOrFail($id), ]);
    }
    public function store(Request $request, string $tableName): RedirectResponse { return $this->persist($request, $tableName); }
    public function update(Request $request, string $tableName, string $id): RedirectResponse { return $this->persist($request, $tableName, $id); }
    public function destroy(string $tableName, string $id): RedirectResponse
    {
        $this->getModel($tableName)->findOrFail($id)->delete(); return $this->notifyAndRedirect('Registro eliminado correctamente.');
    }
    private function persist(Request $request, string $tableName, ?string $id = null): RedirectResponse
    {
        $isUpdate  = $id !== null;
        $model     = $this->getModel($tableName);
        $record    = $isUpdate ? $model->findOrFail($id) : $model->newInstance();
        $validated = $this->validateDynamicData($request, $tableName, $isUpdate);
        $finalData = $this->handleFilesUpload($request, $tableName, $validated, $isUpdate ? $record : null);
        $record->fill($finalData)->save();
        $message = $isUpdate ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.';
        return $this->notifyAndRedirect($message);
    }
}