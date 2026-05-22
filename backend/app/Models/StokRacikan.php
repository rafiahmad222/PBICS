<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokRacikan extends Model
{
    protected $fillable = [
        'nama_obat_racik',
        'deskripsi_racikan',
        'harga',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
    ];
}
