<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class SwitchDatabase
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $activeDb = session('active_db');

        if ($activeDb && $activeDb !== Config::get('database.connections.mysql.database')) {
            // 1. Cambiar config
            Config::set('database.connections.mysql.database', $activeDb);

            // 2. Limpiar instancias cacheadas de la fachada Schema
            Schema::clearResolvedInstances();

            // 3. Purgar y reconectar
            DB::purge('mysql');
            $connection = DB::reconnect('mysql');
            $connection->setDatabaseName($activeDb);

            // 4. Forzar el cambio directo en la sesión MySQL
            DB::statement("USE `{$activeDb}`");
        }

        return $next($request);
    }
}