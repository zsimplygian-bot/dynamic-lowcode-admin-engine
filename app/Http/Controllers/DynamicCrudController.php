<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Services\DynamicValidationService;
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Http\Request;
class DynamicCrudController extends Controller
{
    use HasDynamicFileUpload, HasNotify;
    protected function getModel(string $tableName): DynamicModel { return DynamicModel::fromTable($tableName); }
    public function show(string $tableName, string $id) { return response()->json(['data' => $this->getModel($tableName)->findOrFail($id)]); }
    public function store(Request $request, string $tableName) { return $this->persist($request, $tableName); }
    public function update(Request $request, string $tableName, string $id) { return $this->persist($request, $tableName, $id); }
    public function destroy(string $tableName, string $id) { $this->getModel($tableName)->findOrFail($id)->delete(); return $this->notify('Record deleted successfully.'); }
    private function persist(Request $request, string $tableName, ?string $id = null)
    {
        $isUpdate  = $id !== null;
        $model     = $this->getModel($tableName);
        $record    = $isUpdate ? $model->findOrFail($id) : $model->newInstance();
        $validated = app(DynamicValidationService::class)->validate($request, $tableName, $isUpdate);
        $finalData = $this->handleFilesUpload($request, $tableName, $validated, $isUpdate ? $record : null);
        $record->fill($finalData)->save();
        return $this->notify("Record " . ($isUpdate ? 'updated' : 'created') . " successfully.");
    }
}