<?php
namespace App\Traits;
trait HasProtectedTables
{
    protected array $protectedTables = [
        'audit',
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
    protected function isProtected(string $table): bool { return in_array(trim($table), $this->protectedTables, true); }
}