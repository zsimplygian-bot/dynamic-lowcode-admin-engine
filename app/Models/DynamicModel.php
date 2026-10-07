<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use DateTimeInterface;
class DynamicModel extends Model
{
    public $timestamps = false;
    protected $guarded = [];
    protected $casts = [ 'fecha' => 'datetime', ];
    protected function serializeDate(DateTimeInterface $date): string { return $date->format('Y-m-d H:i:s'); }
    public static function fromTable(string $table): static
    {
        $instance = new static();
        $instance->setTable($table);
        return $instance;
    }
    public function newInstance($attributes = [], $exists = false): static
    {
        $model = parent::newInstance($attributes, $exists);
        $model->setTable($this->getTable());
        return $model;
    }
}