<?php
namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\{HasNotify, HasProtectedTables};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseIEController extends Controller
{
    use HasNotify, HasProtectedTables;

    public function export(Request $request)
    {
        DB::table('database_history')->insert([
            'action' => 'e',
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'at' => now(),
        ]);

        $filename = 'backup-' . date('Y-m-d_H-i-s') . '.sql';

        return response()->streamDownload(function () {
            $tables = DB::select('SHOW TABLES');$dbName = config('database.connections.mysql.database');
            $key = "Tables_in_{$dbName}";

            echo "SET FOREIGN_KEY_CHECKS=0;\n\n";

            foreach ($tables as $table) {$tableName = $table->$key ?? array_values((array) $table)[0];$create = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];

                echo "DROP TABLE IF EXISTS `{$tableName}`;\n";
                echo $create->{'Create Table'} . ";\n\n";

                $rows = DB::table($tableName)->get();$batch = [];

                foreach ($rows as $row) {$values = array_map(fn($val) => is_null($val) ? 'NULL' : "'" . addslashes($val) . "'", (array) $row);
                    $batch[] = '(' . implode(', ', $values) . ')';

                    if (count($batch) === 200) {
                        echo "INSERT INTO `{$tableName}` VALUES\n" . implode(",\n", $batch) . ";\n";
                        $batch = [];
                    }
                }

                if (!empty($batch)) {
                    echo "INSERT INTO `{$tableName}` VALUES\n" . implode(",\n", $batch) . ";\n";
                }
                echo "\n";
            }

            echo "SET FOREIGN_KEY_CHECKS=1;\n";
        }, $filename, ['Content-Type' => 'application/sql']);
    }

    public function import(Request $request)
    {
        $request->validate([
            'backup' => 'required|file',
            'keep_protected' => 'nullable',
        ]);

        try {
            $pdo = DB::connection()->getPdo();$pdo->exec("SET SESSION sql_mode = '';");
            $pdo->exec('SET FOREIGN_KEY_CHECKS=0;');

            $dbName = config('database.connections.mysql.database');$tables = DB::select('SHOW TABLES');
            $key = "Tables_in_{$dbName}";

            // 1. Borrar todas las tablas existentes (omitir las protegidas si keep_protected está activo)
            $keepProtected =$request->boolean('keep_protected');

            foreach ($tables as$table) {
                $tableName =$table->$key ?? array_values((array) $table)[0];

                if ($keepProtected && method_exists($this, 'isProtected') && $this->isProtected($tableName)) {
                    continue;
                }

                $pdo->exec("DROP TABLE IF EXISTS `{$tableName}`");
            }

            // 2. Leer y procesar las sentencias del archivo de respaldo
            $sql = file_get_contents($request->file('backup')->getRealPath());$sql = preg_replace('/^mysqldump:.*$/m', '', $sql);

            $queries = array_filter(array_map('trim', explode(";\n", $sql)));

            foreach ($queries as$query) {
                if (empty($query)) continue;
                $pdo->exec($query);
            }

            $pdo->exec('SET FOREIGN_KEY_CHECKS=1;');

            DB::table('database_history')->insert([
                'action' => 'i',
                'user_id' => auth()->id(),
                'ip_address' => $request->ip(),
                'at' => now(),
            ]);

            return $this->notify('Base de datos restaurada con éxito.');
        } catch (\Throwable $e) {
            DB::connection()->getPdo()->exec('SET FOREIGN_KEY_CHECKS=1;');
            return $this->notify('Ocurrió un error al importar el respaldo: ' . $e->getMessage(), 'error');
        }
    }
}