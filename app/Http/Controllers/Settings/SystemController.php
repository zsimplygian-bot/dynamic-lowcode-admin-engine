<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Traits\HasNotify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Artisan, DB};
use Inertia\Inertia;

class SystemController extends Controller
{
    use HasNotify;

    public function show() 
    { 
        return Inertia::render('settings/system'); 
    }

    public function destroy(Request $request)
    {
        Artisan::call('optimize:clear');
        return $this->notify('Global system cache cleared successfully.');
    }

    public function executeQuery(Request $request)
    {
        $data = $request->validate([
            'query' => 'required|string',
        ]);

        try {
            $sql = trim($data['query']);

            // 1. Si es consulta de lectura (SELECT, SHOW, EXPLAIN, DESCRIBE)
            if (preg_match('/^\s*(select|show|explain|describe)\b/i', $sql)) {
                $results = DB::select($sql);
                $count = count($results);
                return $this->notify("Query executed successfully. {$count} rows returned.");
            }

            // 2. Si es CREATE TABLE, ALTER, DROP, INSERT, etc., usamos unprepared para soportar DDL puro
            DB::unprepared($sql);

            return $this->notify('SQL statement executed successfully in active database.');
        } catch (\Throwable $e) {
            return $this->notify('SQL Execution Error: ' . $e->getMessage(), 'error');
        }
    }
}