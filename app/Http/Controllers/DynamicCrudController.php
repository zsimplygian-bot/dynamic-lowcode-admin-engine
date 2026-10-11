<?php
namespace App\Http\Controllers;

use App\Models\DynamicModel;
use App\Services\{AuditService, DynamicHookService, DynamicValidationService};
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Http\Request;

class DynamicCrudController extends Controller
{
    use HasDynamicFileUpload, HasNotify;

    protected function getModel(string $tableName): DynamicModel { return DynamicModel::fromTable($tableName); }
    public function show(string $tableName, string $id) { return response()->json(['data' => $this->getModel($tableName)->findOrFail($id)]); }
    public function store(Request $request, string $tableName) { return $this->persist($request, $tableName); }
    public function update(Request $request, string $tableName, string $id) { return $this->persist($request, $tableName, $id); }

    public function destroy(string $tableName, string $id)
    {
        $record = $this->getModel($tableName)->findOrFail($id);
        $data = $record->toArray();
        $record->delete();

        app(DynamicHookService::class)->afterDelete($tableName, $data);
        AuditService::log($tableName, $id, 'd');

        return $this->notify('Record deleted successfully.');
    }

    private function persist(Request $request, string $tableName, ?string $id = null)
    {
        $u = $id !== null;
        $model = $this->getModel($tableName);
        $record = $u ? $model->findOrFail($id) : $model->newInstance();
        $validated = app(DynamicValidationService::class)->validate($request, $tableName, $u);
        $finalData = $this->handleFilesUpload($request, $tableName, $validated, $u ? $record : null);
        $record->fill($finalData)->save();

        app(DynamicHookService::class)->afterSave($tableName, $record->toArray(), $u);
        AuditService::log($tableName, $record->getKey(), $u ? 'u' : 's', $u ? $finalData : null);

        return $this->notify("Record " . ($u ? 'updated' : 'created') . " successfully.");
    }
}