<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use App\Services\{DynamicHook, DynamicValidation};
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\{HasMiddleware, Middleware};
use Illuminate\Support\Facades\DB;
class DynamicCrudController extends Controller implements HasMiddleware
{
    use HasNotify;
    public function __construct(protected DynamicHook $hooks, protected DynamicValidation $validator) {}
    public static function middleware(): array { return [ fn ($req, $next) => $req->user()?->hasRole('admin') ? $next($req) : abort(403, 'Unauthorized.') ]; }
    protected function getModel(string $t): DynamicModel { return DynamicModel::fromTable($t); }
    public function show(string $t, string $id) { return response()->json(['data' => $this->getModel($t)->findOrFail($id)]); }
    public function store(Request $req, string $t) { return $this->persist($req, $t); }
    public function update(Request $req, string $t, string $id) { return $this->persist($req, $t, $id); }
    public function destroy(string $t, string $id) { return $this->remove($t, $id); }
    public function destroyBulk(Request $req, string $t) { return $this->remove($t, $req->input('ids', [])); }
    protected function persist(Request $req, string $t, ?string $id = null)
    {
        $validated = $this->validator->validate($req, $t, (bool) $id);
        return DB::transaction(function () use ($req, $t, $id, $validated) {
            $record = $id ? $this->getModel($t)->findOrFail($id) : $this->getModel($t);
            $oldData = $id ? $record->getAttributes() : null;
            $payload = collect($validated)->except([$record->getKeyName(), '_token', '_method'])->all();
            $data = $this->hooks->beforeSave($req, $t, $payload, $oldData);
            $record->fill($data)->save();
            $this->hooks->afterSave($t, $record, $oldData);
            return $this->notify('Record ' . ($id ? 'updated' : 'created') . ' successfully.', data: ['id' => $record->getKey()]);
        });
    }
    protected function remove(string $t, string|int|array $id)
    {
        foreach ((array) $id as $rowId) {
            if (!$record = $this->getModel($t)->find($rowId)) continue;
            if (!$this->hooks->beforeDelete($t, $record)) return $this->notify('Cannot delete active record audit.', type: 'error');
            $record->delete();
        }
        return $this->notify($t === 'audit' ? 'Audit purged.' : 'Record(s) deleted.');
    }
}   