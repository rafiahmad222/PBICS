<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanMedis extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Stok Bahan Medis';
    protected static $logNameAttribute = 'Nama_bahan_medis';

    protected $table = 'stok_bahan_medis';

    protected $fillable = [
        'Nama_bahan_medis',
        'Kode_Produk',
        'Kategori',
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
