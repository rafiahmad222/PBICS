<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanMedis extends Model
{
    use HasFactory;

    protected $table = 'stok_bahan_medis';

    protected $fillable = [
        'Nama_bahan_medis',
        'Kode_bahan_medis',
        'Kategori',
        'Stok',
        'Batas_minimal_stok',
    ];
}
