<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromoVoucher extends Model
{
    use HasUuids;

    protected $table = 'promo_vouchers';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'promo_id',
        'kode_voucher',
        'is_used',
        'used_at',
        'used_by_transaction_id'
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime'
    ];

    public function promo()
    {
        return $this->belongsTo(Promo::class, 'promo_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaksi::class, 'used_by_transaction_id');
    }
}
