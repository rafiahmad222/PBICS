<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokRacikan extends Model
{
    use \App\Traits\LogsActivity;

    protected static $logModule = 'Stok Racikan';
    protected static $logNameAttribute = 'nama_obat_racik';

    protected $fillable = [
        'nama_obat_racik',
        'deskripsi_racikan',
        'harga',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
    ];
}
