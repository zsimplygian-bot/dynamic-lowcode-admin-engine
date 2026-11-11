<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProjectDatabaseController extends Controller
{
    use HasNotify;

    /**
     * Obtiene la lista de bases de datos del servidor MySQL.
     */
    public static function getAvailableDatabases(): array
    {
        $systemDbs = ['information_schema', 'mysql', 'performance_schema', 'sys'];

        try {
            return collect(DB::select('SHOW DATABASES'))
                ->pluck('Database')
                ->reject(fn ($name) => in_array($name, $systemDbs))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            return [config('database.connections.mysql.database')];
        }
    }

    /**
     * Cambiar de base de datos activa y purgar caché.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'database' => 'required|string|max:100',
        ]);

        $dbName = $request->input('database');
        $available = self::getAvailableDatabases();

        if (!in_array($dbName, $available)) {
            return $this->notify("La base de datos '{$dbName}' no existe.", 'error');
        }

        // 1. Guardar la nueva base de datos en la sesión
        session(['active_db' => $dbName]);

        // 2. Limpiar la caché del servidor (roles, permisos, metadatos)
        Cache::flush();

        // 3. Reconectar la conexión MySQL
        Config::set('database.connections.mysql.database', $dbName);
        DB::purge('mysql');
        $conn = DB::reconnect('mysql');
        $conn->setDatabaseName($dbName);
        DB::statement("USE `{$dbName}`");

        // 4. Retornar con cabecera Clear-Site-Data para vaciar caché de red del navegador
        return $this->notify("Cambiado al proyecto / base de datos: {$dbName}")
            ->header('Clear-Site-Data', '"cache"');
    }

    /**
     * Crear una nueva base de datos y migrarle las tablas del sistema.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|alpha_dash|max:50',
        ]);

        $name = strtolower(trim($request->input('name')));
        $available = self::getAvailableDatabases();

        if (in_array($name, $available)) {
            return $this->notify("La base de datos '{$name}' ya existe.", 'error');
        }

        try {
            DB::statement("CREATE DATABASE `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            Config::set('database.connections.temp_db_creator', array_merge(
                config('database.connections.mysql'),
                ['database' => $name]
            ));

            Artisan::call('migrate', [
                '--database' => 'temp_db_creator',
                '--force' => true,
            ]);

            $currentUser = $request->user();
            if ($currentUser) {
                $copyRecords = function ($table, $queryModifier = null) {
                    if (!Schema::hasTable($table) || !Schema::connection('temp_db_creator')->hasTable($table)) {
                        return;
                    }
                    $targetColumns = Schema::connection('temp_db_creator')->getColumnListing($table);
                    $query = DB::table($table);
                    if ($queryModifier) {
                        $queryModifier($query);
                    }
                    foreach ($query->get() as $row) {
                        $data = collect((array) $row)->only($targetColumns)->toArray();
                        DB::connection('temp_db_creator')->table($table)->insert($data);
                    }
                };

                $copyRecords('roles');
                $copyRecords('permissions');
                $copyRecords('role_has_permissions');

                $userColumns = Schema::connection('temp_db_creator')->getColumnListing('users');
                $userData = collect($currentUser->getAttributes())->only($userColumns)->toArray();
                DB::connection('temp_db_creator')->table('users')->insert($userData);

                $copyRecords('model_has_roles', function ($q) use ($currentUser) {
                    $q->where('model_id', $currentUser->id);
                });
            }

            DB::purge('temp_db_creator');

            return $this->notify("Base de datos '{$name}' creada e inicializada correctamente.");
        } catch (\Throwable $e) {
            DB::purge('temp_db_creator');
            DB::statement("DROP DATABASE IF EXISTS `{$name}`");

            return $this->notify("Error al crear la base de datos: " . $e->getMessage(), 'error');
        }
    }
}