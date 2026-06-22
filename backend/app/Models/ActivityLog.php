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
        'karyawan_id',
        'action',
        'module',
        'details',
        'created_at'
    ];

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id', 'id');
    }
}