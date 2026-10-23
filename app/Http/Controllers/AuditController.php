<?php
namespace App\Http\Controllers;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AuditController extends Controller
{
    public function show() { return Inertia::render('audit'); }
    public function columns()
    {
        return [
            ['accessor' => 'table', 'header' => 'TABLE'],
            ['accessor' => 'row_id', 'header' => 'ROW ID'],
            ['accessor' => 'action', 'header' => 'ACTION'],
            ['accessor' => 'user', 'header' => 'USER'],
            ['accessor' => 'payload', 'header' => 'PAYLOAD'],
            ['accessor' => 'at', 'header' => 'DATE'],
        ];
    }
    public function data(Request $request)
    {
        $query = DynamicModel::fromTable('audit as a')
            ->leftJoin('users as u', 'u.id', '=', 'a.users_id')
            ->select('a.table', 'a.row_id', 'a.action', 'u.name as user', 'a.payload', 'a.at')
            ->when($request->input('search'), fn ($q, $s) => $q->where(fn ($sub) => $sub->where('a.table', 'like', "%{$s}%")->orWhere('a.row_id', 'like', "%{$s}%")->orWhere('u.name', 'like', "%{$s}%")))
            ->when($request->input('from'), fn ($q, $f) => $q->where('a.at', '>=', $f))
            ->when($request->input('to'), fn ($q, $t) => $q->where('a.at', '<=', $t));
        $sortBy = $request->input('sort_by', 'a.at');
        $sortOrder = $request->input('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        $data = $query->orderBy($sortBy === 'at' ? 'a.at' : $sortBy, $sortOrder)->paginate((int) $request->input('per_page', 10));
        return ['data' => $data->items(), 'total' => $data->total(), 'page' => $data->currentPage(), 'per_page' => $data->perPage()];
    }
}