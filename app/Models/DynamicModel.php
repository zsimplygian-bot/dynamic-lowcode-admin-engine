<?php
namespace App\Models;
use App\Traits\HasAuditFields;
use Illuminate\Database\Eloquent\Model;
class DynamicModel extends Model
{
    use HasAuditFields; // Automáticamente maneja creater_id y updater_id
    protected $guarded = [];
    public static function fromTable(string $table): static
    {
        $instance = new static();
        $instance->setTable($table);
        $instance->setKeyName("id_{$table}");
        return $instance;
    }
    public function newInstance($attributes = [], $exists = false): static
    {
        $model = parent::newInstance($attributes, $exists);
        $model->setTable($this->getTable());
        $model->setKeyName($this->getKeyName());
        return $model;
    }
    public function newModelQuery()
    {
        $query = parent::newModelQuery();
        $query->getModel()->setTable($this->getTable());
        $query->getModel()->setKeyName($this->getKeyName());
        return $query;
    }
}