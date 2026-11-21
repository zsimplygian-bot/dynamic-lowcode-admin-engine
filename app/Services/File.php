<?php
namespace App\Services;
use Illuminate\Http\{Request, UploadedFile};
use Illuminate\Support\Facades\{DB, Storage};
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
class File
{
    public function handle(Request $req, string $t, array $data, object|array|null $old = null): array
    {
        if (!$req->allFiles()) return $data;
        $old = (array) ($old ?? []);
        foreach ($req->allFiles() as $k => $file) {
            if (!empty($old[$k])) $this->deleteFileAndFull($old[$k]);
            $data[$k] = $this->processAndStore($file, $t);
        }
        return $data;
    }
    public function deleteRecordFiles(object|array $record): void
    {
        foreach ((array) $record as $val) {
            if (is_string($val) && str_starts_with($val, '/storage/')) $this->deleteFileAndFull($val);
        }
    }
    protected function processAndStore(UploadedFile $file, string $t): string
    {
        $dir = DB::connection()->getDatabaseName() . '/' . $t;
        $name = time() . '_' . Str::random(5);
        $ext = strtolower($file->guessExtension() ?? 'jpg');
        $img = ImageManager::usingDriver(GdDriver::class)->decodePath($file->getRealPath());
        $disk = Storage::disk('public');
        $disk->put("{$dir}/{$name}.{$ext}", (clone $img)->scaleDown(89, 50)->encodeUsingFileExtension($ext, 80)->toString());
        $disk->put("{$dir}/{$name}_full.{$ext}", (clone $img)->scaleDown(1280, 720)->encodeUsingFileExtension($ext, 85)->toString());
        return "/storage/{$dir}/{$name}.{$ext}";
    }
    protected function deleteFileAndFull(?string $path): void
    {
        if (!$path) return;
        $rel = str_replace('/storage/', '', $path);
        $full = preg_replace('/\.([^.]+)$/', '_full.$1', $rel);
        Storage::disk('public')->delete([$rel, $full]);
    }
}