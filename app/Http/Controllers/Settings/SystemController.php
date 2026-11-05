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

    public function show() { return Inertia::render('settings/system'); }

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
            $isSelect = preg_match('/^\s*(select|show|explain|describe)\b/i', $sql);
            if ($isSelect) {
                $results = DB::select($sql);
                $count = count($results);
                return $this->notify("Query executed successfully. {$count} rows returned.");
            }
            $affected = DB::affectingStatement($sql);
            return $this->notify("Query executed successfully. {$affected} rows affected.");
        } catch (\Throwable $e) {
            return $this->notify('SQL Execution Error: ' . $e->getMessage(), 'error');
        }
    }
}