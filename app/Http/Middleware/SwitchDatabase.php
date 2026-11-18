<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class SwitchDatabase
{
    public function handle(Request $request, Closure $next)
    {
        $db = session('active_db');
        if (blank($db)) {
            return $request->is('/', 'database/switch*') ? $next($request) : redirect('/');
        }
        config(['database.connections.mysql.database' => $db]);
        DB::purge('mysql');
        return $next($request);
    }
}