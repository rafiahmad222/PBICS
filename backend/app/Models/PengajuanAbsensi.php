<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PengajuanAbsensi extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Pengajuan Absensi Karyawan';
    public static $logNameAttribute = 'tipe_pengajuan';

    protected $table = 'pengajuan_absensi';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'absensi_id',
        'karyawan_id',
        'tipe_pengajuan',
        'durasi',
        'alasan_keterangan',
        'status_pengajuan',
    ];

    public function absensi()
    {
        return $this->belongsTo(Absensi::class, 'absensi_id', 'id');
    }

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id', 'id');
    }
}
