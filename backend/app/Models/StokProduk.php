<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokProduk extends Model
{
    use HasFactory;

    protected $table = 'stok_produks';

    protected $fillable = [
        'Kode_Produk',
        'Nama_produk',
        'Kategori',
        'Harga',
        'Harga_Distributor',
        'Stok',
        'Batas_minimal_stok',
    ];

    public function paketBundlings()
    {
        return $this->belongsToMany(PaketBundling::class, 'paket_bundling_produks', 'stok_produk_id', 'paket_bundling_id')
                    ->withPivot('Jumlah')
                    ->withTimestamps();
    }

    public function rekamMedis()
    {
        return $this->belongsToMany(RekamMedis::class, 'rekam_medis_reseps', 'stok_produk_id', 'rekam_medis_id')
                    ->withPivot('jumlah')
                    ->withTimestamps();
    }
}
