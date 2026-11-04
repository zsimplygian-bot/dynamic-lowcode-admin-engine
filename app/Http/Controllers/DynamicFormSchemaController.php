<?php
namespace App\Http\Controllers;
use App\Services\ColumnMetadata;
use App\Traits\HasColumnLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
class DynamicFormSchemaController extends Controller
{
    use HasColumnLabel;
    public function getTableSchema(string $table, string $mode = 'form'): array
    {
        $isFilter = $mode === 'filter';
        $fields = [];
        foreach (Schema::getColumns($table) as $col) {
            $name = $col['name'];
            $comment = $col['comment'] ?? null;
            $isImage = (bool) $this->parseComment($comment, 'image');
            $uiType = $isImage ? 'file' : ColumnMetadata::inputType($name, $col['type']);
            if ($isFilter && $uiType === 'file') continue;
            $type = (!$isFilter && $name === 'id') ? 'hidden' : ($isFilter && $uiType === 'datetime-local' ? 'date' : $uiType);
            $field = ['name' => $name, 'label' => $this->inferLabel($name, $comment) . ($type === 'checkbox' ? '?' : ''), 'type' => $type];
            if (!$isFilter && !$col['nullable'] && $col['default'] === null && $name !== 'id') $field['required'] = true;
            if ($this->parseComment($comment, 'readonly')) $field['readonly'] = true;
            if (!$isFilter && $col['default'] !== null) $field['defaultValue'] = $col['default'];
            if ($options = ColumnMetadata::parseEnum($col['type'])) $field['options'] = $options;
            if ($type === 'file') $field['accept'] = $isImage ? 'image/*' : '*/*';
            $fields[] = $field;
        }
        return $fields;
    }
    public function fields(Request $request, string $table) { return response()->json($this->getTableSchema($table, $request->input('mode', 'form'))); }
}