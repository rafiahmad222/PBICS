<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PengajuanCuti extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Pengajuan Cuti Karyawan';
    public static $logNameAttribute = 'jenis_cuti';

    protected $table = 'pengajuan_cuti';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'karyawan_id',
        'jenis_cuti',
        'tanggal_mulai',
        'tanggal_selesai',
        'alasan',
        'gambar_bukti_cuti',
        'status_pengajuan',
    ];

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id', 'id');
    }
}
