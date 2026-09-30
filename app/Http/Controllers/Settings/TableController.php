<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedTables, HasTableMetadata};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Schema};
use Inertia\Inertia;
class TableController extends Controller
{
    use HasNotify, HasProtectedTables, HasTableMetadata;
    public function index()
    {
        return Inertia::render('settings/table', [
            'tables' => $this->getTableMetadata(includeStats: true),
        ]);
    }
    public function store(Request $request) { return $this->persist($request); }
    public function update(Request $request, string $tableName) { return $this->persist($request,$tableName); }
    private function persist(Request $request, ?string $current = null)
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'alpha_dash', 'max:50'],
            'label' => ['nullable', 'string', 'max:50'],
            'icon'  => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:50'],
        ]);
        $name = strtolower(trim($data['name']));
        $comment = $this->buildComment($data['icon'] ?? null, $data['label'] ?? null, $data['color'] ?? null);
        if ($this->isProtected($name)) {
            $this->notify("The name '{$name}' is reserved by the system.", 'error', 'name');
        }
        if ($current !== $name && Schema::hasTable($name)) {
            $this->notify("Table '{$name}' already exists.", 'error', 'name');
        }
        if ($current) {
            if ($current !== $name) {
                Schema::table($current, function ($table) use ($current, $name) {
                    foreach (["id_{$current}" => "id_{$name}", $current => $name] as $from => $to) {
                        if (Schema::hasColumn($current, $from)) $table->renameColumn($from, $to);
                    }
                });
                Schema::rename($current, $name);
            }
            $escaped = addslashes($comment);
            DB::statement("ALTER TABLE `{$name}` COMMENT = '{$escaped}'");
        } else {
            Schema::create($name, function ($table) use ($name, $comment) {
                if ($comment) $table->comment($comment);
                $table->increments("id_{$name}");
                $table->string($name, 50);
                $table->unsignedInteger('creater_id');
                $table->unsignedInteger('updater_id')->nullable();
                $table->timestamps();
            });
        }
        $action = $current ? 'updated' : 'created';
        return $this->notify("Table '{$name}' {$action} successfully.");
    }
    public function destroy(string $tableName)
    {
        Schema::withoutForeignKeyConstraints(fn () => Schema::dropIfExists($tableName)); return $this->notify("Table '{$tableName}' deleted successfully.");
    }
}