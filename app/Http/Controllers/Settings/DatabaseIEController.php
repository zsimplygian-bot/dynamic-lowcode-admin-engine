<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedTables};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class DatabaseIEController extends Controller
{
    use HasNotify, HasProtectedTables;
    private function log(Request $request, string $action): void
    {
        DB::table('database_history')->insert(['action' => $action, 'user_id' => auth()->id(), 'ip_address' => $request->ip(), 'at' => now()]);
    }
    private function getTables(): array { return array_map(fn ($t) => array_values((array) $t)[0], DB::select('SHOW TABLES')); }
    public function export(Request $request)
    {
        $this->log($request, 'e');
        $filename = 'backup-' . date('Y-m-d_H-i-s') . '.sql';
        return response()->streamDownload(function () {
            foreach ($this->getTables() as $table) {
                $create = DB::select("SHOW CREATE TABLE `{$table}`")[0]->{'Create Table'};
                echo "DROP TABLE IF EXISTS `{$table}`;\n{$create};\n\n";
                foreach (DB::table($table)->get()->chunk(200) as $chunk) {
                    $values = $chunk->map(fn ($r) => '(' . implode(', ', array_map(fn ($v) => is_null($v) ? 'NULL' : "'" . addslashes($v) . "'", (array) $r)) . ')');
                    echo "INSERT INTO `{$table}` VALUES\n" . $values->implode(",\n") . ";\n";
                }
                echo "\n";
            }
        }, $filename, ['Content-Type' => 'application/sql']);
    }
    public function import(Request $request)
    {
        $request->validate(['backup' => 'required|file', 'keep_protected' => 'nullable']);
        try {
            $pdo = DB::connection()->getPdo();
            $pdo->exec("SET SESSION sql_mode = '';");
            $keep = $request->boolean('keep_protected');
            foreach ($this->getTables() as $table) {
                if ($keep && method_exists($this, 'isProtected') && $this->isProtected($table)) continue;
                $pdo->exec("DROP TABLE IF EXISTS `{$table}`");
            }
            $sql = preg_replace('/^mysqldump:.*$/m', '', file_get_contents($request->file('backup')->getRealPath()));
            foreach (array_filter(array_map('trim', explode(";\n", $sql))) as $query) {
                $pdo->exec($query);
            }
            $this->log($request, 'i');
            return $this->notify('Base de datos restaurada con éxito.');
        } catch (\Throwable $e) {
            return $this->notify('Ocurrió un error al importar el respaldo: ' . $e->getMessage(), 'error');
        }
    }
}