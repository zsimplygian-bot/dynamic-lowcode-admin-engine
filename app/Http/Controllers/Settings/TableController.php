<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Services\TableMetadata;
use App\Traits\{HasNotify, HasProtectedTables};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\Inertia;
class TableController extends Controller
{
    use HasNotify, HasProtectedTables;
    public function index() { return Inertia::render('settings/table', ['tables' => TableMetadata::all(includeStats: true)]); }
    public function store(Request $request) { return $this->persist($request); }
    public function update(Request $request, string $tableName) { return $this->persist($request, $tableName); }
    public function destroy(string $tableName) { Schema::dropIfExists($tableName); return $this->notify("Table '{$tableName}' deleted."); }
    private function persist(Request $request, ?string $current = null)
    {
        $data = $request->validate([
            'name'  => 'required|string|alpha_dash|max:50',
            'label' => 'nullable|string|max:50',
            'icon'  => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
        ]);
        $name = strtolower($data['name']);
        if ($this->isProtected($name)) return $this->notify("Name '{$name}' is reserved.", 'error', 'name');
        if ($current !== $name && Schema::hasTable($name)) return $this->notify("Table '{$name}' already exists.", 'error', 'name');
        $id = $current ? TableMetadata::id($current) : TableMetadata::generateUniqueId();
        $comment = TableMetadata::build($data['icon'] ?? null, $data['label'] ?? null, $data['color'] ?? null, $id);
        if ($current) {
            if ($current !== $name) {
                Schema::table($current, fn ($t) => $t->renameColumn($current, $name));
                Schema::rename($current, $name);
            }
            DB::statement("ALTER TABLE `{$name}` COMMENT = '{$comment}'");
        } else {
            Schema::create($name, fn ($t) => [$t->comment($comment), $t->increments('id'), $t->string($name, 50)]);
        }
        return $this->notify("Table '{$name}' " . ($current ? 'updated' : 'created') . ' successfully.');
    }
}