<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanInfus extends Model
{
    use HasFactory;

    protected $table = 'stok_bahan_infus';

    protected $fillable = [
        'Nama_bahan_Infus',
        'Kategori',
        'Stok',
        'Batas_minimal_stok',
    ];
}
