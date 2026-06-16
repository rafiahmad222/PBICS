<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\ShiftsDateAfterFivePM;

class Transaksi extends Model
{
    use HasUuids, ShiftsDateAfterFivePM;

    protected $shiftDateColumns = ['tanggal_transaksi'];

    protected $table = 'transaksis';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'tipe_transaksi',
        'no_faktur',
        'no_resi',
        'data_pasien_id',
        'distributor_id',
        'nama_pasien_distributor',
        'alamat_pengiriman',
        'karyawan_id',
        'tanggal_transaksi',
        'catatan_pesanan',
        'status',
        'total_keseluruhan',
        'metode_pembayaran'
    ];

    public function pasien()
    {
        return $this->belongsTo(DataPasien::class, 'data_pasien_id');
    }

    public function distributor()
    {
        return $this->belongsTo(Distributor::class, 'distributor_id');
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
