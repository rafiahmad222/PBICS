<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketBundling extends Model
{
    protected $fillable = [
        'Kode_paket',
        'Nama_paket',
        'Deskripsi',
        'Harga_paket',
        'Harga_Distributor_paket'
    ];

    public function produks()
    {
        return $this->belongsToMany(StokProduk::class, 'paket_bundling_produks', 'paket_bundling_id', 'stok_produk_id')
                    ->withPivot('Jumlah')
                    ->withTimestamps();
    }
}
