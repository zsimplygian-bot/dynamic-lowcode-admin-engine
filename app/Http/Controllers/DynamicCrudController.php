<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Services\{AuditService, DynamicHookService, DynamicValidationService};
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Http\Request;
class DynamicCrudController extends Controller
{
    use HasDynamicFileUpload, HasNotify;
    protected function getModel(string $table): DynamicModel { return DynamicModel::fromTable($table); }
    public function show(string $table, string $id) { return response()->json(['data' => $this->getModel($table)->findOrFail($id)]); }
    public function store(Request $request, string $table) { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $id) { return $this->persist($request, $table, $id); }
    public function destroy(string $table, string $id)
    {
        $record = $this->getModel($table)->findOrFail($id);
        app(DynamicHookService::class)->delete($table, $record);
        AuditService::log($table, $id, 'd');
        return $this->notify('Record deleted successfully.');
    }
    private function persist(Request $request, string $table, ?string $id = null)
    {
        $u = $id !== null;
        $model = $this->getModel($table);
        $record = $u ? $model->findOrFail($id) : $model->newInstance();
        $validated = app(DynamicValidationService::class)->validate($request, $table, $u);
        $finalData = $this->handleFilesUpload($request, $table, $validated, $u ? $record : null);
        $record->fill($finalData)->save();
        app(DynamicHookService::class)->afterSave($table, $record->toArray(), $u);
        AuditService::log($table, $record->getKey(), $u ? 'u' : 's', $u ? $finalData : null);
        return $this->notify("Record " . ($u ? 'updated' : 'created') . " successfully.", 'success', null, ['id' => $record->getKey()]);
    }
}