<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Services\{Audit, Database};
use App\Traits\{HasNotify, HasProtectedTables};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Artisan, Cache, Config, DB, Schema};
use Inertia\Inertia;

class DatabaseController extends Controller
{
    use HasNotify, HasProtectedTables;
    public function index(Database $database)
    {
        return Inertia::render('settings/database', [
            'database' => [
                'current'   => session('active_db'),
                'available' => $database->all(),
            ],
        ]);
    }
    public function store(Request $request) { return $this->persist($request); }
    public function update(Request $request, string $database) { return $this->persist($request, $database); }
    public function destroy(string $database)
    {
        if ($database === session('active_db')) return $this->notify('Cannot delete active database.', 'error', 'name');
        DB::statement("DROP DATABASE `{$database}`");
        return $this->notify("Database '{$database}' deleted successfully.");
    }
    private function persist(Request $request, ?string $current = null)
    {
        $name = strtolower($request->validate(['name' => 'required|alpha_dash|max:50'])['name']);
        if ($current && $name !== $current) {
            DB::statement("CREATE DATABASE `{$name}`");
            $tables = array_column(DB::select("SHOW TABLES FROM `{$current}`"), "Tables_in_{$current}");
            if ($tables) DB::statement('RENAME TABLE ' . implode(', ', array_map(fn ($t) => "`{$current}`.`{$t}` TO `{$name}`.`{$t}`", $tables)));
            DB::statement("DROP DATABASE `{$current}`");
            if (session('active_db') === $current) session(['active_db' => $name]);
        } elseif (!$current) {
            DB::statement("CREATE DATABASE `{$name}`");
            config(['database.connections.temp' => [...config('database.connections.mysql'), 'database' => $name]]);
            Artisan::call('migrate', ['--database' => 'temp', '--force' => true]);
            DB::purge('temp');
        }
        return $this->notify("Database '{$name}' " . ($current ? 'updated' : 'created') . ' successfully.');
    }
    public function switch(Request $request)
    {
        $db = $request->validate(['database' => 'required|string'])['database'];
        session(['active_db' => $db]);
        return $this->notify("Switched to database: {$db}");
    }
    public function export()
    {
        Audit::log(action: 'e');
        $db = session('active_db');
        return response()->streamDownload(function () {
            foreach (Schema::getTables() as $table) {
                $t = $table['name'];
                $createRow = (array) (DB::select("SHOW CREATE TABLE `{$t}`")[0] ?? []);
                $create = array_values($createRow)[1] ?? null;
                if (!$create) continue;
                echo "DROP TABLE IF EXISTS `{$t}`;\n{$create};\n\n";
                foreach (DB::table($t)->get()->chunk(200) as $chunk) {
                    $values = $chunk->map(fn ($r) => '(' . implode(', ', array_map(fn ($v) => is_null($v) ? 'NULL' : "'" . addslashes($v) . "'", (array) $r)) . ')');
                    echo "INSERT INTO `{$t}` VALUES\n" . $values->implode(",\n") . ";\n";
                }
                echo "\n";
            }
        }, "{$db}-" . date('Y-m-d_H-i-s') . '.sql', ['Content-Type' => 'application/sql']);
    }
    public function import(Request $request)
    {
        $request->validate(['backup' => 'required|file']);
        $keep = $request->boolean('keep_protected');
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        foreach (Schema::getTables() as $table) {
            $t = $table['name'];
            if (!$keep || !$this->isProtected($t)) DB::statement("DROP TABLE IF EXISTS `{$t}`");
        }
        $sql = preg_replace('/^mysqldump:.*$/m', '', file_get_contents($request->file('backup')->getRealPath()));
        DB::unprepared($sql);
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Audit::log(action: 'i');
        return $this->notify('Database restored successfully.');
    }
    public function purge()
    {
        foreach (Schema::getTableListing() as $table) {
            if ($table === 'audit') DB::table('audit')->truncate();
            elseif (!$this->isProtected($table)) Schema::dropIfExists($table);
        }
        return $this->notify('Tables purged successfully.');
    }
}