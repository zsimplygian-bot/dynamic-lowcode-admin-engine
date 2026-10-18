<?php
namespace App\Http\Controllers;
use App\Services\ColumnMetadata;
use App\Traits\HasColumnLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
class DynamicFormSchemaController extends Controller
{
    use HasColumnLabel;
    public function getTableSchema(string $table, string $mode = 'form'): array
    {
        $fields = [];
        foreach (Schema::getColumns($table) as $col) {
            $name = $col['name'];
            $isPrimary = $name === 'id';
            $uiType = ColumnMetadata::inputType($name, $col['type']);
            if ($mode === 'filter' && $uiType === 'file') continue;
            $type = ($isPrimary && $mode !== 'filter') ? 'hidden' : $uiType;
            $label = $this->inferLabel($name, $col['comment'] ?? null) . ($type === 'checkbox' ? '?' : '');
            $isRequired = !$col['nullable'] && $col['default'] === null && !$isPrimary && empty($col['auto_increment']) && $mode !== 'filter';
            $field = [ 'name'  => $name, 'label' => $label, 'type'  => $type, ];
            if ($isRequired) $field['required'] = true;
            if ($mode !== 'filter' && $col['default'] !== null) $field['defaultValue'] = $this->parseDefaultValue($col['default'], $type);
            if ($options = ColumnMetadata::parseEnum($col['type'])) $field['options'] = $options;
            if ($type === 'file') $field['accept'] = Str::contains($name, ['imagen', 'icon', 'logo', 'avatar', 'photo', 'foto']) ? 'image/*' : '*/*';
            $fields[] = $field;
        }
        return $fields;
    }
    public function fields(Request $request, string $table) { return response()->json($this->getTableSchema($table, $request->input('mode', 'form'))); }
    private function parseDefaultValue(mixed $default, string $type): mixed
    {
        $val = trim((string) $default, "'\"");
        if ($type === 'checkbox' || $type === 'boolean') return in_array(strtolower($val), ['1', 'true', '1::boolean']);
        if ($type === 'number') return is_numeric($val) ? $val + 0 : $val;
        return $val;
    }
}