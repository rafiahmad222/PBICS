<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBahanTreatment extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Stok Bahan Treatment';
    protected static $logNameAttribute = 'Nama_produk';

    protected $table = 'stok_bahan_treatments';

    protected $fillable = [
        'Kode_Produk',
        'Nama_produk',
        'Kategori',
        'Harga',
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
    public function treatmentBahans()
{
    return $this->morphMany(TreatmentBahan::class, 'bahan');
}

}
