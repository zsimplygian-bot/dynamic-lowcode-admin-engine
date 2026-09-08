<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Traits\HasInertiaNotifications;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\{RedirectResponse, Request};
use Illuminate\Support\Facades\Schema;
class TableFieldController extends Controller
{
    use HasInertiaNotifications;
    private const TYPE_MAP = [
        'varchar'  => 'string',
        'text'     => 'text',
        'int'      => 'integer',
        'bigint'   => 'bigInteger',
        'tinyint'  => 'boolean',
        'datetime' => 'datetime',
        'date'     => 'date',
        'decimal'  => 'decimal',
        'json'     => 'json',
    ];
    private function cleanName(string $name): string { return str_contains($name, '.') ? last(explode('.', $name)) : $name; }
    public function store(Request $request, string $table): RedirectResponse { return $this->persist($request, $table); }
    public function update(Request $request, string $table, string $field): RedirectResponse { return $this->persist($request, $table, $field); }
    private function persist(Request $request, string $table, ?string $currentField = null): RedirectResponse
    {
        $cleanTable = $this->cleanName($table);
        $name       = strtolower(trim($request->input('name')));
        $type       = self::TYPE_MAP[$request->input('type')] ?? 'string';
        $length     = (int) $request->input('raw_type');
        $isAuto     = $request->boolean('auto_increment');
        $buildColumn = function (Blueprint $t) use ($request, $name, $type, $length, $isAuto) {
            $column = match (true) {
                $isAuto => $type === 'bigInteger' ? $t->bigIncrements($name) : $t->increments($name),
                $type === 'string'  => $t->string($name, $length ?: 255),
                $type === 'decimal' => $t->decimal($name, $length ?: 10, 2),
                $type === 'integer' => $t->integer($name, false, false),
                default => $t->{$type}($name),
            };
            if ($request->boolean('is_nullable') && !$isAuto) $column->nullable();
            if (filled($val = $request->input('default_value')) && !$isAuto) $column->default($val === 'null' ? null : $val);
            if (filled($com = $request->input('comment'))) $column->comment($com);
            if (filled($ord = $request->input('order'))) strtoupper($ord) === 'FIRST' ? $column->first() : $column->after($ord);
            return $column;
        };
        if ($currentField) {
            if ($currentField !== $name) Schema::table($cleanTable, fn (Blueprint $t) => $t->renameColumn($currentField, $name));
            Schema::table($cleanTable, fn (Blueprint $t) => $buildColumn($t)->change());
        } else {
            Schema::table($cleanTable, fn (Blueprint $t) => $buildColumn($t));
        }
        return $this->notifyAndRedirect("Campo '{$name}' " . ($currentField ? 'actualizado' : 'creado') . ' con éxito.');
    }
    public function destroy(string $table, string $field): RedirectResponse
    {
        Schema::table($this->cleanName($table), fn (Blueprint $t) => $t->dropColumn($field));
        return $this->notifyAndRedirect("Campo '{$field}' eliminado correctamente.");
    }
}