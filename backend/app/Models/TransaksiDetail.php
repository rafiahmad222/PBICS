<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TransaksiDetail extends Model
{
    use HasUuids;

    protected $table = 'transaksi_details';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'transaksi_id',
        'itemable_id',
        'itemable_type',
        'nama_item',
        'qty',
        'harga',
        'total_harga'
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id');
    }

    public function itemable()
    {
        return $this->morphTo();
    }
}
