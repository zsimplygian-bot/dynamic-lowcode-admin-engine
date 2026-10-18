<?php
namespace App\Services;
use App\Traits\HasNotify;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
class DynamicValidationService
{
    use HasNotify;
    private const FIELD_PRESETS = [
        'dni'      => ['digits:8'],
        'phone'    => ['digits:9'],
        'telefono' => ['digits:9'],
        'celular'  => ['digits:9'],
        'email'    => ['string', 'email'],
        'correo'   => ['string', 'email'],
    ];
    private const TYPE_TO_RULE = [
        'number'   => 'numeric',
        'checkbox' => 'boolean',
        'date'     => 'date',
    ];
    public function validate(Request $request, string $table, bool $isUpdate = false): array
    {
        $rules = [];
        foreach (Schema::getColumns($table) as $col) {
            if (!empty($col['auto_increment'])) continue;
            $name = $col['name'];
            $type = $col['type'];
            $uiType = ColumnMetadata::inputType($name, $type);
            $options = ColumnMetadata::parseEnum($type);
            $columnRules = [
                (!($col['nullable'] ?? true) && ($col['default'] ?? null) === null) ? 'required' : 'nullable',
            ];
            if (!empty($options)) { $columnRules[] = Rule::in(array_column($options, 'id'));
            } else {
                $ruleType = str_ends_with($name, '_id') ? 'numeric' : (self::TYPE_TO_RULE[$uiType] ?? 'string');
                array_push($columnRules, ...(self::FIELD_PRESETS[$name] ?? [$ruleType]));
                if ($ruleType === 'string' && !str_contains($type, 'text') && sscanf($type, '%*[^0-9]%d', $len) === 1 && $len > 0) {
                    $columnRules[] = "max:{$len}";
                }
            }
            $rules[$name] = $columnRules;
        }
        if ($isUpdate) { $rules = array_intersect_key($rules, $request->all()); }
        foreach ($request->all() as $key => $val) {
            if (isset($rules[$key]) && ($val === '' || $val === null)) { $rules[$key] = ['nullable']; }
        }
        foreach ($request->allFiles() as $file => $_) {
            if (isset($rules[$file])) { $rules[$file] = [$isUpdate ? 'nullable' : 'required', 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']; }
        }
        $validated = $request->validate($rules);
        $this->applyBusinessRules($table, $validated, $isUpdate);
        return $validated;
    }
    private function applyBusinessRules(string $table, array $data, bool $isUpdate): void
    {
        if ($table === 'cita' && isset($data['fecha']) && Carbon::parse($data['fecha'])->isPast()) { $this->notify('La fecha de la cita no puede ser inferior a la actual.', 'error', 'fecha'); }
    }
}