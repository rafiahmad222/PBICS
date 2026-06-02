<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HariLibur extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Manajemen Hari Libur';
    public static $logNameAttribute = 'nama_hari_libur';

    protected $table = 'hari_libur';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'nama_hari_libur',
        'jenis_hari_libur',
        'tanggal_mulai',
        'tanggal_selesai',
        'keterangan',
    ];
}
