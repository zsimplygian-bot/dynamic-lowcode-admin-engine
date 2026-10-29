<?php
namespace App\Traits;
use Illuminate\Support\Str;

trait HasColumnLabel
{
    protected function inferLabel(string $column, ?string $comment = null): string
    {
        $clean = str_ends_with($column, '_id') ? substr($column, 0, -3) : $column;
        if ($comment) {
            $commentClean = trim(str_ireplace('readonly', '', $comment));
            if (str_contains($commentClean, 'label:')) { return trim(substr($commentClean, strpos($commentClean, 'label:') + 6)); }
            if ($commentClean !== '') { return str_replace('_', ' ', $commentClean); }
        }
        return Str::upper(str_replace('_', ' ', $clean));
    }
}