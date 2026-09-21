<?php
namespace App\Http\Controllers;

use App\Traits\HasNotify;
use Carbon\Carbon;

class DynamicValidationController extends Controller
{
    use HasNotify;

    public function validateByTable(string $tableName, array $data, bool $isUpdate = false): void
    {
        switch ($tableName) {
            case 'cita':
                if (isset($data['fecha']) && Carbon::parse($data['fecha'])->isPast()) {
                    $this->notify('La fecha de la cita no puede ser inferior a la actual.', 'error', 'fecha');
                }
                break;
        }
    }
}