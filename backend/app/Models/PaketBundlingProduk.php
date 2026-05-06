<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketBundlingProduk extends Model
{
    protected $table = 'paket_bundling_produks';

    protected $fillable = [
        'paket_bundling_id',
        'stok_produk_id',
        'Jumlah'
    ];

    public function paketBundling()
    {
        return $this->belongsTo(PaketBundling::class, 'paket_bundling_id');
    }

    public function stokProduk()
    {
        return $this->belongsTo(StokProduk::class, 'stok_produk_id');
    }
}
