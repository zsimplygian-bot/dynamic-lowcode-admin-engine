<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DatabaseIEController extends Controller
{
    public function export()
    {
        $filename = 'backup-' . date('Y-m-d_H-i-s') . '.sql';

        return response()->streamDownload(function () {
            $tables = DB::select('SHOW TABLES');
            $dbName = config('database.connections.mysql.database');
            $key = "Tables_in_{$dbName}";

            echo "SET FOREIGN_KEY_CHECKS=0;\n\n";

            foreach ($tables as $table) {
                $tableName = $table->$key;

                $create = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
                echo "DROP TABLE IF EXISTS `{$tableName}`;\n";
                echo $create->{'Create Table'} . ";\n\n";

                $rows = DB::table($tableName)->get();
                foreach ($rows as $row) {
                    $values = array_map(function ($val) {
                        if (is_null($val)) return 'NULL';
                        return "'" . addslashes($val) . "'";
                    }, (array) $row);

                    echo "INSERT INTO `{$tableName}` VALUES (" . implode(', ', $values) . ");\n";
                }
                echo "\n";
            }

            echo "SET FOREIGN_KEY_CHECKS=1;\n";
        }, $filename, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'backup' => 'required|file',
        ]);

        try {
            $sql = file_get_contents($request->file('backup')->getRealPath());
            $sql = preg_replace('/^mysqldump:.*$/m', '', $sql);

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::unprepared($sql);
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            Inertia::flash('toast', [
                'type' => 'success', 
                'message' => __('Base de datos restaurada con éxito.')
            ]);
        } catch (\Throwable $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            Inertia::flash('toast', [
                'type' => 'error', 
                'message' => __('Ocurrió un error al importar el respaldo: ') . $e->getMessage()
            ]);
        }

        return back();
    }
}