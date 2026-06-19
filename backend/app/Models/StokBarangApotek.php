<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarangApotek extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Stok Barang Apotek';
    protected static $logNameAttribute = 'Nama_barang_apotek';

    protected $table = 'stok_barang_apotek';

    protected $fillable = [
        'Nama_barang_apotek',
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
