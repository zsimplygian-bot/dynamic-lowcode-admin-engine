<?php
namespace App\Traits;
use Illuminate\Support\Facades\Schema;
trait HasProtectedTables
{
    protected array $blacklistedTables = [ // Tablas del sistema que nunca deben ser accedidas dinámicamente.
        'migrations',
        'failed_jobs',
        'password_reset_tokens',
        'personal_access_tokens',
        'sessions',
        'jobs',
        'job_batches',
        'cache',
        'cache_locks',
    ];
    protected function validateTable(string $table): void
    {
        if (in_array($table, $this->blacklistedTables, true) || !Schema::hasTable($table)) {
            abort(404, "La tabla [{$table}] no existe o está restringida.");
        }
    }
}