<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaksi extends Model
{
    use HasUuids;

    protected $table = 'transaksis';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'no_faktur',
        'no_resi',
        'data_pasien_id',
        'nama_pasien_distributor',
        'alamat_pengiriman',
        'karyawan_id',
        'tanggal_transaksi',
        'catatan_pesanan',
        'status',
        'total_keseluruhan'
    ];

    public function pasien()
    {
        return $this->belongsTo(DataPasien::class, 'data_pasien_id');
    }

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id');
    }

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class, 'transaksi_id');
    }
}
