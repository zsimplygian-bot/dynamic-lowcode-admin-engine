<?php
namespace App\Traits;
use Illuminate\Support\Facades\Schema;
trait HasProtectedTables
{
    protected array $blacklistedTables = [
        'cache',
        'cache_locks',
        'database_history',
        'failed_jobs',
        'job_batches',
        'jobs',
        'migrations',
        'model_has_permissions',
        'model_has_roles',
        'password_reset_tokens',
        'permissions',
        'personal_access_tokens',
        'role_has_permissions',
        'roles',
        'sessions',
        'users',
    ];
    protected function isBlacklisted(string $table): bool { return in_array(trim($table), $this->blacklistedTables, true); }
}