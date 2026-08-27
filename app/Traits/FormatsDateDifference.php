<?php
namespace App\Traits;

use Carbon\Carbon;

trait FormatsDateDifference
{
    /**
     * Calcula la diferencia legible en años y meses entre dos fechas o desde una fecha hasta hoy.
     *
     * @param string|\DateTimeInterface|null $dateStart Fecha inicial (ej. fecha de nacimiento, inicio de contrato).
     * @param string|\DateTimeInterface|null $dateEnd   Fecha final (por defecto es el momento actual).
     * @param string $defaultText                       Texto a retornar si la fecha inicial es nula.
     * @return string
     */
    public function formatYearsAndMonths($dateStart, $dateEnd = null, string $defaultText = 'N/A'): string
    {
        if (!$dateStart) {
            return $defaultText;
        }

        $start = Carbon::parse($dateStart);
        $end = $dateEnd ? Carbon::parse($dateEnd) : now();

        $diff = $start->diff($end);

        return match (true) {
            $diff->y < 1 => $diff->m . ' ' . ($diff->m === 1 ? 'mes' : 'meses'),
            $diff->m === 0 => $diff->y . ' ' . ($diff->y === 1 ? 'año' : 'años'),
            default => "{$diff->y} " . ($diff->y === 1 ? 'año' : 'años') . " y {$diff->m} " . ($diff->m === 1 ? 'mes' : 'meses'),
        };
    }
}