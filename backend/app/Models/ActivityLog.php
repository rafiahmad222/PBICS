<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ActivityLog extends Model
{
    use HasUuids;

    protected $table = 'activity_logs';
    protected $keyType = 'string';
    public $incrementing = false;

    public $timestamps = false;
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'details',
        'created_at'
    ];

    public function user()
    {
        return $this->belongsTo(DataKaryawan::class, 'user_id', 'id');
    }
}