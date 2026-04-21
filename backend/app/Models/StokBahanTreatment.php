<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanTreatment extends Model
{
    use HasFactory;

    protected $table = 'stok_bahan_treatments';

    protected $fillable = [
        'Kode_Produk',
        'Nama_produk',
        'Kategori',
        'Harga',
        'Stok',
    ];
}
