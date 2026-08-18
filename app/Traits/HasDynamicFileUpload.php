<?php
namespace App\Traits;
use App\Models\DynamicModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
trait HasDynamicFileUpload
{
    use HasImageProcessing;
    protected function handleFilesUpload(Request $request, string $tabla, array $data, ?DynamicModel $existingRecord = null): array
    {
        if ($existingRecord) {
            foreach ($existingRecord->getAttributes() as $key => $value) {
                $removeKey = "_remove_{$key}";
                if ($request->boolean($removeKey) || ($request->has($key) && is_null($request->input($key)))) {
                    if (!empty($value)) {
                        $this->deleteFileAndThumb($value);
                    }
                    $data[$key] = null;
                }
            }
        }
        $files = array_filter($request->allFiles(), fn($f) => $f->isValid());
        if (empty($files)) {
            return $data;
        }
        foreach ($files as $key => $file) {
            $oldPath = $existingRecord->{$key} ?? null;
            $savedPath = $this->processAndStoreFile($file, $tabla, $oldPath);
            $data[$key] = Storage::url($savedPath);
        }

        return $data;
    }
    protected function deleteRecordFiles(DynamicModel $record): void
    {
        foreach ($record->getAttributes() as $value) {
            if (is_string($value) && str_contains($value, '/storage/')) {
                $this->deleteFileAndThumb($value);
            }
        }
    }
}