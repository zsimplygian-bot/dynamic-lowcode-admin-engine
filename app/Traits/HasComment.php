<?php
namespace App\Traits;
trait HasComment
{
    /**
     * Extrae un atributo específico del comentario o todo el mapa parseado.
     * Soporta flags sueltos ('readonly') y pares clave-valor ('label: Nombre', 'type: select').
     */
    protected function parseComment(?string $comment, ?string $key = null): mixed
    {
        if (!$comment) return $key ? null : [];
        $parsed = [];
        $raw = trim($comment);
        if (preg_match_all('/([a-zA-Z0-9_-]+)\s*:\s*([^;,\n]+)/', $raw, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $parsed[strtolower(trim($match[1]))] = trim($match[2]);
            }
            $raw = preg_replace('/[a-zA-Z0-9_-]+\s*:\s*[^;,\n]+/', '', $raw);
        }
        foreach (array_filter(array_map('trim', preg_split('/[\s,;]+/', $raw))) as $flag) {
            $parsed[strtolower($flag)] = true;
        }
        if ($key) {
            return $parsed[strtolower($key)] ?? null;
        }
        return $parsed;
    }
}