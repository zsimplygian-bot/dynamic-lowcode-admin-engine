<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
class Database
{
    protected const SYSTEM_DATABASES = "'information_schema', 'mysql', 'performance_schema', 'sys'";
    public function all(): array { return array_column(DB::select("SHOW DATABASES WHERE `Database` NOT IN (" . self::SYSTEM_DATABASES . ")"), 'Database'); }
}