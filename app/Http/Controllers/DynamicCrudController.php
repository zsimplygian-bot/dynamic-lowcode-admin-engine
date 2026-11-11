<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Services\DynamicHookService;
use App\Traits\{HasDynamicFileUpload, HasNotify};
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\{HasMiddleware, Middleware};
class DynamicCrudController extends Controller implements HasMiddleware
{
    use HasDynamicFileUpload, HasNotify;
    public function __construct(protected DynamicHookService $hooks) {}
    public static function middleware(): array
    {
        return [
            fn ($request, $next) => $request->user()?->hasRole('admin') ? $next($request) : abort(403, 'Unauthorized.')
        ];
    }
    protected function getModel(string $table): DynamicModel { return DynamicModel::fromTable($table); }
    public function show(string $table, string $id) { return response()->json(['data' => $this->getModel($table)->findOrFail($id)]); }
    public function store(Request $request, string $table) { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $id) { return $this->persist($request, $table, $id); }
    public function destroy(string $table, string $id) { return $this->remove($table, $id); }
    public function destroyBulk(Request $request, string $table) { return $this->remove($table, $request->input('ids', [])); }
    protected function persist(Request $request, string $table, ?string $id = null)
    {
        $record = $id ? $this->getModel($table)->findOrFail($id) : $this->getModel($table);
        $oldData = $id ? $record->getAttributes() : null;
        $data = $this->handleFilesUpload($request, $table, $request->all(), $oldData);
        $record->fill($data)->save();
        $this->hooks->afterSave($table, $record, $oldData);
        return $this->notify('Record ' . ($id ? 'updated' : 'created') . ' successfully.', ['id' => $record->getKey()]);
    }
    protected function remove(string $table, string|int|array $id)
    {
        foreach ((array) $id as $rowId) {
            if (!$record = $this->getModel($table)->find($rowId)) continue;
            if (!$this->hooks->beforeDelete($table, $record)) return $this->notify('Cannot delete active record audit.', type: 'error');
            $this->deleteRecordFiles($record->getAttributes());
            $record->delete();
        }
        return $this->notify($table === 'audit' ? 'Audit purged.' : 'Record(s) deleted.');
    }
}