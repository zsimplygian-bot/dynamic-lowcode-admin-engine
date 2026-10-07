<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
class LookupController extends Controller
{
    public function index(Request $request, string $campo)
    {
        $table = Str::before($campo, '_id');
        return response()->json(
            DynamicModel::fromTable($table)
                ->select('id', "{$table} as label")
                ->when($request->query('id'), fn($q, $id) => $q->where('id', $id), fn($q) => $q->orderBy($table))
                ->get()
        );
    }
}