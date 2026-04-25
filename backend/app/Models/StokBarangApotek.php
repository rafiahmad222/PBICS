<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarangApotek extends Model
{
    use HasFactory;

    protected $table = 'stok_barang_apotek';

    protected $fillable = [
        'Nama_barang_apotek',
        'Kategori',
        'Stok',
        'Batas_minimal_stok',
    ];
}
