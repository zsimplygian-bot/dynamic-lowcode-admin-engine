<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class DatabaseIEController extends Controller
{
    use HasNotify;
    public function export()
    {
        $filename = 'backup-' . date('Y-m-d_H-i-s') . '.sql';
        return response()->streamDownload(function () {
            $tables = DB::select('SHOW TABLES');
            $dbName = config('database.connections.mysql.database');
            $key = "Tables_in_{$dbName}";
            // Desactivamos el modo estricto y la verificación de llaves foráneas en el respaldo
            echo "SET SESSION sql_mode = '';\n";
            echo "SET FOREIGN_KEY_CHECKS=0;\n\n";
            foreach ($tables as $table) {
                $tableName = $table->$key ?? array_values((array) $table)[0];
                $create = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
                echo "DROP TABLE IF EXISTS `{$tableName}`;\n";
                echo $create->{'Create Table'} . ";\n\n";
                $rows = DB::table($tableName)->get();
                $batch = [];
                foreach ($rows as $row) {
                    $values = array_map(function ($val) {
                        return is_null($val) ? 'NULL' : "'" . addslashes($val) . "'";
                    }, (array) $row);
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
        }, $filename, [ 'Content-Type' => 'application/sql' ]);
    }
    public function import(Request $request)
    {
        $request->validate([ 'backup' => 'required|file' ]);
        try {
            $sql = file_get_contents($request->file('backup')->getRealPath());
            $sql = preg_replace('/^mysqldump:.*$/m', '', $sql);
            // Desactiva temporalmente el modo estricto para evitar errores por '0000-00-00 00:00:00'
            DB::statement("SET SESSION sql_mode = '';");
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::unprepared($sql);
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return $this->notify('Base de datos restaurada con éxito.');
        } catch (\Throwable $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return $this->notify('Ocurrió un error al importar el respaldo: ' . $e->getMessage(), 'error');
        }
    }
}