<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanInfus extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Stok Bahan Infus';
    protected static $logNameAttribute = 'Nama_bahan_infus';

    protected $table = 'stok_bahan_infus';

    protected $fillable = [
        'Nama_bahan_infus',
        'Kode_Produk',
        'Stok',
        'Batas_minimal_stok',
    ];

    /**
     * Mutator to ensure stock cannot be negative.
     */
    public function setStokAttribute($value)
    {
        $this->attributes['Stok'] = max(0, $value);
    }
}
