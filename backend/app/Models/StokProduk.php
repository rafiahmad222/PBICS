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
        'Stok',
        'Batas_minimal_stok',
    ];
}
