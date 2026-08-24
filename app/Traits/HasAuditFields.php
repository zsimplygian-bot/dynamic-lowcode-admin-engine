<?php
namespace App\Traits;
use Illuminate\Http\Request;
trait HasAuditFields
{
    protected function applyCreationAudit(array $data, Request $request): array
    {
        $userId = $request->user()?->id;
        return array_merge($data, [ 'creater_id' => $userId, 'updater_id' => $userId ]);
    }
    protected function applyUpdateAudit(array $data, Request $request): array
    {
        return array_merge($data, [ 'updater_id' => $request->user()?->id ]);
    }
}