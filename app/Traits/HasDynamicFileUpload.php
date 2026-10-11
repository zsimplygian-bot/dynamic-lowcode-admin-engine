<?php
namespace App\Traits;
use Illuminate\Http\Request;
trait HasDynamicFileUpload
{
    use HasImageProcessing;
    protected function handleFilesUpload(Request $request, string $table, array $data, object|array|null $existingRecord = null): array
    {
        $rec = (object) ($existingRecord ?? []);
        // Si el valor llega nulo o vacío, eliminamos el archivo previo existente
        foreach ($data as $key => $val) {
            if (empty($val) && !empty($rec->{$key})) { $this->deleteFileAndThumb($rec->{$key}); }
        }
        // Subir nuevos archivos y limpiar el anterior si existía
        foreach ($request->allFiles() as $key => $file) {
            if (!empty($rec->{$key})) { $this->deleteFileAndThumb($rec->{$key}); }
            $data[$key] = "/storage/" . $this->processAndStoreFile($file, $table);
        }
        return $data;
    }
    protected function deleteRecordFiles(object|array $record): void
    {
        foreach ((array) $record as $val) {
            if (is_string($val) && str_starts_with($val, '/storage/')) { $this->deleteFileAndThumb($val); }
        }
    }
}