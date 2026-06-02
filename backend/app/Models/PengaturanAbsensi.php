<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PengaturanAbsensi extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Pengaturan Absensi Karyawan';
    public static $logNameAttribute = 'tanggal';

    protected $table = 'pengaturan_absensi';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'karyawan_id',
        'tanggal',
        'ket_shift',
        'lokasi_checkin',
        'lokasi_checkout',
        'keterangan',
    ];

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id', 'id');
    }
}
