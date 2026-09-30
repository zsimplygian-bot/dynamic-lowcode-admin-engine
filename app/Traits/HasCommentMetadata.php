<?php
namespace App\Traits;
trait HasCommentMetadata
{
    protected function parseComment(?string $rawComment): array
    {
        preg_match('/icon:\s*([^\s]+)/i', $rawComment, $icon);
        preg_match('/color:\s*([^\s]+)/i', $rawComment, $color);
        preg_match('/label:\s*(.*?)(?=\s*(icon:|color:|$))/i', $rawComment, $label);
        return [
            'icon'  => $icon[1] ?? null,
            'color' => $color[1] ?? null,
            'label' => trim($label[1] ?? '') ?: null,
        ];
    }
    protected function buildComment(?string $icon = null, ?string $label = null, ?string $color = null): string
    {
        return trim(implode(' ', array_filter([
            $icon ? "icon: {$icon}" : null,
            $color ? "color: {$color}" : null,
            $label ? "label: {$label}" : null,
        ])));
    }
}